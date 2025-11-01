import { useState, useEffect } from 'react'
import { MapPin, Crosshair, AlertCircle, Loader } from 'lucide-react'
import { getCurrentLocation, isGeolocationSupported, getCityCoordinates } from '../utils/locationUtils'

const LocationSearch = ({ 
  onLocationChange = () => {},
  userLocation = null,
  maxDistance = 10,
  onMaxDistanceChange = () => {},
  className = ''
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [manualLocation, setManualLocation] = useState('')

  const handleGetCurrentLocation = async () => {
    if (!isGeolocationSupported()) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    setLocationError('')

    try {
      const location = await getCurrentLocation()
      onLocationChange(location)
      setManualLocation('') // Clear manual input when using GPS
    } catch (error) {
      setLocationError(error.message)
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleManualLocationSubmit = (e) => {
    e.preventDefault()
    if (!manualLocation.trim()) return

    // Extract city and state from input
    const parts = manualLocation.split(',')
    const city = parts[0]?.trim()
    const state = parts[1]?.trim() || 'US'
    
    const coords = getCityCoordinates(city, state)

    if (coords) {
      onLocationChange(coords)
      setLocationError('')
    } else {
      setLocationError(`Location "${manualLocation}" not found. Try: Mumbai, Delhi, Bangalore, Chennai, Hyderabad, or major US cities like San Francisco, Los Angeles, New York`)
    }
  }

  const clearLocation = () => {
    onLocationChange(null)
    setManualLocation('')
    setLocationError('')
  }

  const distanceOptions = [1, 5, 10, 25, 50, 100]

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">Location Search</h3>
      </div>

      {/* Current location status */}
      {userLocation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Location set ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
              </span>
            </div>
            <button
              onClick={clearLocation}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {locationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{locationError}</span>
          </div>
        </div>
      )}

      {/* GPS Location Button */}
      <div className="mb-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          {isGettingLocation ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              Use My Current Location
            </>
          )}
        </button>
      </div>

      {/* Manual location input */}
      <div className="mb-4">
        <div className="text-center text-sm text-gray-500 mb-3">or</div>
        <form onSubmit={handleManualLocationSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter City Name
            </label>
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="e.g., Mumbai, Delhi, Bangalore, San Francisco..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors"
          >
            Search Location
          </button>
        </form>
      </div>

      {/* Distance filter */}
      {userLocation && (
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius
          </label>
          <div className="grid grid-cols-3 gap-2">
            {distanceOptions.map(distance => (
              <button
                key={distance}
                onClick={() => onMaxDistanceChange(distance)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  maxDistance === distance
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {distance}km
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Showing cars within {maxDistance}km of your location
          </div>
        </div>
      )}

      {/* Supported cities info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          <strong>Supported cities:</strong> Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune, Ahmedabad, San Francisco, Los Angeles, New York, Chicago, Austin, Dallas, Miami, Seattle
        </div>
      </div>
    </div>
  )
}

export default LocationSearch
