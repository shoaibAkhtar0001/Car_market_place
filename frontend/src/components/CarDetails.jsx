import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Gauge, 
  Fuel, 
  Calendar, 
  Settings, 
  Car, 
  Shield, 
  Star,
  Phone,
  Mail,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  Send
} from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useCarContext } from '../context/CarContext'
import { useWishlist } from '../context/WishlistContext'
import { useInquiryContext } from '../context/InquiryContext'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/formatters'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, getAuthToken } = useAuth()
  const { bookingsByCar, getCarBookings, createBooking, joinRoom, leaveRoom, API_BASE } = useBooking()
  const { cars, incrementInquiries } = useCarContext()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { sendInquiry } = useInquiryContext()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [seller, setSeller] = useState(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [quote, setQuote] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerTerms, setOfferTerms] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const targetIdForBookings = (car?._id || car?.id || id)
  const carBookings = bookingsByCar?.[targetIdForBookings] || []
  const confirmedBookedRanges = [...carBookings]
    .filter(b => b.status === 'confirmed')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))

  // Booking helpers (component scope)
  const daysBetween = (s, e) => {
    const start = new Date(s)
    const end = new Date(e)
    const ms = end - start
    return Math.max(1, Math.ceil(ms / (1000*60*60*24)))
  }

  const handleCreateBooking = async () => {
    if (!user) {
      toast.error('Please log in to book')
      return
    }
    if (car?.listingType !== 'rent') {
      toast.error('Booking is available only for rentals')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Select start and end dates')
      return
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date')
      return
    }

    const backendCarId = car?._id || car?.id || id

    try {
      setBookingSubmitting(true)
      const token = getAuthToken()
      
      console.log('CarDetails - Creating booking with user:', user)
      console.log('CarDetails - Token available:', !!token)
      
      // Pass buyer information for proper tracking
      const bookingData = { 
        token, 
        carId: backendCarId, 
        startDate, 
        endDate,
        buyerName: user?.name || user?.fullName || 'Buyer',
        buyerEmail: user?.email || '',
        buyerPhone: user?.phone || user?.phoneNumber || ''
      }
      
      console.log('CarDetails - Booking data:', bookingData)
      
      const result = await createBooking(bookingData)
      console.log('CarDetails - Booking created successfully:', result)
      toast.success('Booking request sent')
    } catch (err) {
      console.error('CarDetails - Booking creation failed:', err)
      toast.error(err.message || 'Failed to create booking')
    } finally {
      setBookingSubmitting(false)
    }
  }

  const handleBookClick = () => {
    if (!car) return
    if (car.listingType === 'rent') {
      handleCreateBooking()
    } else {
      setShowMessageModal(true)
      setMessageText('Hi, I would like to schedule a test drive / reserve this car.')
    }
  }

  // Fetch quote and availability when dates change (for rentals)
  useEffect(() => {
    const run = async () => {
      try {
        setQuote(null)
        setAvailability(null)
        if (!car || car.listingType !== 'rent') return
        if (!startDate || !endDate) return
        
        const backendCarId = car?._id || car?.id || id
        const isLocalCar = !backendCarId || !/^[a-fA-F0-9]{24}$/.test(backendCarId)
        
        // For local cars, calculate quote on frontend
        if (isLocalCar) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          const dayMs = 24 * 60 * 60 * 1000
          const days = Math.max(1, Math.ceil((end - start) / dayMs))
          const dailyRate = car.price || 0
          const subtotal = days * dailyRate
          const depositRate = 0.2
          const deposit = Math.round(subtotal * depositRate)
          const total = subtotal + deposit
          
          setQuote({ days, dailyRate, deposit, subtotal, total, currency: 'USD' })
          setAvailability({ available: true, conflicts: [] })
          return
        }
        
        // For backend cars, fetch from API
        const q = await fetch(`${API_BASE}/api/bookings/quote?carId=${backendCarId}&startDate=${startDate}&endDate=${endDate}`)
        if (q.ok) setQuote(await q.json())
        const a = await fetch(`${API_BASE}/api/bookings/availability?carId=${backendCarId}&startDate=${startDate}&endDate=${endDate}`)
        if (a.ok) setAvailability(await a.json())
      } catch (_) {}
    }
    run()
  }, [startDate, endDate, car?.id, car?._id, car?.listingType, car?.price, API_BASE, id])

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        const foundCar = cars.find(car => car.id === id)
        if (foundCar) {
          const carData = {
            ...foundCar,
            title: foundCar.title || `${foundCar.year} ${foundCar.make} ${foundCar.model}`,
            description: foundCar.description || `${foundCar.year} ${foundCar.make} ${foundCar.model} in ${foundCar.condition || 'good'} condition. This vehicle offers excellent performance and reliability.`,
            images: foundCar.images && foundCar.images.length > 0 
              ? foundCar.images.map((img, index) => ({
                  url: typeof img === 'string' ? img : img.url,
                  alt: `${foundCar.make} ${foundCar.model} - Image ${index + 1}`,
                  isPrimary: index === 0
                }))
              : [{
                  url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
                  alt: `${foundCar.make} ${foundCar.model}`,
                  isPrimary: true
                }],
            seller: {
              _id: foundCar.sellerId,
              name: foundCar.sellerName || 'Car Seller',
              email: foundCar.sellerEmail || 'seller@example.com',
              phone: foundCar.sellerPhone || '+91 98765 43210',
              rating: 4.5,
              totalSales: 10,
              joinedDate: '2023-01-01'
            },
            tags: foundCar.features ? foundCar.features.slice(0, 4) : ['car', 'vehicle'],
            listedAt: foundCar.datePosted || new Date().toISOString(),
            registrationNumber: foundCar.registrationNumber || 'Not Available',
            insuranceStatus: foundCar.insuranceStatus || 'Valid',
            ownershipHistory: foundCar.ownershipHistory || 1,
            engineSize: foundCar.engineSize || 'Not Specified'
          }
          setCar(carData)
          setSeller(carData.seller)
        } else {
          // Try fetching from backend by route id (likely a Mongo _id)
          const res = await fetch(`${API_BASE}/api/cars/${id}`)
          if (res.ok) {
            const backendCar = await res.json()
            const mapped = {
              ...backendCar,
              _id: backendCar._id,
              id: backendCar._id, // set local id for consistent downstream usage
              title: backendCar.title || `${backendCar.year} ${backendCar.make} ${backendCar.model}`,
              description: backendCar.description || `${backendCar.year} ${backendCar.make} ${backendCar.model} in ${backendCar.condition || 'good'} condition. This vehicle offers excellent performance and reliability.`,
              images: (backendCar.images && backendCar.images.length > 0)
                ? backendCar.images.map((img, index) => ({
                    url: typeof img === 'string' ? img : img.url,
                    alt: `${backendCar.make} ${backendCar.model} - Image ${index + 1}`,
                    isPrimary: index === 0
                  }))
                : [{
                    url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
                    alt: `${backendCar.make} ${backendCar.model}`,
                    isPrimary: true
                  }],
              seller: backendCar.seller ? {
                _id: backendCar.seller._id || backendCar.sellerId,
                name: backendCar.seller.name || 'Car Seller',
                email: backendCar.seller.email || 'seller@example.com',
                phone: backendCar.seller.phone || '+91 98765 43210',
                rating: 4.5,
                totalSales: 10,
                joinedDate: '2023-01-01'
              } : {
                _id: backendCar.sellerId,
                name: 'Car Seller',
                email: 'seller@example.com',
                phone: '+91 98765 43210',
                rating: 4.5,
                totalSales: 10,
                joinedDate: '2023-01-01'
              },
              tags: backendCar.features ? backendCar.features.slice(0, 4) : ['car', 'vehicle'],
              listedAt: backendCar.createdAt || new Date().toISOString(),
              registrationNumber: backendCar.registrationNumber || 'Not Available',
              insuranceStatus: backendCar.insuranceStatus || 'Valid',
              ownershipHistory: backendCar.ownershipHistory || 1,
              engineSize: backendCar.engineSize || 'Not Specified'
            }
            setCar(mapped)
            setSeller(mapped.seller)
          } else {
            setCar(null)
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching car details:', error)
        setCar(null)
        setLoading(false)
      }
    }
    fetchCarDetails()
  }, [id, cars, API_BASE])

  // Join booking room and load availability when car is loaded
  useEffect(() => {
    // prefer backend _id when available, fallback to route id
    const targetId = car?._id || id
    if (!targetId) return
    joinRoom(`car:${targetId}`)
    getCarBookings(targetId).catch(() => {})
    return () => leaveRoom(`car:${targetId}`)
  }, [id, car?._id])

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    )
  }

  const handleWishlistToggle = () => {
    if (car) {
      toggleWishlist(car.id)
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      toast.error('Please log in to contact the seller')
      return
    }
    if (user.id === car.sellerId) {
      toast.error('You cannot message yourself')
      return
    }
    setShowMessageModal(true)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSendingMessage(true)
    const loadingToast = toast.loading('Sending message...')

    try {
      const inquiryData = {
        carId: car.id,
        carTitle: `${car.year} ${car.make} ${car.model}`,
        carImage: car.images?.[0]?.url || car.images?.[0],
        carLocation: car.fullLocation || car.location,
        sellerId: car.sellerId,
        sellerName: seller.name,
        sellerEmail: seller.email,
        buyerId: user.id || user._id,
        buyerName: user.name || user.fullName || user.email,
        buyerEmail: user.email,
        buyerPhone: user.phone || user.phoneNumber || 'Not provided',
        message: messageText
      }

      sendInquiry(inquiryData)
      incrementInquiries(car.id)
      
      toast.success('Message sent successfully!', { id: loadingToast })
      setMessageText('')
      setShowMessageModal(false)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message', { id: loadingToast })
    } finally {
      setSendingMessage(false)
    }
  }

  // formatPrice is now imported from utils/formatters

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-600">Loading car details...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-20">🚗</div>
          <p className="text-gray-500 text-xl font-bold">Car not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={handleBookClick}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                {car.listingType === 'rent' ? 'Book' : 'Reserve/Test Drive'}
              </button>
              {car.listingType === 'sale' && (
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Make Offer
                </button>
              )}
              <button 
                onClick={handleWishlistToggle}
                className={`p-2 hover:bg-gray-100 rounded-xl transition-colors ${
                  car && isInWishlist(car.id) ? 'text-red-500' : 'text-gray-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${car && isInWishlist(car.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-12 relative">
                <img
                  src={car.images[currentImageIndex]?.url}
                  alt={car.images[currentImageIndex]?.alt}
                  className="w-full h-96 object-cover"
                />
                
                {/* Image Navigation */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {car.images.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === index 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Car Information */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">{car.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {car.location?.city || 'Unknown'}, {car.location?.state || 'Unknown'}
                      {car.location?.area && ` - ${car.location.area}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    car.listingType === 'sale' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {car.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {car.listingType === 'rent' ? 'Daily Rental Rate' : 'Current Price'}
                  </p>
                  <p className="text-4xl font-black text-blue-600">{formatPrice(car.price, car.listingType)}</p>
                </div>
                {car.originalPrice && car.originalPrice > car.price && (
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Original Price</p>
                    <p className="text-xl font-bold text-gray-400 line-through">{formatPrice(car.originalPrice)}</p>
                    <p className="text-sm font-bold text-green-600">
                      Save ₹{((car.originalPrice - car.price) / 100000).toFixed(1)}L
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Mileage</p>
                    <p className="font-bold text-blue-500">{car.mileage?.toLocaleString()} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Fuel className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fuel Type</p>
                    <p className="font-bold text-blue-500">{car.fuelType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Year</p>
                    <p className="font-bold text-blue-500">{car.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Transmission</p>
                    <p className="font-bold text-blue-500">{car.transmission}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {seller && (
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {seller.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{seller.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{seller.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{seller.totalSales} sales</span>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h5 className="font-semibold text-gray-900 mb-3">Contact Information</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="font-medium text-gray-900">{seller.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="font-medium text-gray-900">{seller.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={handleContactSeller}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => window.open(`tel:${seller.phone}`)}
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button 
                      onClick={() => window.open(`mailto:${seller.email}`)}
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicle Details */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              Vehicle Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-500 font-medium">Make</p>
                  <p className="font-bold text-base-content dark:text-black">{car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Model</p>
                  <p className="font-bold text-base-content dark:text-black">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Body Type</p>
                  <p className="font-bold text-base-content dark:text-black">{car.bodyType}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Engine Size</p>
                  <p className="font-bold text-base-content dark:text-black">{car.engineSize || 'Not Specified'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-500 font-medium">Condition</p>
                  <p className="font-bold text-base-content dark:text-black">{car.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Registration</p>
                  <p className="font-bold text-base-content dark:text-black">{car.registrationNumber || 'Not Available'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Insurance</p>
                  <p className="font-bold text-base-content dark:text-black">{car.insuranceStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-500 font-medium">Owners</p>
                  <p className="font-bold text-base-content dark:text-black">{car.ownershipHistory}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel (Rent only) */}
          {car.listingType === 'rent' && (
            <div id="booking-section" className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Car</h3>
              {confirmedBookedRanges.length > 0 && (
                <div className="mb-5 p-4 rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-900">
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <Calendar className="w-4 h-4" /> Booked dates
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {confirmedBookedRanges.map(b => (
                      <li key={b._id} className="px-2 py-1 rounded-lg bg-yellow-100 border border-yellow-200 text-sm font-medium">
                        {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs opacity-90">Unavailable dates are blocked automatically based on existing bookings.</div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm text-base-content dark:text-black mb-1">Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-blue-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-black" />
                </div>
                <div>
                  <label className="block text-sm text-base-content dark:text-black mb-1">End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-blue-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-black" />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateBooking}
                    disabled={bookingSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Request Booking
                  </button>
                </div>
              </div>
              {(startDate && endDate) && (
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div>
                    <span className="font-semibold text-blue-600">{daysBetween(startDate, endDate)}</span> day(s)
                  </div>
                  {quote && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>Daily Rate:</div>
                      <div className="font-medium">{formatPrice(quote.dailyRate, 'rent')}</div>
                      <div>Subtotal:</div>
                      <div className="font-medium">{formatPrice(quote.subtotal, 'rent')}</div>
                      <div>Deposit (20%):</div>
                      <div className="font-medium">{formatPrice(quote.deposit, 'rent')}</div>
                      <div>Total:</div>
                      <div className="font-bold text-blue-600">{formatPrice(quote.total, 'rent')}</div>
                    </div>
                  )}
                  {availability && (
                    <div className={`mt-2 text-sm ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                      {availability.available ? 'Selected dates are available' : 'Selected dates are unavailable'}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 text-xs text-gray-500">
                Unavailable dates are blocked automatically based on existing bookings.
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Features & Amenities
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {(car.features || []).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
          <p className="text-gray-600 leading-relaxed">{car.description}</p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            {(car.tags || []).map((tag, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Listed on {formatDate(car.listedAt)}
          </div>
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Send Message</h3>
                      <p className="text-sm text-gray-600">Contact {seller?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Car Info */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={car?.images[0]?.url}
                    alt={car?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{car?.title}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(car?.price, car?.listingType)}</p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Hi, I'm interested in your car. Is it still available? "
                  className="w-full h-32 p-3 border border-blue-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-blue-500">
                    {messageText.length}/500 characters
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Offer Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Car Info */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={car?.images[0]?.url}
                    alt={car?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{car?.title}</h4>
                    <p className="text-sm text-gray-600">Listed at: {formatPrice(car?.price, car?.listingType)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Offer Amount</label>
                  <input 
                    type="number" 
                    value={offerAmount} 
                    onChange={e => setOfferAmount(e.target.value)} 
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
                    placeholder="Enter your offer amount" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terms (optional)</label>
                  <textarea
                    value={offerTerms} 
                    onChange={e => setOfferTerms(e.target.value)} 
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
                    placeholder="e.g., Cash payment within 3 days"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowOfferModal(false)} 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        if (!user) { toast.error('Please log in to make an offer'); return }
                        if (!offerAmount || isNaN(Number(offerAmount))) { toast.error('Enter a valid amount'); return }
                        setOfferSubmitting(true)
                        const token = getAuthToken()
                        const backendCarId = car?._id || car?.id || id
                        
                        // Create inquiry so seller can see it in their list
                        const inquiryData = {
                          carId: backendCarId,
                          carTitle: `${car.year} ${car.make} ${car.model}`,
                          carImage: car.images?.[0]?.url || car.images?.[0],
                          carLocation: car.fullLocation || car.location,
                          sellerId: seller?._id || car?.sellerId,
                          sellerName: seller?.name || 'Seller',
                          sellerEmail: seller?.email || '',
                          buyerId: user.id || user._id,
                          buyerName: user.name || user.fullName || user.email,
                          buyerEmail: user.email,
                          buyerPhone: user.phone || user.phoneNumber || 'Not provided',
                          message: `💰 Made an offer of ₹${Number(offerAmount).toLocaleString()}`
                        }
                        sendInquiry(inquiryData)
                        incrementInquiries(backendCarId)
                        
                        // Send the actual offer to backend
                        const res = await fetch(`${API_BASE}/api/offers`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ carId: backendCarId, recipientId: seller?._id || car?.sellerId, amount: Number(offerAmount), terms: offerTerms })
                        })
                        if (res.ok) {
                          toast.success('Offer sent!')
                          setShowOfferModal(false)
                          setOfferAmount('')
                          setOfferTerms('')
                        } else {
                          const err = await res.json().catch(() => ({}))
                          toast.error(err.message || 'Failed to send offer')
                        }
                      } catch (e) {
                        toast.error('Failed to send offer')
                      } finally {
                        setOfferSubmitting(false)
                      }
                    }}
                    disabled={offerSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {offerSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Offer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarDetails
