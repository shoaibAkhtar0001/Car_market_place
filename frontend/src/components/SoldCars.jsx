import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { ArrowLeft, Car, Calendar, DollarSign, User, Phone, Mail, MapPin, TrendingUp, MessageCircle, Award, Star, Target, Trophy, CheckCircle, Clock, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

const SoldCars = () => {
  const { user } = useAuth()
  const { cars: allCars } = useCarContext()
  const navigate = useNavigate()
  const [soldCars, setSoldCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    const loadSoldCars = () => {
      try {
        const carsData = JSON.parse(localStorage.getItem('carMarketplace_cars') || '[]')
        
        console.log('SoldCars - All cars data:', carsData.length)
        console.log('SoldCars - Current user:', user)
        
        const userId = user?.id || user?._id
        
        console.log('SoldCars - Current user ID:', userId)
        console.log('SoldCars - Total cars in localStorage:', carsData.length)
        
        // Get sold cars for current seller
        const sellerSoldCars = carsData.filter(car => {
          const isSold = car.status === 'sold'
          const isOwnedBySeller = car.sellerId === userId || 
                                   car.sellerId === String(userId) ||
                                   car.sellerId === user?.id || 
                                   car.sellerId === user?._id ||
                                   car.seller?.id === userId ||
                                   car.seller?._id === userId
          
          if (isSold) {
            console.log('SoldCars - Found sold car:', { 
              carTitle: car.title,
              carSellerId: car.sellerId,
              userSellerId: userId,
              matches: isOwnedBySeller
            })
          }
          
          return isSold && isOwnedBySeller
        })
        
        console.log('SoldCars - Found', sellerSoldCars.length, 'sold cars for seller', userId)
        
        console.log('SoldCars - Filtered sold cars:', sellerSoldCars.length)
        setSoldCars(sellerSoldCars)
        
        // Calculate total revenue
        const revenue = sellerSoldCars.reduce((sum, car) => sum + (Number(car.soldPrice) || 0), 0)
        setTotalRevenue(revenue)
      } catch (error) {
        console.error('Failed to load sold cars', error)
        toast.error('Failed to load sold cars')
      } finally {
        setLoading(false)
      }
    }
    
    loadSoldCars()
    
    // Listen for storage events (when offers are accepted)
    const handleStorageChange = () => {
      console.log('SoldCars - Storage changed, reloading...')
      loadSoldCars()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user?.id, user?._id])

  // Calculate additional stats
  const averagePrice = soldCars.length > 0 ? Math.round(totalRevenue / soldCars.length) : 0
  const profitMargin = soldCars.length > 0 ? 
    soldCars.reduce((sum, car) => {
      const originalPrice = Number(car.price || 0)
      const soldPrice = Number(car.soldPrice || car.price || 0)
      return sum + ((soldPrice - originalPrice) / originalPrice * 100)
    }, 0) / soldCars.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/seller')}
                className="group flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Dashboard</span>
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/seller/manage-listings')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                >
                  <Car className="w-4 h-4" />
                  Listings
                </button>
                <button
                  onClick={() => navigate('/seller/inquiries')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquiries
                </button>
                <button
                  onClick={() => navigate('/seller/analytics')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <Trophy className="w-6 h-6 text-yellow-300" />
                <span className="font-semibold text-white">Sales Success</span>
              </div>
              <h1 className="text-5xl font-black text-white mb-4 leading-tight">
                💰 Sold Cars
              </h1>
              <p className="text-xl text-green-100 font-medium">
                Track your successful sales and revenue
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Cars Sold</p>
                    <p className="text-3xl font-bold text-white">{soldCars.length}</p>
                  </div>
                  <Car className="w-12 h-12 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Avg Price</p>
                    <p className="text-3xl font-bold text-white">₹{averagePrice.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-white/60" />
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{soldCars.length > 0 ? '100%' : '0%'}</p>
                  </div>
                  <Target className="w-12 h-12 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        ) : soldCars.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Car className="w-16 h-16 text-green-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Sold Cars Yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              When you or a buyer accepts an offer, sold cars will appear here with complete buyer details and transaction information.
            </p>
            <button
              onClick={() => navigate('/seller/manage-listings')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              View My Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {soldCars.map((car, index) => (
              <div key={car.id} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      typeof car.images?.[0] === 'string' 
                        ? car.images[0] 
                        : (car.images?.[0]?.url || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop')
                    }
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      SOLD
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-green-600">
                      #{index + 1}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Car Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {car.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{car.year} • {car.make} {car.model}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{car.location?.city}, {car.location?.state}</span>
                    </div>
                  </div>

                  {/* Sale Information */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-100">
                      <div className="text-xs text-gray-600 mb-1">Original Price</div>
                      <div className="text-lg font-bold text-gray-500 line-through">
                        ₹{Number(car.price || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-green-700">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-semibold">Sold Price</span>
                        </div>
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        ₹{Number(car.soldPrice || car.price || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">Buyer Information</span>
                    </div>
                    <div className="space-y-2">
                      {car.buyerName && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{car.buyerName}</span>
                        </div>
                      )}
                      {car.buyerEmail && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{car.buyerEmail}</span>
                        </div>
                      )}
                      {car.buyerPhone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{car.buyerPhone}</span>
                        </div>
                      )}
                      {!car.buyerName && !car.buyerEmail && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm">Buyer ID: {car.soldTo || car.buyerId || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sale Date */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-semibold">Sale Completed</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {car.soldDate ? new Date(car.soldDate).toLocaleDateString() : 'Recently'}
                    </div>
                    <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {car.soldDate ? new Date(car.soldDate).toLocaleTimeString() : 'Just now'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/car/${car.id}`)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Car className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/seller/inquiries')}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact
                    </button>
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

export default SoldCars
