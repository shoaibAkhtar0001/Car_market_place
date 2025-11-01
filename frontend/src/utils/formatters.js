// Utility functions for formatting data

/**
 * Format price based on listing type and currency
 */
export const formatPrice = (price, listingType = 'sale', currency = 'INR') => {
  if (!price) return 'Price not available'
  
  if (listingType === 'rent') {
    return currency === 'INR' ? `₹${price}/day` : `$${price}/day`
  }
  
  if (currency === 'INR') {
    // Format Indian Rupees in Lakhs/Crores
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)}Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)}L`
    } else {
      return `₹${price.toLocaleString('en-IN')}`
    }
  } else {
    // Format USD
    return `$${price.toLocaleString()}`
  }
}

/**
 * Format distance for display
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) {
    return 'Distance unknown'
  }
  
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`
  }
  
  return `${distance}km away`
}

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    active: 'badge-success',
    pending: 'badge-warning',
    sold: 'badge-error',
    draft: 'badge-ghost'
  }
  return colors[status] || 'badge-ghost'
}

/**
 * Format full location string
 */
export const formatLocation = (location) => {
  if (!location) return 'Location not specified'
  
  const { city, state, area } = location
  if (city && state) {
    return area ? `${city}, ${state} • ${area}` : `${city}, ${state}`
  }
  return 'Location not specified'
}
