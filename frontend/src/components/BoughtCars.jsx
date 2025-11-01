import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Car, Calendar, DollarSign, User, Phone, Mail, MapPin, MessageCircle, Star, Award, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BoughtCars = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boughtCars, setBoughtCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBoughtCars = () => {
      try {
        const bought = JSON.parse(localStorage.getItem('carMarketplace_boughtCars') || '[]')
        console.log('BoughtCars - All bought cars:', bought)
        console.log('BoughtCars - Current user:', user)
        
        // Filter for current user - handle both id and _id
        const userId = user?.id || user?._id
        const userEmail = user?.email
        
        const userBought = bought.filter(car => {
          const match = car.buyerId === userId || 
                       car.buyerId === user?.id || 
                       car.buyerId === user?._id ||
                       car.buyerOfferId === userId ||
                       car.buyerOfferId === user?.id ||
                       car.buyerOfferId === user?._id ||
                       car.buyerEmail === userEmail
          
          console.log('BoughtCars - Checking car:', { 
            carTitle: car.carTitle,
            carBuyerId: car.buyerId,
            carBuyerOfferId: car.buyerOfferId,
            userId, 
            userEmail: user?.email,
            carBuyerEmail: car.buyerEmail,
            match 
          })
          
          return match
        })
        
        console.log('BoughtCars - Filtered cars for user:', userBought)
        setBoughtCars(userBought)
      } catch (error) {
        console.error('Failed to load bought cars', error)
        toast.error('Failed to load purchased cars')
      } finally {
        setLoading(false)
      }
    }
    
    loadBoughtCars()
    
    // Listen for storage events (when offers are accepted)
    const handleStorageChange = () => {
      console.log('BoughtCars - Storage changed, reloading...')
      loadBoughtCars()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user?.id, user?._id, user?.email])

  // Calculate total spent
  const totalSpent = boughtCars.reduce((sum, car) => sum + (Number(car.boughtPrice) || 0), 0)
  const averagePrice = boughtCars.length > 0 ? Math.round(totalSpent / boughtCars.length) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/buyer')}
                className="group flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Dashboard</span>
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/buyer/inquiries')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquiries
                </button>
                <button
                  onClick={() => navigate('/buyer/bookings')}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  Bookings
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
                <Award className="w-6 h-6 text-yellow-300" />
                <span className="font-semibold text-white">Your Garage</span>
              </div>
              <h1 className="text-5xl font-black text-white mb-4 leading-tight">
                🎉 My Purchased Cars
              </h1>
              <p className="text-xl text-emerald-100 font-medium">
                Your successfully purchased vehicles collection
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Cars</p>
                    <p className="text-3xl font-bold text-white">{boughtCars.length}</p>
                  </div>
                  <Car className="w-12 h-12 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-white">₹{totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-white/60" />
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Avg Price</p>
                    <p className="text-3xl font-bold text-white">₹{averagePrice.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-white/60" />
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
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        ) : boughtCars.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <Car className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Purchased Cars Yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              When you or a seller accepts an offer, purchased cars will appear here with complete seller details and transaction information.
            </p>
            <button
              onClick={() => navigate('/buyer')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Browse Available Cars
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {boughtCars.map((car, index) => (
              <div key={index} className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      car.carImage || 
                      (typeof car.images?.[0] === 'string' ? car.images[0] : car.images?.[0]?.url) ||
                      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop'
                    }
                    alt={car.carTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Purchased
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-emerald-600">
                      #{index + 1}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Car Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {car.carTitle}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{car.carLocation}</span>
                    </div>
                  </div>

                  {/* Deal Information */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-emerald-700">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-semibold">Deal Price</span>
                        </div>
                        <Shield className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-900">
                        ₹{Number(car.boughtPrice || car.carPrice || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Calendar className="w-5 h-5" />
                        <span className="font-semibold">Purchase Date</span>
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {new Date(car.boughtDate || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(car.boughtDate || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-semibold">Seller Information</span>
                    </div>
                    <div className="space-y-2">
                      {car.sellerName && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{car.sellerName}</span>
                        </div>
                      )}
                      {car.sellerEmail && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{car.sellerEmail}</span>
                        </div>
                      )}
                      {car.sellerPhone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{car.sellerPhone}</span>
                        </div>
                      )}
                      {!car.sellerName && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-sm">Seller ID: {car.sellerId || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/car/${car.carId}`)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Car className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('/buyer/inquiries')}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
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

export default BoughtCars
