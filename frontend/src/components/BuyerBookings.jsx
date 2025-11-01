import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle2, Clock, MapPin, XCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import toast from 'react-hot-toast'
import { useCarContext } from '../context/CarContext'
import { formatPrice } from '../utils/formatters'

const statusBadge = (s) => s === 'confirmed' ? 'badge-success' : s === 'rejected' ? 'badge-error' : 'badge-warning'

const BuyerBookings = () => {
  const navigate = useNavigate()
  const { user, getAuthToken } = useAuth()
  const { bookingsByCar, getCarBookings, getMyBookings, updateBookingStatus, API_BASE } = useBooking()
  const { cars } = useCarContext()

  const [filter, setFilter] = useState('all')
  const [missingCars, setMissingCars] = useState({}) // carId -> minimal car info

  const canCancelBooking = (b) => {
    // Allow cancel if status is pending or confirmed AND current date is before startDate
    const now = new Date()
    const start = new Date(b.startDate)
    return (b.status === 'pending' || b.status === 'confirmed') && now < start
  }

  // Optionally ensure we have bookings loaded for known cars
  useEffect(() => {
    const load = async () => {
      try {
        // Load for all known cars to hydrate cache if backend present
        await Promise.all((cars || []).map(c => getCarBookings(c.id)))
      } catch (_) {}
    }
    if (cars.length) load()
  }, [cars, getCarBookings])

  // Also load my bookings from backend to ensure visibility even if car list is empty
  useEffect(() => {
    const hydrateMine = async () => {
      try {
        const token = getAuthToken()
        await getMyBookings(token)
      } catch (_) {}
    }
    hydrateMine()
  }, [getMyBookings, getAuthToken])

  // Periodically poll my bookings to reflect seller status updates (e.g., confirmed)
  useEffect(() => {
    let timer
    const run = async () => {
      try {
        const token = getAuthToken()
        if (token) {
          await getMyBookings(token)
        }
      } catch (_) {}
    }
    timer = setInterval(run, 10000) // 10s
    return () => { if (timer) clearInterval(timer) }
  }, [getMyBookings, getAuthToken])

  

  // Fetch details for any carIds present in my bookings but missing from local cars
  useEffect(() => {
    const myBookingCarIds = new Set()
    for (const [carId, arr] of Object.entries(bookingsByCar || {})) {
      for (const b of (arr || [])) {
        const userId = user?.id || user?._id
        const buyerId = b.buyerId || b._id
        if ((user?.email && b.buyerEmail === user.email) || (userId && (buyerId === userId || b.buyerId === userId))) {
          myBookingCarIds.add(carId)
        }
      }
    }
    const needFetch = Array.from(myBookingCarIds).filter(id => !cars.find(c => c.id === id) && !missingCars[id])
    if (!needFetch.length) return
    const run = async () => {
      await Promise.all(needFetch.map(async (cid) => {
        try {
          const res = await fetch(`${API_BASE}/api/cars/${cid}`)
          if (res.ok) {
            const car = await res.json()
            setMissingCars(prev => ({
              ...prev,
              [cid]: {
                id: car._id,
                title: car.title || (car.year && car.make && car.model ? `${car.year} ${car.make} ${car.model}` : 'Car'),
                image: typeof car.images?.[0] === 'string' ? car.images[0] : car.images?.[0]?.url,
                location: `${car.location?.city || 'Unknown'}, ${car.location?.state || 'Unknown'}`,
                listingType: car.listingType,
                price: car.price,
              }
            }))
          }
        } catch (_) {}
      }))
    }
    run()
  }, [bookingsByCar, cars, user?.email, user?.id, API_BASE, missingCars])

  const rows = useMemo(() => {
    const list = []
    // Flatten all bookings across cars
    console.log('BuyerBookings - Current user:', user)
    console.log('BuyerBookings - All bookings:', bookingsByCar)
    
    for (const [carId, arr] of Object.entries(bookingsByCar || {})) {
      for (const b of (arr || [])) {
        // match this buyer (by email or id when available) - handle both id and _id
        const userId = user?.id || user?._id
        const buyerId = b.buyerId || b._id
        
        console.log('Checking booking:', { 
          bookingBuyerEmail: b.buyerEmail, 
          userEmail: user?.email,
          bookingBuyerId: buyerId,
          userId: userId,
          match: (user?.email && b.buyerEmail === user.email) || (userId && (buyerId === userId || b.buyerId === userId))
        })
        
        if ((user?.email && b.buyerEmail === user.email) || (userId && (buyerId === userId || b.buyerId === userId))) {
          const carLocal = cars.find(c => c.id === carId)
          const carRemote = missingCars[carId]
          const car = carLocal || carRemote || {}
          const title = car.title || (car.year && car.make && car.model ? `${car.year} ${car.make} ${car.model}` : 'Car')
          const image = typeof car.images?.[0] === 'string' ? car.images[0] : (car.images?.[0]?.url || car.image)
          const location = (
            (typeof car.fullLocation === 'string' && car.fullLocation.trim()) ? car.fullLocation :
            (typeof car.location === 'string' && car.location.trim()) ? car.location :
            `${car.location?.city || 'Unknown'}, ${car.location?.state || 'Unknown'}`
          )

          // price calc for rentals
          const ms = new Date(b.endDate) - new Date(b.startDate)
          const days = Math.max(1, Math.ceil(ms / (1000*60*60*24)))
          const total = car.listingType === 'rent' ? (Number(car.price) || 0) * days : (Number(car.price) || 0)

          list.push({ ...b, _car: { id: carId, title, image, location, listingType: car.listingType, price: car.price }, _days: days, _total: total })
        }
      }
    }
    // sort newest first
    return list.sort((a,b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
  }, [bookingsByCar, cars, user?.email, user?.id])

  const filtered = rows.filter(r => filter === 'all' ? true : r.status === filter)

  const handleCancel = async (b) => {
    try {
      const token = getAuthToken()
      // Buyers should set status to 'cancelled' (seller uses 'declined')
      await updateBookingStatus({ token, carId: b.carId, bookingId: b._id, status: 'cancelled' })
      toast.success('Booking cancelled')
    } catch (e) {
      toast.error('Failed to cancel booking')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between ">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('confirmed')} className={`btn btn-sm ${filter==='confirmed' ? 'btn-primary' : 'btn-outline btn-primary'}`}>
              <CheckCircle2 className="w-4 h-4" /> CAR'S PREMIUM
            </button>
            <button onClick={() => setFilter('pending')} className={`btn btn-sm ${filter==='pending' ? 'btn-warning' : 'btn-outline btn-warning' }`}>
              <Clock className="w-4 h-4" /> Pending
            </button>
            <button onClick={() => setFilter('rejected')} className={`btn btn-sm ${filter==='rejected' ? 'btn-error' : 'btn-outline btn-error'}`}>
              <XCircle className="w-4 h-4" /> Rejected
            </button>
            <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter==='all' ? 'btn-neutral' : 'btn-outline'}`}>
              All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="card bg-white shadow-xl border border-gray-100">
            <div className="card-body text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-base-content dark:text-black">No bookings found</h3>
              <p className="text-gray-500 text-base-content dark:text-black">Your {filter==='confirmed'?'approved ':filter==='pending'?'pending ':filter==='rejected'?'rejected ':''}bookings will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(b => (
              <div key={b._id} className="card bg-white shadow-xl border border-gray-100">
                <div className="card-body">
                  <div className="flex gap-3">
                    <img src={b._car.image || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop'} alt={b._car.title} className="w-28 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base text-base-content dark:text-black">{b._car.title}</h3>
                          <div className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {b._car.location}
                          </div>
                        </div>
                        <span className={`badge ${statusBadge(b.status)}`}>{b.status}</span>
                      </div>
                      <div className="mt-2 text-sm flex items-center gap-2 text-base-content dark:text-black ">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} ({b._days} day{b._days>1?'s':''})</span>
                      </div>
                      <div className="mt-2 text-sm">
                        {b._car.listingType === 'rent' ? (
                          <>
                            <div className='text-base-content dark:text-black'>Daily Rate: <span className="font-semibold text-base-content dark:text-black">{formatPrice(b._car.price, 'rent')}</span></div>
                            <div className='text-base-content dark:text-black'>Total: <span className="font-bold text-blue-600 text-base-content dark:text-black">{formatPrice(b._total, 'rent')}</span></div>
                          </>
                        ) : (
                          <div className='text-base-content dark:text-black'>Price: <span className="font-bold text-blue-600 text-base-content dark:text-black">{formatPrice(b._car.price, 'sale')}</span></div>
                        )}
                      </div>
                      {canCancelBooking(b) && (
                        <div className="mt-3 flex justify-end">
                          <button onClick={() => handleCancel(b)} className="btn btn-ghost btn-sm text-error">
                            Cancel booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default BuyerBookings
