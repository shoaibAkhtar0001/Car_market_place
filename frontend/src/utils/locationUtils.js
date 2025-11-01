// Location utilities for car marketplace

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Faster response, less accuracy
        timeout: 30000, // Increased to 30 seconds
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Filter cars by distance from user location
 * @param {Array} cars - Array of car objects
 * @param {Object} userLocation - User's location {latitude, longitude}
 * @param {number} maxDistance - Maximum distance in kilometers
 * @returns {Array} Filtered cars with distance property added
 */
export const filterCarsByDistance = (cars, userLocation, maxDistance) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return cars;
  }

  return cars
    .map(car => {
      // Check if car has coordinates
      if (car.location?.coordinates?.latitude && car.location?.coordinates?.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          car.location.coordinates.latitude,
          car.location.coordinates.longitude
        );
        return { ...car, distance: Math.round(distance * 10) / 10 }; // Round to 1 decimal
      }
      return { ...car, distance: null };
    })
    .filter(car => car.distance === null || car.distance <= maxDistance)
    .sort((a, b) => {
      // Sort by distance, null distances go to end
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
};

/**
 * Get coordinates for a city/state using a simple geocoding approach
 * This is a basic implementation - in production, you'd use a proper geocoding service
 * @param {string} city 
 * @param {string} state 
 * @returns {Object|null} {latitude, longitude} or null
 */
export const getCityCoordinates = (city, state) => {
  // Basic coordinate mapping for major cities (India and US)
  const cityCoordinates = {
    // Indian cities
    'mumbai,maharashtra': { latitude: 19.2881, longitude: 72.8562 },
    'delhi,delhi': { latitude: 28.6139, longitude: 77.2090 },
    'bangalore,karnataka': { latitude: 12.9716, longitude: 77.5946 },
    'hyderabad,telangana': { latitude: 17.3850, longitude: 78.4867 },
    'chennai,tamil nadu': { latitude: 13.0827, longitude: 80.2707 },
    'kolkata,west bengal': { latitude: 22.5726, longitude: 88.3639 },
    'pune,maharashtra': { latitude: 18.5204, longitude: 73.8567 },
    'ahmedabad,gujarat': { latitude: 23.0225, longitude: 72.5714 },
    // US cities
    'san francisco,ca': { latitude: 37.7749, longitude: -122.4194 },
    'los angeles,ca': { latitude: 34.0522, longitude: -118.2437 },
    'austin,tx': { latitude: 30.2672, longitude: -97.7431 },
    'dallas,tx': { latitude: 32.7767, longitude: -96.7970 },
    'miami,fl': { latitude: 25.7617, longitude: -80.1918 },
    'seattle,wa': { latitude: 47.6062, longitude: -122.3321 },
    'new york,ny': { latitude: 40.7128, longitude: -74.0060 },
    'denver,co': { latitude: 39.7392, longitude: -104.9903 },
    'las vegas,nv': { latitude: 36.1699, longitude: -115.1398 },
    'phoenix,az': { latitude: 33.4484, longitude: -112.0740 },
    'chicago,il': { latitude: 41.8781, longitude: -87.6298 }
  };

  const key = `${city.toLowerCase()},${state.toLowerCase()}`;
  return cityCoordinates[key] || null;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) {
    return 'Distance unknown';
  }
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  
  return `${distance}km away`;
};

/**
 * Check if browser supports geolocation
 * @returns {boolean}
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Reverse geocode coordinates to get address information
 * This is a mock implementation - in production, you'd use a proper geocoding service like Google Maps API
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Address information
 */
export const reverseGeocode = async (latitude, longitude) => {
  // Mock reverse geocoding based on approximate coordinates
  // In production, you would use a real geocoding service like Google Maps API
  const mockLocations = [
    // Mumbai and surrounding areas (Primary target location)
    {
      bounds: { minLat: 19.0, maxLat: 19.6, minLng: 72.7, maxLng: 73.1 },
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Central Mumbai'
    },
    {
      bounds: { minLat: 19.2, maxLat: 19.4, minLng: 72.8, maxLng: 73.0 },
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Andheri West'
    },
    {
      bounds: { minLat: 19.0, maxLat: 19.2, minLng: 72.8, maxLng: 73.0 },
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Bandra East'
    },
    {
      bounds: { minLat: 19.1, maxLat: 19.3, minLng: 72.9, maxLng: 73.1 },
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Powai'
    },
    {
      bounds: { minLat: 18.9, maxLat: 19.1, minLng: 72.8, maxLng: 73.0 },
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Lower Parel'
    },
    // Other Indian cities
    {
      bounds: { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.3 },
      city: 'Delhi',
      state: 'Delhi',
      area: 'Central Delhi'
    },
    {
      bounds: { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 },
      city: 'Bangalore',
      state: 'Karnataka',
      area: 'Central Bangalore'
    },
    {
      bounds: { minLat: 17.2, maxLat: 17.6, minLng: 78.2, maxLng: 78.7 },
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Central Hyderabad'
    },
    {
      bounds: { minLat: 13.0, maxLat: 13.2, minLng: 80.1, maxLng: 80.4 },
      city: 'Chennai',
      state: 'Tamil Nadu',
      area: 'Central Chennai'
    },
    // Major US Cities with wider bounds
    {
      bounds: { minLat: 40.4, maxLat: 41.0, minLng: -74.3, maxLng: -73.7 },
      city: 'New York',
      state: 'NY',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 33.7, maxLat: 34.3, minLng: -118.7, maxLng: -118.0 },
      city: 'Los Angeles',
      state: 'CA',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 41.6, maxLat: 42.1, minLng: -88.0, maxLng: -87.3 },
      city: 'Chicago',
      state: 'IL',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 29.5, maxLat: 30.1, minLng: -95.8, maxLng: -95.0 },
      city: 'Houston',
      state: 'TX',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 25.4, maxLat: 26.0, minLng: -80.6, maxLng: -80.0 },
      city: 'Miami',
      state: 'FL',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 47.3, maxLat: 47.9, minLng: -122.6, maxLng: -122.0 },
      city: 'Seattle',
      state: 'WA',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 37.5, maxLat: 38.0, minLng: -122.7, maxLng: -122.1 },
      city: 'San Francisco',
      state: 'CA',
      area: 'Bay Area'
    },
    {
      bounds: { minLat: 30.0, maxLat: 30.5, minLng: -98.0, maxLng: -97.5 },
      city: 'Austin',
      state: 'TX',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 32.5, maxLat: 33.0, minLng: -97.5, maxLng: -96.5 },
      city: 'Dallas',
      state: 'TX',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 33.2, maxLat: 33.7, minLng: -112.4, maxLng: -111.6 },
      city: 'Phoenix',
      state: 'AZ',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 39.5, maxLat: 40.0, minLng: -105.3, maxLng: -104.6 },
      city: 'Denver',
      state: 'CO',
      area: 'Metro Area'
    },
    {
      bounds: { minLat: 36.0, maxLat: 36.4, minLng: -115.4, maxLng: -114.9 },
      city: 'Las Vegas',
      state: 'NV',
      area: 'Metro Area'
    },
    // Add broader regional coverage
    {
      bounds: { minLat: 24.0, maxLat: 49.0, minLng: -125.0, maxLng: -66.0 },
      city: 'Your City',
      state: 'US',
      area: 'Your Area'
    }
  ];

  console.log(`Reverse geocoding for coordinates: ${latitude}, ${longitude}`);

  // Find matching location (check specific cities first, then fallback to general US)
  const location = mockLocations.find(loc => 
    latitude >= loc.bounds.minLat && latitude <= loc.bounds.maxLat &&
    longitude >= loc.bounds.minLng && longitude <= loc.bounds.maxLng
  );

  if (location) {
    console.log(`Found location: ${location.city}, ${location.state}`);
    return {
      city: location.city,
      state: location.state,
      area: location.area,
      fullAddress: `${location.city}, ${location.state}`
    };
  }

  // Enhanced fallback based on coordinate ranges
  let city = 'Your City';
  let state = 'US';
  let area = 'Your Area';

  // Determine general region based on coordinates
  if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
    // Within continental US bounds
    if (latitude >= 40 && longitude <= -74) {
      city = 'Northeast City';
      state = 'Northeast US';
      area = 'Northeast Region';
    } else if (latitude >= 32 && latitude <= 37 && longitude >= -125 && longitude <= -114) {
      city = 'West Coast City';
      state = 'West US';
      area = 'West Coast';
    } else if (latitude >= 25 && latitude <= 35 && longitude >= -106 && longitude <= -80) {
      city = 'Southern City';
      state = 'South US';
      area = 'Southern Region';
    } else if (latitude >= 35 && latitude <= 49 && longitude >= -104 && longitude <= -80) {
      city = 'Midwest City';
      state = 'Midwest US';
      area = 'Midwest Region';
    }
  }

  console.log(`Using fallback location: ${city}, ${state}`);
  return {
    city,
    state,
    area,
    fullAddress: `${city}, ${state}`
  };
};
