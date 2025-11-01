import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Key, Sparkles, Filter, Map, Heart, MapPin, Car, MessageCircle, Star, Award, Zap, Target, Users, ShoppingCart, Eye, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useWishlist } from '../context/WishlistContext'
import { useBooking } from '../context/BookingContext'
import MapView from './MapView'
import LocationSearch from './LocationSearch'
import CarCard from './shared/CarCard'
import StatsCard from './shared/StatsCard'
import SystemDemo from './SystemDemo'
import { filterCarsByDistance } from '../utils/locationUtils'

const BuyerDashboard = () => {
  const { user, logout, getAuthToken } = useAuth()
  const { getActiveCars, searchCars, lastUpdate } = useCarContext()
  const { wishlistCount, toggleWishlist, isInWishlist, getWishlistItems } = useWishlist()
  const { bookingsByCar, getMyBookings } = useBooking()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    make: '',
    fuelType: '',
    bodyType: ''
  })
  const [userLocation, setUserLocation] = useState(null)
  const [maxDistance, setMaxDistance] = useState(10)
  const [showMap, setShowMap] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true)
      // Get active cars from context (cars uploaded by sellers)
      const activeCars = getActiveCars()
      console.log('Active cars found:', activeCars.length)
      setCars(activeCars)
    } catch (error) {
      console.error('Error fetching cars:', error)
      setCars([])
    } finally {
      setLoading(false)
    }
  }, [getActiveCars])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  // Listen for real-time updates when new cars are added
  useEffect(() => {
    fetchCars()
  }, [lastUpdate, fetchCars])

  // Hydrate buyer bookings so we can show pending requests count
  useEffect(() => {
    const loadMyBookings = async () => {
      try {
        const token = getAuthToken()
        await getMyBookings(token)
      } catch (_) {}
    }
    loadMyBookings()
  }, [getMyBookings, getAuthToken])

  const stats = useMemo(() => {
    const forSale = cars.filter(car => car.listingType === 'sale').length
    const forRent = cars.filter(car => car.listingType === 'rent').length
    // count pending requests for this buyer across all cars
    let pending = 0
    for (const [carId, arr] of Object.entries(bookingsByCar || {})) {
      for (const b of (arr || [])) {
        const mine = (user?.email && b.buyerEmail === user.email) || (user?.id && b.buyerId === user.id)
        if (mine && b.status === 'pending') pending++
      }
    }
    return {
      carsForSale: forSale,
      carsForRent: forRent,
      wishlistCount: wishlistCount,
      pendingRequests: pending
    }
  }, [cars, wishlistCount, bookingsByCar, user?.email, user?.id])

  const filteredCars = useMemo(() => {
    // Use the searchCars function from context for better filtering
    let filtered = searchCars(searchQuery, filters)
    
    // Apply listing type filter
    if (filter === 'sale' || filter === 'rent') {
      filtered = filtered.filter(car => car.listingType === filter)
    } else if (filter === 'wishlist') {
      // Show only wishlisted cars
      const wishlistIds = getWishlistItems()
      filtered = filtered.filter(car => wishlistIds.includes(car.id))
    }

    // Apply location-based filtering if user location is set
    if (userLocation && filter !== 'wishlist') {
      filtered = filterCarsByDistance(filtered, userLocation, maxDistance)
      console.log(`Showing ${filtered.length} cars within ${maxDistance}km of your location`)
    } else if (filter !== 'wishlist') {
      // If no user location, show all cars but prioritize Mumbai cars (our main location)
      filtered = filtered.sort((a, b) => {
        const aMumbai = a.location?.city?.toLowerCase() === 'mumbai' ? 1 : 0
        const bMumbai = b.location?.city?.toLowerCase() === 'mumbai' ? 1 : 0
        return bMumbai - aMumbai
      })
    }

    return filtered
  }, [searchCars, searchQuery, filters, filter, userLocation, maxDistance, getWishlistItems])


  const handleCarClick = (car) => {
    navigate(`/car/${car.id}`)
  }

  const handleLogout = () => {
    logout()
    // Redirect to login page
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Modern Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
              <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
              </div>
              <div>
                  <h1 className="text-2xl font-black text-white">
                  CarMarket
                </h1>
                  <p className="text-blue-100 font-medium">Premium Motors</p>
                </div>
              </div>

              {/* User Section */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                    <p className="text-white/80 text-sm font-medium">Welcome back</p>
                    <p className="text-white font-bold">{user.name}</p>
                  </div>
              </div>
              <button 
                onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/30 hover:scale-105"
              >
                Logout
              </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-8 py-4 rounded-full mb-6 border border-blue-200/30">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-blue-800">Discover Your Dream Car</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 leading-tight">
            Find Your Perfect Ride
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            Browse through {stats.carsForSale + stats.carsForRent} premium vehicles available now
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate('/buyer/inquiries')}
            className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <MessageCircle className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">My Inquiries</h3>
            <p className="text-blue-100 text-sm">Track messages</p>
          </button>
          
          <button 
            onClick={() => navigate('/buyer/bookings')}
            className="group relative bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Clock className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Booked Cars</h3>
            <p className="text-green-100 text-sm">Rental requests</p>
            {stats.pendingRequests > 0 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                {stats.pendingRequests}
              </div>
            )}
          </button>
          
          <button 
            onClick={() => navigate('/buyer/purchased')}
            className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Award className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Bought Cars</h3>
            <p className="text-emerald-100 text-sm">My purchases</p>
          </button>
          
          <button 
            onClick={() => setFilter('wishlist')}
            className="group bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Heart className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg">Wishlist</h3>
            <p className="text-red-100 text-sm">{stats.wishlistCount} saved</p>
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Cars for Sale</p>
                <p className="text-3xl font-bold">{stats.carsForSale}</p>
                <p className="text-blue-200 text-xs">Available now</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Cars for Rent</p>
                <p className="text-3xl font-bold">{stats.carsForRent}</p>
                <p className="text-purple-200 text-xs">Ready to drive</p>
              </div>
              <Key className="w-12 h-12 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">My Wishlist</p>
                <p className="text-3xl font-bold">{stats.wishlistCount}</p>
                <p className="text-red-200 text-xs">Saved favorites</p>
              </div>
              <Heart className="w-12 h-12 text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium mb-1">Pending Requests</p>
                <p className="text-3xl font-bold">{stats.pendingRequests}</p>
                <p className="text-yellow-200 text-xs">Awaiting approval</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-10 border border-white/30">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search cars, brands, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900 placeholder-gray-400 text-lg"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <button 
                onClick={() => setFilter('all')}
                className={`px-8 py-5 rounded-2xl font-bold transition-all text-lg ${
                  filter === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Cars
              </button>
              <button 
                onClick={() => setFilter('sale')}
                className={`px-8 py-5 rounded-2xl font-bold transition-all text-lg ${
                  filter === 'sale' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button 
                onClick={() => setFilter('rent')}
                className={`px-8 py-5 rounded-2xl font-bold transition-all text-lg ${
                  filter === 'rent' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rent
              </button>
              <button 
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className={`px-6 py-5 rounded-2xl font-bold transition-all flex items-center gap-2 text-lg ${
                  userLocation 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Location
              </button>
              <button 
                onClick={() => setShowMap(!showMap)}
                className={`px-6 py-5 rounded-2xl font-bold transition-all flex items-center gap-2 text-lg ${
                  showMap 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Map className="w-5 h-5" />
                Map View
              </button>
            </div>
          </div>
        </div>

        {/* Location Search */}
        {showLocationSearch && (
          <div className="mb-8">
            <LocationSearch
              onLocationChange={setUserLocation}
              userLocation={userLocation}
              maxDistance={maxDistance}
              onMaxDistanceChange={setMaxDistance}
            />
          </div>
        )}

        {/* Map View */}
        {showMap && (
          <div className="mb-8">
            <MapView
              cars={filteredCars}
              userLocation={userLocation}
              onCarClick={handleCarClick}
              height="600px"
              showUserLocation={true}
            />
          </div>
        )}

        {/* Location Info Banner */}
        {!userLocation && cars.length > 0 && (
          <div className="alert alert-info mb-6">
            <MapPin className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">See cars near you!</h4>
              <p className="text-sm">Use the location search to find cars within your preferred distance. Currently showing all available cars with Mumbai cars prioritized.</p>
            </div>
          </div>
        )}

        {userLocation && (
          <div className="alert alert-success mb-6">
            <MapPin className="w-5 h-5" />
            <div>
              <h4 className="font-semibold">Location-based results</h4>
              <p className="text-sm">Showing {filteredCars.length} cars within {maxDistance}km of your location ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})</p>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
            <p className="text-gray-700 font-bold text-lg">
              {filter === 'wishlist' 
                ? `🎯 Showing ${filteredCars.length} wishlisted cars`
                : `🚗 Showing ${filteredCars.length} of ${cars.length} cars ${userLocation ? `within ${maxDistance}km` : '(all locations)'}`
              }
            </p>
          </div>
        </div>

        {/* Car Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map(car => (
            <CarCard
              key={car.id}
              car={car}
              onCarClick={(car) => {
                navigate(`/car/${car.id}`)
              }}
              onWishlistToggle={toggleWishlist}
              isInWishlist={isInWishlist(car.id)}
              showWishlist={true}
            />
          ))}
        </div>

        {filteredCars.length === 0 && cars.length === 0 && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Car className="w-16 h-16 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No cars available yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              This marketplace shows real cars uploaded by sellers. 
              <br />
              Cars will appear here when sellers create listings.
            </p>
            <div className="bg-blue-50 p-6 rounded-2xl max-w-md mx-auto border border-blue-100">
              <Car className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h4 className="font-bold text-blue-800 mb-2">Want to see cars?</h4>
              <p className="text-blue-700 text-sm">Ask sellers to upload their cars, or try the demo feature!</p>
            </div>
          </div>
        )}

        {filteredCars.length === 0 && cars.length > 0 && filter === 'wishlist' && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-red-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">💝</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h3>
            <p className="text-lg text-gray-600 mb-8">Start adding cars to your wishlist by clicking the heart icon on any car</p>
            <button 
              onClick={() => setFilter('all')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Browse All Cars
            </button>
          </div>
        )}

        {filteredCars.length === 0 && cars.length > 0 && filter !== 'wishlist' && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-gray-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🔍</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No cars match your filters</h3>
            <p className="text-lg text-gray-600">Try adjusting your search, location, or filters</p>
          </div>
        )}
      </main>
      
      {/* System Demo Component */}
      <SystemDemo />
    </div>
  )
}

export default BuyerDashboard
