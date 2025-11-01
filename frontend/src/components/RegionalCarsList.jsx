import { useState } from 'react'
import { X, MapPin, Car, DollarSign, Calendar, Fuel, Settings, Heart, Eye } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'

const RegionalCarsList = ({ 
  cars = [], 
  region = '', 
  isOpen = false, 
  onClose = () => {}, 
  onCarClick = () => {} 
}) => {
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [sortBy, setSortBy] = useState('price-low')

  if (!isOpen) return null

  const formatPrice = (price, listingType) => {
    return listingType === 'rent' ? `$${price}/day` : `$${price?.toLocaleString()}`
  }

  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'year-new':
        return (b.year || 0) - (a.year || 0)
      case 'year-old':
        return (a.year || 0) - (b.year || 0)
      case 'mileage':
        return (a.mileage || 0) - (b.mileage || 0)
      default:
        return 0
    }
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cars in {region}</h2>
                <p className="text-blue-100">
                  {cars.length} car{cars.length !== 1 ? 's' : ''} available in this area
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
              <option value="mileage">Mileage: Low to High</option>
            </select>
          </div>
        </div>

        {/* Cars List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {sortedCars.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No cars in this region</h3>
              <p className="text-gray-500">Try expanding your search area or check other locations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedCars.map(car => (
                <div
                  key={car._id || car.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => onCarClick(car)}
                >
                  {/* Car Image */}
                  <div className="relative h-48 bg-gray-100">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0].url || car.images[0]}
                        alt={car.title || `${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Listing Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        car.listingType === 'sale' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {car.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(car._id || car.id)
                      }}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isInWishlist(car._id || car.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(car._id || car.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Car Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                      {car.title || `${car.make} ${car.model}`}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {car.location?.city || car.city}, {car.location?.state || car.state}
                      </span>
                      {car.distance && (
                        <span className="text-gray-400">• {car.distance}km away</span>
                      )}
                    </div>

                    {/* Car Specs */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{car.year}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Fuel className="w-4 h-4" />
                        <span>{car.fuelType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Settings className="w-4 h-4" />
                        <span>{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{car.views || 0} views</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-xl text-green-600">
                          {formatPrice(car.price, car.listingType)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCarClick(car)
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedCars.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {sortedCars.length} car{sortedCars.length !== 1 ? 's' : ''} in {region}
              </span>
              <button
                onClick={onClose}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Close and return to map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegionalCarsList
