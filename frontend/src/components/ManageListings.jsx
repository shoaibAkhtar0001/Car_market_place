import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useBooking } from '../context/BookingContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit3, Trash2, Eye, DollarSign, Calendar, MapPin, Car, Search, Filter, MoreVertical } from 'lucide-react'
import CarCard from './shared/CarCard'

const ManageListings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getCarsBySeller, updateCar, deleteCar, lastUpdate } = useCarContext()
  const { getCarBookings, bookingsByCar, updateBookingStatus } = useBooking()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [bookingsLoaded, setBookingsLoaded] = useState(false)

  useEffect(() => {
    // Get seller's cars from context
    const fetchListings = () => {
      try {
        setLoading(true)
        const sellerCars = getCarsBySeller(user?.id || 'seller_1')
        setListings(sellerCars)
        console.log(`ManageListings: Found ${sellerCars.length} cars for seller ${user?.id || 'seller_1'}`)
      } catch (error) {
        console.error('Error fetching seller cars:', error)
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [getCarsBySeller, user?.id, lastUpdate])

  // Load bookings for each listing
  useEffect(() => {
    const loadAll = async () => {
      if (!listings || listings.length === 0) return
      try {
        await Promise.all(
          listings.map(l => getCarBookings(l.id))
        )
        setBookingsLoaded(true)
      } catch (e) {
        // ignore per-car failures; local fallback still shows
        setBookingsLoaded(true)
      }
    }
    loadAll()
  }, [listings])

  const filteredListings = listings.filter(listing => {
    const matchesSearch = `${listing.make} ${listing.model} ${listing.year}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.datePosted) - new Date(a.datePosted)
      case 'oldest':
        return new Date(a.datePosted) - new Date(b.datePosted)
      case 'price-high':
        return b.price - a.price
      case 'price-low':
        return a.price - b.price
      case 'views':
        return b.views - a.views
      default:
        return 0
    }
  })

  const handleEdit = (id) => {
    navigate(`/seller/edit-listing/${id}`)
  }

  const handleDelete = (id) => {
    const car = listings.find(listing => listing.id === id)
    const carTitle = car ? car.title || `${car.year} ${car.make} ${car.model}` : 'this car'
    
    if (window.confirm(`Are you sure you want to delete "${carTitle}"? This action cannot be undone.`)) {
      const loadingToast = toast.loading('Deleting car listing...')
      
      try {
        deleteCar(id)
        // Update local state to reflect the change immediately
        setListings(prev => prev.filter(listing => listing.id !== id))
        toast.success(`🗑️ "${carTitle}" deleted successfully!`, { id: loadingToast })
      } catch (error) {
        toast.error('Failed to delete car listing', { id: loadingToast })
      }
    }
  }

  const handleStatusChange = (id, newStatus) => {
    const car = listings.find(listing => listing.id === id)
    const carTitle = car ? car.title || `${car.year} ${car.make} ${car.model}` : 'Car'
    
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`)
    
    try {
      updateCar(id, { status: newStatus })
      // Update local state to reflect the change immediately
      setListings(prev => prev.map(listing => 
        listing.id === id ? { ...listing, status: newStatus } : listing
      ))
      
      const statusEmoji = newStatus === 'active' ? '✅' : newStatus === 'sold' ? '💰' : '⏳'
      toast.success(`${statusEmoji} "${carTitle}" status updated to ${newStatus}!`, { id: loadingToast })
    } catch (error) {
      toast.error('Failed to update car status', { id: loadingToast })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>
      case 'sold':
        return <span className="badge badge-error">Sold</span>
      case 'pending':
        return <span className="badge badge-warning">Pending</span>
      default:
        return <span className="badge badge-ghost">Unknown</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold">Loading your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="navbar-start">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 ml-4">
            <Car className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Manage Listings
              </h1>
              <p className="text-base-content/70">Edit and manage your car listings</p>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <button 
            onClick={() => navigate('/seller/add-listing')}
            className="btn btn-primary"
          >
            Add New Listing
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Listings</p>
              <p className="text-3xl font-black">{listings.length}</p>
            </div>
          </div>
          <div className="card bg-success text-success-content shadow-xl">
            <div className="card-body items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Active</p>
              <p className="text-3xl font-black">{listings.filter(l => l.status === 'active').length}</p>
            </div>
          </div>
          <div className="card bg-warning text-warning-content shadow-xl">
            <div className="card-body items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Pending</p>
              <p className="text-3xl font-black">{listings.filter(l => l.status === 'pending').length}</p>
            </div>
          </div>
          <div className="card bg-error text-error-content shadow-xl">
            <div className="card-body items-center text-center">
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Sold</p>
              <p className="text-3xl font-black">{listings.filter(l => l.status === 'sold').length}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search by make, model, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full pl-10"
                  />
                </div>
              </div>
              
              <div className="form-control">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              
              <div className="form-control">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="select select-bordered"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body text-center py-16">
              <Car className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-base-content/70 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by creating your first car listing'
                }
              </p>
              <button 
                onClick={() => navigate('/seller/add-listing')}
                className="btn btn-primary"
              >
                Add New Listing
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300">
                <figure className="px-4 pt-4">
                  <img
                    src={typeof listing.images?.[0] === 'string' 
                      ? listing.images[0] 
                      : listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'}
                    alt={`${listing.make} ${listing.model}`}
                    className="rounded-xl w-full h-48 object-cover"
                  />
                </figure>
                
                <div className="card-body">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="card-title text-lg">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                        <MoreVertical className="w-4 h-4" />
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                          <button onClick={() => handleEdit(listing.id)}>
                            <Edit3 className="w-4 h-4" />
                            Edit Listing
                          </button>
                        </li>
                        <li>
                          <button onClick={() => navigate(`/car/${listing.id}`)}>
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => handleDelete(listing.id)}
                            className="text-error"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2">
                    <DollarSign className="w-5 h-5" />
                    {listing.price.toLocaleString()}
                  </div>
                  
                  <div className="flex items-center gap-2 text-base-content/70 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <div>
                      <div className="font-medium">
                        {listing.fullLocation || `${listing.location?.city || 'Unknown'}, ${listing.location?.state || 'Unknown'}`}
                      </div>
                      {listing.location && (
                        <div className="text-xs text-base-content/60">
                          {typeof listing.location === 'string' 
                            ? listing.location 
                            : listing.location.area || 'Area not specified'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    {getStatusBadge(listing.status)}
                    <span className="text-sm text-base-content/70">
                      {listing.mileage.toLocaleString()} miles
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-accent" />
                      <span>{listing.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span>{new Date(listing.datePosted).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Bookings Summary */}
                  <div className="mt-3 border-t border-base-200 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Calendar className="w-4 h-4" />
                        <span>Bookings</span>
                      </div>
                      <span className="badge badge-outline">
                        {(bookingsByCar[listing.id] || []).length}
                      </span>
                    </div>
                    {(bookingsByCar[listing.id] || []).length === 0 ? (
                      <div className="text-xs text-base-content/60 mt-2">No bookings yet</div>
                    ) : (
                      <ul className="mt-2 space-y-2 max-h-36 overflow-auto pr-1">
                        {(bookingsByCar[listing.id] || []).map(b => (
                          <li key={b._id} className="text-xs flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="font-medium">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</span>
                              {(b.buyerName || b.buyerEmail || b.buyerPhone) && (
                                <span className="text-[11px] text-base-content/60">{b.buyerName || 'Buyer'} • {b.buyerEmail || ''} • {b.buyerPhone || ''}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`badge badge-ghost badge-xs ${b.status === 'confirmed' ? 'badge-success' : b.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>{b.status}</span>
                              {b.status === 'pending' && (
                                <div className="flex items-center gap-1">
                                  <button
                                    className="btn btn-ghost btn-xs"
                                    onClick={async () => {
                                      try {
                                        await updateBookingStatus({ token: localStorage.getItem('authToken'), carId: listing.id, bookingId: b._id, status: 'confirmed' })
                                        toast.success('Booking approved')
                                      } catch (e) {
                                        toast.error('Failed to approve booking')
                                      }
                                    }}
                                  >Approve</button>
                                  <button
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={async () => {
                                      try {
                                        await updateBookingStatus({ token: localStorage.getItem('authToken'), carId: listing.id, bookingId: b._id, status: 'rejected' })
                                        toast.success('Booking rejected')
                                      } catch (e) {
                                        toast.error('Failed to reject booking')
                                      }
                                    }}
                                  >Reject</button>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="card-actions justify-end mt-4">
                    <button 
                      onClick={() => handleEdit(listing.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    
                    {listing.status === 'active' && (
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-outline btn-sm">
                          Change Status
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                          <li>
                            <button onClick={() => handleStatusChange(listing.id, 'pending')}>
                              Mark as Pending
                            </button>
                          </li>
                          <li>
                            <button onClick={() => handleStatusChange(listing.id, 'sold')}>
                              Mark as Sold
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
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

export default ManageListings
