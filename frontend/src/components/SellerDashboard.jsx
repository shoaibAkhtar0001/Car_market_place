import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit3, MessageCircle, BarChart3, Car, Eye, DollarSign, TrendingUp, MapPin, Calendar, Star, Award, Zap, Target, Users, ShoppingCart, Clock, Trophy } from 'lucide-react'
import StatsCard from './shared/StatsCard'
import CarCard from './shared/CarCard'
import { useBooking } from '../context/BookingContext'

const SellerDashboard = () => {
  const { user, logout } = useAuth()
  const { getCarsBySeller, lastUpdate } = useCarContext()
  const { bookingsByCar, getCarBookings } = useBooking()
  const navigate = useNavigate()
  const [sellerCars, setSellerCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch seller's cars when component mounts or when cars are updated
  useEffect(() => {
    const fetchSellerCars = () => {
      try {
        setLoading(true)
        const cars = getCarsBySeller(user?.id || 'seller_1')
        setSellerCars(cars)
        console.log(`SellerDashboard: Found ${cars.length} cars for seller ${user?.id || 'seller_1'}`)
      } catch (error) {
        console.error('Error fetching seller cars:', error)
        setSellerCars([])
      } finally {
        setLoading(false)
      }
    }

    fetchSellerCars()
  }, [getCarsBySeller, user?.id, lastUpdate])

  // Hydrate bookings for seller cars and compute pending count
  useEffect(() => {
    const hydrate = async () => {
      try {
        const ids = Array.from(new Set((sellerCars || []).map(c => (c._id || c.id)).filter(Boolean)))
        if (ids.length) {
          await Promise.all(ids.map(cid => getCarBookings(cid).catch(() => [])))
        }
      } catch (_) {}
    }
    hydrate()
  }, [sellerCars, getCarBookings])

  useEffect(() => {
    const ids = Array.from(new Set((sellerCars || []).map(c => (c._id || c.id)).filter(Boolean)))
    let count = 0
    for (const cid of ids) {
      const arr = bookingsByCar?.[cid] || []
      count += arr.filter(b => b.status === 'pending').length
    }
    setPendingCount(count)
  }, [bookingsByCar, sellerCars])

  const handleLogout = () => {
    logout()
    // Redirect to login page
    navigate('/login')
  }

  

  const quickActions = [
    { title: 'List New Car', icon: Plus, description: 'Add a new car listing', color: 'bg-primary', path: '/seller/add-listing' },
    { title: 'Manage Listings', icon: Edit3, description: 'Edit your car listings', color: 'bg-secondary', path: '/seller/manage-listings' },
    { title: 'View Inquiries', icon: MessageCircle, description: 'Check buyer messages', color: 'bg-accent', path: '/seller/inquiries' },
    { title: 'Sold Cars', icon: Car, description: 'View your sold vehicles', color: 'bg-success', path: '/seller/sold-cars' },
    { title: 'Bookings', icon: Calendar, description: 'Approve / reject rental requests', color: 'bg-info', path: '/seller/bookings' },
    { title: 'Sales Analytics', icon: BarChart3, description: 'View your sales data', color: 'bg-warning', path: '/seller/analytics' }
  ]

  const handleQuickActionClick = (path) => {
    navigate(path)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      {/* Modern Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-3 border-white flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    Seller Dashboard
                  </h1>
                  <p className="text-green-100 font-medium">Welcome back, {user?.name}!</p>
                </div>
              </div>

              {/* User Section */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-white/80 text-sm font-medium">Seller Account</p>
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Active Listings"
            value={sellerCars.filter(car => car.status === 'active').length.toString()}
            subtitle="Cars listed"
            icon={Car}
            color="primary"
          />
          <StatsCard
            title="Total Views"
            value={sellerCars.reduce((sum, car) => sum + car.views, 0).toLocaleString()}
            subtitle="All time"
            icon={Eye}
            color="accent"
          />
          <StatsCard
            title="Total Inquiries"
            value={sellerCars.reduce((sum, car) => sum + car.inquiries, 0).toString()}
            subtitle="All listings"
            icon={MessageCircle}
            color="success"
          />
          <StatsCard
            title="Cars Sold"
            value={sellerCars.filter(car => car.status === 'sold').length.toString()}
            subtitle="Total sales"
            icon={TrendingUp}
            color="warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <div
                  key={action.title}
                  onClick={() => handleQuickActionClick(action.path)}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border border-base-300"
                >
                  <div className="card-body items-center text-center">
                    <div className="relative">
                      <div className={`${action.color} text-white p-4 rounded-full mb-4`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {action.title === 'Bookings' && pendingCount > 0 && (
                        <span className="absolute -top-1 -right-1 badge badge-error text-white text-xs">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                    <h3 className="card-title text-lg">{action.title}</h3>
                    <p className="text-base-content/70 text-center">{action.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Listings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Recent Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body">
                    <div className="animate-pulse">
                      <div className="h-48 bg-base-300 rounded mb-4"></div>
                      <div className="h-4 bg-base-300 rounded mb-2"></div>
                      <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : sellerCars.length > 0 ? (
              sellerCars.slice(0, 6).map(car => (
                <CarCard
                  key={car.id}
                  car={car}
                  onCarClick={() => navigate(`/seller/manage-listings`)}
                  showWishlist={false}
                  showStats={true}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Car className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                <h3 className="text-xl font-semibold text-base-content/70 mb-2">No cars listed yet</h3>
                <p className="text-base-content/50 mb-6">Start by adding your first car listing to attract buyers</p>
                <button 
                  onClick={() => navigate('/seller/add-listing')}
                  className="btn btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Car
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        
      </div>
    </div>
  )
}

export default SellerDashboard
