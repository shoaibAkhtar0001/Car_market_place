import { createContext, useContext, useState, useEffect } from 'react'

const CarContext = createContext()

export const useCarContext = () => {
  const context = useContext(CarContext)
  if (!context) {
    throw new Error('useCarContext must be used within a CarProvider')
  }
  return context
}

export const CarProvider = ({ children }) => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cars from localStorage on initialization
  useEffect(() => {
    try {
      const savedCars = localStorage.getItem('carMarketplace_cars')
      if (savedCars) {
        const parsedCars = JSON.parse(savedCars)
        setCars(parsedCars)
        console.log(`CarContext initialized - loaded ${parsedCars.length} cars from storage`)
      } else {
        console.log('CarContext initialized - no saved cars found, starting fresh')
      }
    } catch (error) {
      console.error('Error loading cars from localStorage:', error)
      setCars([])
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cars to localStorage whenever cars array changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return // Don't save during initial load
    
    try {
      localStorage.setItem('carMarketplace_cars', JSON.stringify(cars))
      console.log(`Saved ${cars.length} cars to localStorage`)
    } catch (error) {
      console.error('Error saving cars to localStorage:', error)
    }
  }, [cars, isInitialized])

  // Debug: Log cars whenever they change
  useEffect(() => {
    console.log('Current cars in system:', cars.length)
    if (cars.length > 0) {
      console.log('Cars:', cars.map(car => ({ id: car.id, title: car.title, make: car.make, model: car.model })))
    }
  }, [cars])

  // Add a new car (called when seller creates listing)
  const addCar = (carData) => {
    const newCar = {
      ...carData,
      id: `car_${Date.now()}`,
      status: 'active',
      views: 0,
      inquiries: 0,
      datePosted: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    setCars(prevCars => [newCar, ...prevCars])
    setLastUpdate(Date.now()) // Trigger update for listeners
    console.log('New car added to system:', newCar.title)
    return newCar
  }

  // Update an existing car
  const updateCar = (carId, updates) => {
    setCars(prevCars => 
      prevCars.map(car => 
        car.id === carId 
          ? { ...car, ...updates, lastUpdated: new Date().toISOString() }
          : car
      )
    )
  }

  // Delete a car
  const deleteCar = (carId) => {
    setCars(prevCars => prevCars.filter(car => car.id !== carId))
    setLastUpdate(Date.now()) // Trigger update for listeners
  }

  // Clear all cars (for debugging/reset)
  const clearAllCars = () => {
    setCars([])
    setLastUpdate(Date.now())
    // Also clear from localStorage
    localStorage.removeItem('carMarketplace_cars')
    console.log('All cars cleared from system and localStorage')
  }

  // Reset all view counts to 0
  const resetAllViews = () => {
    setCars(prevCars => 
      prevCars.map(car => ({ ...car, views: 0, inquiries: 0 }))
    )
    setLastUpdate(Date.now())
    console.log('All view counts reset to 0')
  }

  // Get cars by seller
  const getCarsBySeller = (sellerId) => {
    return cars.filter(car => car.sellerId === sellerId)
  }
  // Get active cars for buyers
  const getActiveCars = () => {
    return cars.filter(car => car.status === 'active')
  }

  // Views are now static - no auto-increment functionality

  // Increment inquiries
  const incrementInquiries = (carId) => {
    setCars(prevCars => 
      prevCars.map(car => 
        car.id === carId 
          ? { ...car, inquiries: car.inquiries + 1 }
          : car
      )
    )
  }

  // Refresh cars from localStorage (useful when cars are updated by other components)
  const refreshCarsFromStorage = () => {
    try {
      const savedCars = localStorage.getItem('carMarketplace_cars')
      if (savedCars) {
        const parsedCars = JSON.parse(savedCars)
        setCars(parsedCars)
        setLastUpdate(Date.now())
        console.log(`CarContext refreshed - loaded ${parsedCars.length} cars from storage`)
        return parsedCars
      }
    } catch (error) {
      console.error('Error refreshing cars from localStorage:', error)
    }
    return cars
  }

  // Search cars
  const searchCars = (query, filters = {}) => {
    let filteredCars = getActiveCars()

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredCars = filteredCars.filter(car => {
        const make = (car.make || '').toLowerCase()
        const model = (car.model || '').toLowerCase()
        const title = (car.title || '').toLowerCase()
        const city = (car.location?.city || '').toLowerCase()
        const area = (car.location?.area || '').toLowerCase()
        return (
          make.includes(searchTerm) ||
          model.includes(searchTerm) ||
          title.includes(searchTerm) ||
          city.includes(searchTerm) ||
          area.includes(searchTerm)
        )
      })
    }

    // Apply filters
    if (filters.minPrice) {
      filteredCars = filteredCars.filter(car => car.price >= parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filteredCars = filteredCars.filter(car => car.price <= parseInt(filters.maxPrice))
    }
    if (filters.make) {
      filteredCars = filteredCars.filter(car => (car.make || '').toLowerCase().includes(filters.make.toLowerCase()))
    }
    if (filters.fuelType) {
      filteredCars = filteredCars.filter(car => (car.fuelType || '').toLowerCase() === filters.fuelType.toLowerCase())
    }
    if (filters.bodyType) {
      filteredCars = filteredCars.filter(car => (car.bodyType || '').toLowerCase() === filters.bodyType.toLowerCase())
    }

    return filteredCars
  }

  const value = {
    cars,
    loading,
    setLoading,
    lastUpdate,
    addCar,
    updateCar,
    deleteCar,
    clearAllCars,
    resetAllViews,
    getCarsBySeller,
    getActiveCars,
    incrementInquiries,
    searchCars,
    refreshCarsFromStorage
  }

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  )
}
