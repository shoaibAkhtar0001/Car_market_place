import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { useCarContext } from '../context/CarContext'
import toast from 'react-hot-toast'
import { getCurrentLocation, reverseGeocode, isGeolocationSupported, getCityCoordinates } from '../utils/locationUtils'
import { ArrowLeft, Upload, Car, MapPin, DollarSign, Calendar, Gauge, Fuel, Settings, Camera, Navigation } from 'lucide-react'

const AddCarListing = () => {
  const navigate = useNavigate()
  const { user, getAuthToken } = useAuth()
  const { addCar, updateCar } = useCarContext()
  const { API_BASE } = useBooking()
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [images, setImages] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: 'petrol',
    transmission: 'manual',
    bodyType: 'sedan',
    color: '',
    description: '',
    location: '',
    city: '',
    state: '',
    condition: 'excellent',
    listingType: 'sale',
    features: [],
    detectedCoordinates: null // Store actual coordinates when using current location
  })

  const carFeatures = [
    'Air Conditioning', 'Power Steering', 'Power Windows', 'ABS', 'Airbags',
    'Alloy Wheels', 'Bluetooth', 'GPS Navigation', 'Sunroof', 'Leather Seats',
    'Automatic Climate Control', 'Cruise Control', 'Parking Sensors', 'Backup Camera',
    'Heated Seats', 'Premium Sound System', 'Keyless Entry', 'Push Start'
  ]

  const citySuggestions = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bangalore', state: 'Karnataka' },
    { city: 'Chennai', state: 'Tamil Nadu' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Kolkata', state: 'West Bengal' },
    { city: 'Pune', state: 'Maharashtra' },
    { city: 'Ahmedabad', state: 'Gujarat' },
    { city: 'San Francisco', state: 'CA' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'New York', state: 'NY' },
    { city: 'Chicago', state: 'IL' }
  ]

  const mumbaiAreas = [
    'Andheri West', 'Andheri East', 'Bandra West', 'Bandra East', 'Powai',
    'Lower Parel', 'Malad West', 'Malad East', 'Goregaon West', 'Goregaon East',
    'Kandivali West', 'Kandivali East', 'Borivali West', 'Borivali East',
    'Thane West', 'Thane East', 'Navi Mumbai', 'Kalyan West', 'Kalyan East',
    'Worli', 'Dadar', 'Kurla', 'Santacruz West', 'Santacruz East', 'Juhu',
    'Versova', 'Oshiwara', 'Lokhandwala', 'Hiranandani Gardens'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 10) {
      alert('Maximum 10 images allowed')
      return
    }
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleCitySelect = (cityData) => {
    setFormData(prev => ({
      ...prev,
      city: cityData.city,
      state: cityData.state
    }))
    setShowCitySuggestions(false)
  }

  const handleAreaSelect = (area) => {
    setFormData(prev => ({
      ...prev,
      location: area
    }))
    setShowAreaSuggestions(false)
  }

  const getFilteredCitySuggestions = () => {
    if (!formData.city) return citySuggestions.slice(0, 6)
    return citySuggestions.filter(item => 
      item.city.toLowerCase().includes(formData.city.toLowerCase())
    ).slice(0, 6)
  }

  const getFilteredAreaSuggestions = () => {
    if (formData.city.toLowerCase() === 'mumbai') {
      if (!formData.location) return mumbaiAreas.slice(0, 8)
      return mumbaiAreas.filter(area => 
        area.toLowerCase().includes(formData.location.toLowerCase())
      ).slice(0, 8)
    }
    return []
  }

  const handleUseCurrentLocation = async () => {
    if (!isGeolocationSupported()) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    const loadingToast = toast.loading('Detecting your location...')
    
    try {
      // Get current coordinates
      const coordinates = await getCurrentLocation()
      
      // Reverse geocode to get address
      const address = await reverseGeocode(coordinates.latitude, coordinates.longitude)
      
      // Update form data with detected location and coordinates
      setFormData(prev => ({
        ...prev,
        city: address.city,
        state: address.state,
        location: address.area,
        detectedCoordinates: coordinates
      }))
      
      toast.success(`Location detected: ${address.city}, ${address.state}`, {
        id: loadingToast,
      })
    } catch (error) {
      console.error('Location error:', error)
      toast.error(`Failed to get location: ${error.message}`, {
        id: loadingToast,
      })
    } finally {
      setLocationLoading(false)
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const loadingToast = toast.loading('Creating your car listing...')

    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.year || !formData.price || !formData.city || !formData.state) {
        toast.error('Please fill in all required fields', { id: loadingToast })
        return
      }

      if (images.length === 0) {
        toast.error('Please add at least one image', { id: loadingToast })
        return
      }

      // Get coordinates for the selected city
      // Use detected coordinates if available (from "Use Current Location"), otherwise get city coordinates
      let coordinates = formData.detectedCoordinates
      if (!coordinates) {
        const cityCoordinates = getCityCoordinates(formData.city, formData.state)
        coordinates = cityCoordinates || {
          latitude: 19.2881, // Default to Mumbai coordinates if city not found
          longitude: 72.8562
        }
      }

      // Create the car listing
      const carData = {
        sellerId: user?.id || `seller_${Date.now()}`,
        sellerName: user?.name || 'Anonymous Seller',
        sellerPhone: user?.phone || '+91 98765 43210',
        title: `${formData.year} ${formData.make} ${formData.model}`,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseInt(formData.price),
        listingType: formData.listingType,
        condition: formData.condition,
        mileage: parseInt(formData.mileage),
        fuelType: formData.fuelType,
        bodyType: formData.bodyType,
        transmission: formData.transmission,
        color: formData.color,
        description: formData.description,
        location: {
          city: formData.city,
          state: formData.state,
          area: formData.location,
          coordinates: coordinates
        },
        images: images.map((img, index) => ({
          url: img.url,
          isPrimary: index === 0
        })),
        features: formData.features
      }

      // Add car locally first for immediate UX
      const newCar = addCar(carData)
      console.log('Car listing created (local):', newCar)

      // Try syncing to backend to obtain a Mongo _id (needed for booking)
      try {
        const token = getAuthToken()
        if (!token) {
          console.warn('No auth token found; skipping backend sync')
          toast('Listing created locally. Login again to enable backend sync and bookings.', { id: loadingToast, icon: '⚠️' })
        } else {
          console.log('Attempting backend sync to:', `${API_BASE}/api/cars`)
          const res = await fetch(`${API_BASE}/api/cars`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(carData),
          })
          
          console.log('Backend response status:', res.status)
          
          if (res.ok) {
            const backendCar = await res.json()
            // Update local car to carry backend _id, and standardize id to _id for downstream flows
            updateCar(newCar.id, { _id: backendCar._id, id: backendCar._id })
            console.log('✅ Car synced to backend with _id:', backendCar._id)
            toast.success(`✅ Listing created and synced! Booking enabled.`, { id: loadingToast })
          } else {
            const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
            console.error('❌ Backend sync failed:', res.status, err)
            
            if (res.status === 403) {
              toast('Listing created locally. Only sellers can sync to backend.', { id: loadingToast, icon: '⚠️' })
            } else if (res.status === 401) {
              toast('Listing created locally. Please login again to sync to backend.', { id: loadingToast, icon: '⚠️' })
            } else if (res.status === 500) {
              toast('Listing created locally. Backend server error - bookings may be limited.', { id: loadingToast, icon: '⚠️' })
            } else {
              toast(`Listing created locally. Backend sync failed (${res.status}) - bookings may be limited.`, { id: loadingToast, icon: '⚠️' })
            }
          }
        }
      } catch (syncErr) {
        console.error('❌ Error syncing car to backend:', syncErr)
        
        if (syncErr.message.includes('Failed to fetch') || syncErr.message.includes('NetworkError')) {
          toast('Listing created locally. Backend server is not running. Start server to enable bookings.', { 
            id: loadingToast,
            duration: 6000,
            icon: '⚠️'
          })
        } else {
          toast(`Listing created locally. Sync error: ${syncErr.message}`, { id: loadingToast, icon: '⚠️' })
        }
      }

      // Navigate to manage listings to see the new car
      setTimeout(() => {
        navigate('/seller/manage-listings')
      }, 800)
      
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Failed to create listing. Please try again.', { id: loadingToast })
    } finally {
      setLoading(false)
    }
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
                Add New Car Listing
              </h1>
              <p className="text-base-content/70">Create a new car listing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Car Images */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-primary" />
                Car Images
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Car"
                      className="w-full h-32 object-cover rounded-lg border-2 border-base-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 btn btn-circle btn-sm btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {images.length < 10 && (
                  <label className="w-full h-32 border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-8 h-8 text-base-content/50 mb-2" />
                    <span className="text-sm text-base-content/70">Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <p className="text-sm text-base-content/70">
                Upload up to 10 high-quality images of your car. The first image will be used as the main photo.
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-primary" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Make *</span>
                  </label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    placeholder="e.g., Toyota, Honda, BMW"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Model *</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Camry, Accord, 3 Series"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Year *</span>
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Listing Type *</span>
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      {formData.listingType === 'sale' ? 'Price ($) *' : 'Rent per Day ($) *'}
                    </span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder={formData.listingType === 'sale' ? '25000' : '50'}
                      className="input input-bordered w-full pl-10"
                      required
                    />
                  </div>
                  {formData.listingType === 'rent' && (
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">Daily rental rate</span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Mileage *</span>
                  </label>
                  <div className="relative">
                    <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="input input-bordered w-full pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Color</span>
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Black, White, Silver"
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Technical Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Fuel Type</span>
                  </label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Transmission</span>
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="cvt">CVT</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Body Type</span>
                  </label>
                  <select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="coupe">Coupe</option>
                    <option value="convertible">Convertible</option>
                    <option value="wagon">Wagon</option>
                    <option value="pickup">Pickup Truck</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Condition</span>
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title text-xl flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  Location
                </h2>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  {locationLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Use Current Location
                    </>
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control relative">
                  <label className="label">
                    <span className="label-text font-semibold">City *</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    placeholder="e.g., Mumbai, Delhi, New York"
                    className="input input-bordered w-full"
                    required
                  />
                  {showCitySuggestions && getFilteredCitySuggestions().length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {getFilteredCitySuggestions().map((cityData, index) => (
                        <div
                          key={index}
                          onClick={() => handleCitySelect(cityData)}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
                        >
                          <div className="font-medium">{cityData.city}</div>
                          <div className="text-sm text-base-content/70">{cityData.state}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">State *</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., Maharashtra, NY"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control md:col-span-2 relative">
                  <label className="label">
                    <span className="label-text font-semibold">Detailed Location</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    onFocus={() => setShowAreaSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 200)}
                    placeholder="e.g., Andheri West, Downtown area, near Central Park"
                    className="input input-bordered w-full"
                  />
                  {showAreaSuggestions && getFilteredAreaSuggestions().length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-base-100 border border-base-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {getFilteredAreaSuggestions().map((area, index) => (
                        <div
                          key={index}
                          onClick={() => handleAreaSelect(area)}
                          className="px-4 py-2 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0"
                        >
                          {area}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm text-info-content/80 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>
                    Click "Use Current Location" to automatically detect your location, or start typing in the city field for suggestions. 
                    Mumbai users get area suggestions for easier selection.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Features</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {carFeatures.map((feature) => (
                  <label key={feature} className="cursor-pointer label justify-start gap-3">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="checkbox checkbox-primary"
                    />
                    <span className="label-text">{feature}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">Description</h2>
              
              <div className="form-control">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your car's condition, maintenance history, any modifications, or other important details..."
                  className="textarea textarea-bordered h-32 resize-none"
                  rows="4"
                ></textarea>
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    Provide detailed information to attract potential buyers
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddCarListing
