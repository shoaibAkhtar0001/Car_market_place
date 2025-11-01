import { Heart, MapPin, Gauge, Fuel, Eye } from 'lucide-react'
import { formatPrice, formatLocation } from '../../utils/formatters'

const CarCard = ({ 
  car, 
  onCarClick, 
  onWishlistToggle, 
  isInWishlist = false,
  showWishlist = true,
  showStats = false,
  className = ''
}) => {
  const handleCardClick = () => {
    onCarClick?.(car)
  }

  const handleWishlistClick = (e) => {
    e.stopPropagation()
    onWishlistToggle?.(car._id || car.id)
  }

  return (
    <div 
      className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-base-300 ${className}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <figure className="px-4 pt-4 relative">
        <img
          src={car.images?.[0]?.url || car.images?.[0] || '/placeholder-car.jpg'}
          alt={car.title || `${car.make} ${car.model}`}
          className="rounded-xl w-full h-48 object-cover"
        />
        
        {/* Wishlist button */}
        {showWishlist && (
          <button
            onClick={handleWishlistClick}
            className={`absolute top-6 right-6 p-2 rounded-full transition-all ${
              isInWishlist 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Listing type badge */}
        <div className="absolute bottom-6 left-6">
          {car.status === 'sold' ? (
            <span className="badge badge-error badge-lg font-bold">
              🔒 SOLD
            </span>
          ) : (
            <span className={`badge ${
              car.listingType === 'sale' 
                ? 'badge-success' 
                : 'badge-primary'
            } badge-lg font-bold`}>
              {car.listingType === 'sale' ? 'For Sale' : 'For Rent'}
            </span>
          )}
        </div>
      </figure>

      {/* Content */}
      <div className="card-body">
        <h3 className="card-title text-lg">
          {car.title || `${car.year} ${car.make} ${car.model}`}
        </h3>
        
        <p className="text-2xl font-bold text-primary">
          {formatPrice(car.price, car.listingType)}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 text-base-content/70 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <div>
            <div className="font-medium">
              {car.location?.city || car.city}, {car.location?.state || car.state}
            </div>
            {(car.location?.area || car.location) && (
              <div className="text-xs">
                {car.location?.area || car.location}
              </div>
            )}
          </div>
        </div>

        {/* Car details */}
        <div className="flex items-center gap-4 text-sm text-base-content/70 mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{car.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        {/* Stats (for seller view) */}
        {showStats && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-base-300">
            <span className={`badge ${
              car.status === 'active' ? 'badge-success' : 
              car.status === 'pending' ? 'badge-warning' : 'badge-error'
            }`}>
              {car.status}
            </span>
            <span className="text-sm text-base-content/70 flex items-center gap-1">
              <Eye className="w-4 h-4" /> 
              {car.views} views
            </span>
          </div>
        )}

        {/* Distance (for buyer view) */}
        {car.distance && (
          <div className="mt-2">
            <span className="text-sm text-base-content/70">
              {car.distance}km away
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CarCard
