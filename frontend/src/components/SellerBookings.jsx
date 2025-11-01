import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Car, Check, Clock, Filter, Mail, Phone, Search, X, ArrowLeft, MapPin, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useBooking } from '../context/BookingContext'
import toast from 'react-hot-toast'
import { formatPrice } from '../utils/formatters'

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  rejected: 'badge-error'
}

const SellerBookings = () => {
  const navigate = useNavigate()
  const { user, getAuthToken } = useAuth()
  const { cars, getCarsBySeller } = useCarContext()
  const { bookingsByCar, getCarBookings, updateBookingStatus, API_BASE } = useBooking()

  const [sellerCars, setSellerCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [missingCars, setMissingCars] = useState({}) // carId -> minimal car info (including sellerId)

  // Load seller cars by filtering full list to handle sellerId mismatches
  useEffect(() => {
    try {
      const sidA = user?._id
      const sidB = user?.id
      const mine = (cars || []).filter(c => c && (c.sellerId === sidA || c.sellerId === sidB))
      setSellerCars(mine)
    } catch (_) {
      setSellerCars([])
    } finally {
      setLoading(false)
    }
  }, [cars, user?._id, user?.id])

  // Load bookings for each seller car (prefer backend _id when available)
  useEffect(() => {
    const load = async () => {
      try {
        const ids = Array.from(new Set((sellerCars || []).map(c => (c._id || c.id)).filter(Boolean)))
        await Promise.all(ids.map(cid => getCarBookings(cid)))
      } catch (_) {
        // ignore
      }
    }
    if (sellerCars.length) load()
  }, [sellerCars, getCarBookings])

  // Fetch details for any carIds present in bookings but missing from local sellerCars
  useEffect(() => {
    const knownIds = new Set((sellerCars || []).flatMap(c => [c._id, c.id]).filter(Boolean))
    const toFetch = Object.keys(bookingsByCar || {})
      .filter(cid => !knownIds.has(cid) && !missingCars[cid])
    if (!toFetch.length) return
    const run = async () => {
      await Promise.all(toFetch.map(async (cid) => {
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
                // ensure string location
                location: (
                  (typeof car.fullLocation === 'string' && car.fullLocation.trim()) ? car.fullLocation :
                  (typeof car.location === 'string' && car.location.trim()) ? car.location :
                  `${car.location?.city || 'Unknown'}, ${car.location?.state || 'Unknown'}`
                ),
                listingType: car.listingType,
                price: car.price,
                sellerId: (
                  car.sellerId ||
                  (car.seller && typeof car.seller === 'object' ? car.seller._id : (typeof car.seller === 'string' ? car.seller : '')) ||
                  car.ownerId ||
                  ''
                ),
              }
            }))
          }
        } catch (_) { /* ignore */ }
      }))
    }
    run()
  }, [bookingsByCar, sellerCars, API_BASE, missingCars])

  

  // Ensure bookings are hydrated for fetched backend-only car IDs
  useEffect(() => {
    const ids = Object.keys(missingCars || {})
    if (!ids.length) return
    Promise.all(ids.map(cid => getCarBookings(cid).catch(() => []))).catch(() => {})
  }, [missingCars, getCarBookings])

  // Flatten bookings with resolved car context (supports backend-only carIds)
  const rows = useMemo(() => {
    const list = []
    const currentSellerId = user?._id || user?.id || 'seller_1'
    for (const [carId, bookings] of Object.entries(bookingsByCar || {})) {
      const localCar = sellerCars.find(c => (c._id || c.id) === carId)
      const remoteCar = missingCars[carId]
      const car = localCar || remoteCar
      if (!car) continue
      // If no local seller cars identified, show all bookings (no ownership filter)
      if (sellerCars.length > 0) {
        const ownedLocally = !!localCar
        const sellerMatches = !car.sellerId || car.sellerId === currentSellerId
        if (!(ownedLocally || sellerMatches)) continue
      }
      for (const b of (bookings || [])) {
        const ms = new Date(b.endDate) - new Date(b.startDate)
        const days = Math.max(1, Math.ceil(ms / (1000*60*60*24)))
        const isRent = car.listingType === 'rent'
        const total = isRent ? (Number(car.price) || 0) * days : (Number(car.price) || 0)
        // ensure location is a string
        const location = (
          (typeof car.fullLocation === 'string' && car.fullLocation?.trim()) ? car.fullLocation :
          (typeof car.location === 'string' && car.location?.trim()) ? car.location :
          `${car.location?.city || 'Unknown'}, ${car.location?.state || 'Unknown'}`
        )
        list.push({
          ...b,
          _car: {
            id: car.id || carId,
            title: car.title || `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim(),
            image: typeof car.images?.[0] === 'string' ? car.images[0] : (car.images?.[0]?.url || car.image),
            location,
            listingType: car.listingType,
            price: car.price,
          },
          _days: days,
          _total: total,
        })
      }
    }
    // sort newest first
    return list.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
  }, [sellerCars, bookingsByCar, missingCars, user?.id])

  const filtered = rows.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    const q = search.toLowerCase()
    const matchesSearch = !q || (
      r._car.title.toLowerCase().includes(q) ||
      (r.buyerName || '').toLowerCase().includes(q) ||
      (r.buyerEmail || '').toLowerCase().includes(q)
    )
    return matchesStatus && matchesSearch
  })

  const act = async (r, status) => {
    const token = getAuthToken()
    try {
      await updateBookingStatus({ token, carId: r.carId, bookingId: r._id, status })
      toast.success(status === 'confirmed' ? 'Booking approved' : 'Booking rejected')
    } catch (e) {
      toast.error('Failed to update booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="navbar-start">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-circle">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 ml-4">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bookings
              </h1>
              <p className="text-base-content/70">Review and manage booking requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search by car, buyer name, or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input input-bordered w-full pl-10"
                />
              </div>
              <div className="form-control w-full md:w-44">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select select-bordered">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body text-center py-16">
              <Calendar className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-base-content/70">You will see booking requests here when buyers request rentals.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <div key={r._id} className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                  <div className="flex items-start gap-3">
                    <img
                      src={r._car.image || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop'}
                      alt={r._car.title}
                      className="w-28 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-base">{r._car.title}</h3>
                          <div className="text-xs text-base-content/70 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{r._car.location}</span>
                          </div>
                        </div>
                        <span className={`badge ${statusColors[r.status] || 'badge-ghost'}`}>{r.status}</span>
                      </div>
                      <div className="mt-2 text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()} ({r._days} day{r._days>1?'s':''})</span>
                      </div>
                      <div className="mt-2 text-sm">
                        {r._car.listingType === 'rent' ? (
                          <>
                            <div>Daily Rate: <span className="font-semibold">{formatPrice(r._car.price, 'rent')}</span></div>
                            <div>Total: <span className="font-bold text-primary">{formatPrice(r._total, 'rent')}</span></div>
                          </>
                        ) : (
                          <div>Price: <span className="font-bold text-primary">{formatPrice(r._car.price, 'sale')}</span></div>
                        )}
                      </div>
                      {(r.buyerName || r.buyerEmail || r.buyerPhone) && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {r.buyerName && <div className="font-medium">{r.buyerName}</div>}
                          {r.buyerEmail && (
                            <div className="flex items-center gap-1 text-base-content/70">
                              <Mail className="w-3 h-3" />
                              <span>{r.buyerEmail}</span>
                            </div>
                          )}
                          {r.buyerPhone && (
                            <div className="flex items-center gap-1 text-base-content/70">
                              <Phone className="w-3 h-3" />
                              <span>{r.buyerPhone}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {r.notes && (
                        <div className="mt-2 text-xs p-2 rounded bg-base-200 text-base-content/80">
                          <span className="font-semibold">Buyer notes:</span> {r.notes}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/car/${r._car.id}`)}>
                          <ExternalLink className="w-4 h-4" /> View Car
                        </button>
                        {r.status === 'pending' ? (
                          <>
                            <button className="btn btn-ghost btn-sm text-error" onClick={() => act(r, 'rejected')}>
                              <X className="w-4 h-4" /> Reject
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => act(r, 'confirmed')}>
                              <Check className="w-4 h-4" /> Approve
                            </button>
                          </>
                        ) : r.status === 'confirmed' ? (
                          <button className="btn btn-ghost btn-sm" onClick={() => act(r, 'rejected')}>
                            <X className="w-4 h-4" /> Mark Rejected
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => act(r, 'confirmed')}>
                            <Check className="w-4 h-4" /> Mark Approved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerBookings
