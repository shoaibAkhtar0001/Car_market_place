import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Car, DollarSign } from 'lucide-react'
import RegionalCarsList from './RegionalCarsList'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom car marker icon
const createCarIcon = (listingType, count = 1) => {
  const color = listingType === 'sale' ? '#10b981' : '#3b82f6' // green for sale, blue for rent
  const size = count > 1 ? 40 : 30
  const fontSize = count > 1 ? '12px' : '14px'
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${fontSize};
        font-weight: bold;
        cursor: pointer;
      ">
        ${count > 1 ? count : '🚗'}
      </div>
    `,
    className: 'custom-car-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  })
}

// Custom user location icon
const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #ef4444;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -5px;
          left: -5px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(239, 68, 68, 0.3);
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-user-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  })
}

// Component to fit map bounds to show all markers
const FitBounds = ({ cars, userLocation }) => {
  const map = useMap()

  useEffect(() => {
    if (!cars.length && !userLocation) return

    const bounds = L.latLngBounds()
    let hasValidBounds = false

    // Add user location to bounds
    if (userLocation) {
      bounds.extend([userLocation.latitude, userLocation.longitude])
      hasValidBounds = true
    }

    // Add car locations to bounds
    cars.forEach(car => {
      if (car.location?.coordinates?.latitude && car.location?.coordinates?.longitude) {
        bounds.extend([car.location.coordinates.latitude, car.location.coordinates.longitude])
        hasValidBounds = true
      }
    })

    if (hasValidBounds) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [cars, userLocation, map])

  return null
}

// Function to group nearby cars
const groupNearbyCars = (cars, threshold = 0.01) => {
  const groups = []
  const processed = new Set()

  cars.forEach((car, index) => {
    if (processed.has(index) || !car.location?.coordinates?.latitude || !car.location?.coordinates?.longitude) {
      return
    }

    const group = {
      cars: [car],
      center: {
        latitude: car.location.coordinates.latitude,
        longitude: car.location.coordinates.longitude
      },
      region: `${car.location?.city || car.city || 'Unknown'}, ${car.location?.state || car.state || 'Unknown'}`
    }

    processed.add(index)

    // Find nearby cars
    cars.forEach((otherCar, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex || 
          !otherCar.location?.coordinates?.latitude || !otherCar.location?.coordinates?.longitude) {
        return
      }

      const distance = Math.sqrt(
        Math.pow(car.location.coordinates.latitude - otherCar.location.coordinates.latitude, 2) +
        Math.pow(car.location.coordinates.longitude - otherCar.location.coordinates.longitude, 2)
      )

      if (distance <= threshold) {
        group.cars.push(otherCar)
        processed.add(otherIndex)
        
        // Update center to average position
        const avgLat = group.cars.reduce((sum, c) => sum + c.location.coordinates.latitude, 0) / group.cars.length
        const avgLng = group.cars.reduce((sum, c) => sum + c.location.coordinates.longitude, 0) / group.cars.length
        group.center = { latitude: avgLat, longitude: avgLng }
      }
    })

    groups.push(group)
  })

  return groups
}

const MapView = ({ 
  cars = [], 
  userLocation = null, 
  onCarClick = () => {},
  height = '500px',
  showUserLocation = true,
  className = ''
}) => {
  const mapRef = useRef()
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [showRegionalList, setShowRegionalList] = useState(false)

  // Default center (US center)
  const defaultCenter = [39.8283, -98.5795]
  const defaultZoom = 4

  // Determine map center
  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : cars.length > 0 && cars[0].location?.coordinates
    ? [cars[0].location.coordinates.latitude, cars[0].location.coordinates.longitude]
    : defaultCenter

  const mapZoom = userLocation ? 12 : defaultZoom

  const formatPrice = (price, listingType) => {
    return listingType === 'rent' ? `$${price}/day` : `$${price?.toLocaleString()}`
  }

  // Group nearby cars
  const carGroups = groupNearbyCars(cars)

  const handleMarkerClick = (group) => {
    if (group.cars.length === 1) {
      // Single car - navigate to details
      onCarClick(group.cars[0])
    } else {
      // Multiple cars - show regional list
      setSelectedRegion({
        cars: group.cars,
        region: group.region
      })
      setShowRegionalList(true)
    }
  }

  const handleCloseRegionalList = () => {
    setShowRegionalList(false)
    setSelectedRegion(null)
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="rounded-2xl overflow-hidden shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserIcon()}
          >
            <Popup>
              <div className="text-center p-2">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-gray-900">Your Location</span>
                </div>
                <p className="text-sm text-gray-600">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Car markers - grouped */}
        {carGroups.map((group, index) => {
          const primaryListingType = group.cars[0].listingType
          const carCount = group.cars.length
          
          return (
            <Marker
              key={`group-${index}`}
              position={[group.center.latitude, group.center.longitude]}
              icon={createCarIcon(primaryListingType, carCount)}
              eventHandlers={{
                click: () => handleMarkerClick(group)
              }}
            >
              <Popup>
                <div className="min-w-[280px] p-3">
                  {carCount === 1 ? (
                    // Single car popup
                    <div>
                      {/* Car image */}
                      {group.cars[0].images && group.cars[0].images.length > 0 && (
                        <img 
                          src={group.cars[0].images[0].url || group.cars[0].images[0]} 
                          alt={group.cars[0].title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      
                      {/* Car details */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                          {group.cars[0].title || `${group.cars[0].make} ${group.cars[0].model}`}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{group.region}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{group.cars[0].year} • {group.cars[0].fuelType}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            group.cars[0].listingType === 'sale' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {group.cars[0].listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-lg text-green-600">
                              {formatPrice(group.cars[0].price, group.cars[0].listingType)}
                            </span>
                          </div>
                          {group.cars[0].distance && (
                            <span className="text-sm text-gray-500">
                              {group.cars[0].distance}km away
                            </span>
                          )}
                        </div>

                        <button 
                          onClick={() => onCarClick(group.cars[0])}
                          className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Multiple cars popup
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Car className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        {carCount} Cars Available
                      </h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{group.region}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {group.cars.filter(c => c.listingType === 'sale').length} for sale • 
                        {group.cars.filter(c => c.listingType === 'rent').length} for rent
                      </div>
                      <button 
                        onClick={() => handleMarkerClick(group)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        View All Cars
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Auto-fit bounds */}
        <FitBounds cars={cars} userLocation={userLocation} />
      </MapContainer>

      {/* Regional Cars List Modal */}
      <RegionalCarsList
        cars={selectedRegion?.cars || []}
        region={selectedRegion?.region || ''}
        isOpen={showRegionalList}
        onClose={handleCloseRegionalList}
        onCarClick={(car) => {
          handleCloseRegionalList()
          onCarClick(car)
        }}
      />
      {/* Map legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <h4 className="font-bold text-gray-900 mb-2 text-sm">Legend</h4>
        <div className="space-y-2 text-xs">
          {showUserLocation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Your Location</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Cars for Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Cars for Rent</span>
          </div>
        </div>
      </div>

      {/* Cars count */}
      {cars.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-900">
            {cars.length} car{cars.length !== 1 ? 's' : ''} shown in {carGroups.length} location{carGroups.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default MapView
