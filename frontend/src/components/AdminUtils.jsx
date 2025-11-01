import { useCarContext } from '../context/CarContext'
import { loadSampleData } from '../utils/sampleData'
import { getCityCoordinates, getCurrentLocation, reverseGeocode } from '../utils/locationUtils'

const AdminUtils = () => {
  const { cars, clearAllCars, addCar, updateCar } = useCarContext()

  const handleLoadSampleData = () => {
    if (window.confirm('This will add sample cars to the system. Continue?')) {
      loadSampleData(addCar)
      alert('Sample data loaded successfully!')
    }
  }

  const handleClearAllData = () => {
    if (window.confirm('This will permanently delete all cars from the system. Are you sure?')) {
      clearAllCars()
      alert('All cars cleared successfully!')
    }
  }

  const handleCheckLocalStorage = () => {
    try {
      const savedCars = localStorage.getItem('carMarketplace_cars')
      if (savedCars) {
        const parsedCars = JSON.parse(savedCars)
        alert(`LocalStorage contains ${parsedCars.length} cars:\n${parsedCars.map(car => `- ${car.make} ${car.model}`).join('\n')}`)
      } else {
        alert('No cars found in localStorage')
      }
    } catch (error) {
      alert(`Error reading localStorage: ${error.message}`)
    }
  }

  const handleForceReload = () => {
    window.location.reload()
  }

  const handleFixCarCoordinates = () => {
    if (!window.confirm('This will update coordinates for all cars based on their city/state. Continue?')) {
      return
    }

    let updatedCount = 0
    let errorCount = 0

    cars.forEach(car => {
      if (car.location?.city && car.location?.state) {
        const coordinates = getCityCoordinates(car.location.city, car.location.state)
        if (coordinates) {
          updateCar(car.id, {
            location: {
              ...car.location,
              coordinates: coordinates
            }
          })
          updatedCount++
        } else {
          console.warn(`No coordinates found for ${car.location.city}, ${car.location.state}`)
          errorCount++
        }
      } else {
        console.warn(`Car ${car.id} missing city/state information`)
        errorCount++
      }
    })

    alert(`Coordinate fix complete!\nUpdated: ${updatedCount} cars\nErrors: ${errorCount} cars`)
  }

  const handleAddCarsNearMe = async () => {
    try {
      if (!window.confirm('This will detect your location and add sample cars nearby. Continue?')) {
        return
      }

      alert('Detecting your location... Please allow location access when prompted.')
      
      // Get user's current location
      const userLocation = await getCurrentLocation()
      console.log('User location:', userLocation)
      
      // Reverse geocode to get city/state
      const locationInfo = await reverseGeocode(userLocation.latitude, userLocation.longitude)
      console.log('Location info:', locationInfo)
      
      // Create sample cars near user's location
      const nearbyCars = [
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 28000,
          mileage: 5000,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          bodyType: 'Sedan',
          condition: 'Excellent',
          listingType: 'sale',
          location: {
            city: locationInfo.city,
            state: locationInfo.state,
            area: locationInfo.area,
            fullLocation: `${locationInfo.city}, ${locationInfo.state}`,
            coordinates: {
              latitude: userLocation.latitude + (Math.random() - 0.5) * 0.02, // Within ~1km
              longitude: userLocation.longitude + (Math.random() - 0.5) * 0.02
            }
          },
          features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Backup Camera'],
          images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
          ],
          sellerId: 'seller_local_1',
          sellerName: 'Local Seller',
          sellerEmail: 'local@example.com',
          sellerPhone: '+1 555-000-0001',
          status: 'active',
          views: 12,
          inquiries: 2,
          datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          make: 'Honda',
          model: 'Civic',
          year: 2022,
          price: 65,
          mileage: 15000,
          fuelType: 'Petrol',
          transmission: 'Manual',
          bodyType: 'Sedan',
          condition: 'Good',
          listingType: 'rent',
          location: {
            city: locationInfo.city,
            state: locationInfo.state,
            area: locationInfo.area,
            fullLocation: `${locationInfo.city}, ${locationInfo.state}`,
            coordinates: {
              latitude: userLocation.latitude + (Math.random() - 0.5) * 0.02,
              longitude: userLocation.longitude + (Math.random() - 0.5) * 0.02
            }
          },
          features: ['Air Conditioning', 'Power Steering', 'Bluetooth', 'USB Charging'],
          images: [
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1494976688153-c2256d7c47b0?w=800&h=600&fit=crop'
          ],
          sellerId: 'seller_local_2',
          sellerName: 'Nearby Rental',
          sellerEmail: 'rental@example.com',
          sellerPhone: '+1 555-000-0002',
          status: 'active',
          views: 8,
          inquiries: 1,
          datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          make: 'Ford',
          model: 'F-150',
          year: 2021,
          price: 35000,
          mileage: 25000,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          bodyType: 'Truck',
          condition: 'Good',
          listingType: 'sale',
          location: {
            city: locationInfo.city,
            state: locationInfo.state,
            area: locationInfo.area,
            fullLocation: `${locationInfo.city}, ${locationInfo.state}`,
            coordinates: {
              latitude: userLocation.latitude + (Math.random() - 0.5) * 0.02,
              longitude: userLocation.longitude + (Math.random() - 0.5) * 0.02
            }
          },
          features: ['4WD', 'Towing Package', 'Bed Liner', 'Backup Camera', 'Bluetooth'],
          images: [
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
          ],
          sellerId: 'seller_local_3',
          sellerName: 'Truck Dealer',
          sellerEmail: 'trucks@example.com',
          sellerPhone: '+1 555-000-0003',
          status: 'active',
          views: 34,
          inquiries: 5,
          datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ]

      // Add cars to the system
      nearbyCars.forEach(car => addCar(car))
      
      alert(`Success! Added ${nearbyCars.length} cars near your location:\n${locationInfo.city}, ${locationInfo.state}\n\nCoordinates: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`)
      
    } catch (error) {
      console.error('Error adding cars near user:', error)
      alert(`Error: ${error.message}\n\nTip: Make sure to allow location access when prompted by your browser.`)
    }
  }

  const handleAddMumbaiCars = () => {
    if (!window.confirm('This will add cars specifically in Mumbai near your location. Continue?')) {
      return
    }

    // Your current coordinates in Mumbai
    const userLat = 19.1332
    const userLng = 72.8990

    const mumbaiCars = [
      {
        make: 'Maruti Suzuki',
        model: 'Swift',
        year: 2023,
        price: 750000,
        mileage: 8000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        bodyType: 'Hatchback',
        condition: 'Excellent',
        listingType: 'sale',
        location: {
          city: 'Mumbai',
          state: 'MH',
          area: 'Andheri West',
          fullLocation: 'Mumbai, MH',
          coordinates: {
            latitude: userLat + 0.005, // ~500m away
            longitude: userLng + 0.005
          }
        },
        features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Music System'],
        images: [
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop'
        ],
        sellerId: 'seller_mumbai_1',
        sellerName: 'Mumbai Motors',
        sellerEmail: 'mumbai@example.com',
        sellerPhone: '+91 98765 43210',
        status: 'active',
        views: 25,
        inquiries: 3,
        datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        make: 'Hyundai',
        model: 'i20',
        year: 2022,
        price: 45,
        mileage: 12000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Hatchback',
        condition: 'Good',
        listingType: 'rent',
        location: {
          city: 'Mumbai',
          state: 'MH',
          area: 'Bandra East',
          fullLocation: 'Mumbai, MH',
          coordinates: {
            latitude: userLat - 0.003, // ~300m away
            longitude: userLng + 0.002
          }
        },
        features: ['Air Conditioning', 'Power Steering', 'Bluetooth', 'Touchscreen'],
        images: [
          'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
        ],
        sellerId: 'seller_mumbai_2',
        sellerName: 'Bandra Rentals',
        sellerEmail: 'bandra@example.com',
        sellerPhone: '+91 87654 32109',
        status: 'active',
        views: 18,
        inquiries: 2,
        datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        make: 'Tata',
        model: 'Nexon',
        year: 2023,
        price: 1200000,
        mileage: 5000,
        fuelType: 'Electric',
        transmission: 'Automatic',
        bodyType: 'SUV',
        condition: 'Excellent',
        listingType: 'sale',
        location: {
          city: 'Mumbai',
          state: 'MH',
          area: 'Powai',
          fullLocation: 'Mumbai, MH',
          coordinates: {
            latitude: userLat + 0.002, // ~200m away
            longitude: userLng - 0.004
          }
        },
        features: ['Electric', 'Fast Charging', 'Touchscreen', 'Connected Car', 'Sunroof'],
        images: [
          'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
        ],
        sellerId: 'seller_mumbai_3',
        sellerName: 'EV Mumbai',
        sellerEmail: 'ev@example.com',
        sellerPhone: '+91 76543 21098',
        status: 'active',
        views: 67,
        inquiries: 8,
        datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        make: 'Honda',
        model: 'City',
        year: 2022,
        price: 1500000,
        mileage: 15000,
        fuelType: 'Petrol',
        transmission: 'CVT',
        bodyType: 'Sedan',
        condition: 'Excellent',
        listingType: 'sale',
        location: {
          city: 'Mumbai',
          state: 'MH',
          area: 'Malad West',
          fullLocation: 'Mumbai, MH',
          coordinates: {
            latitude: userLat - 0.001, // ~100m away
            longitude: userLng + 0.003
          }
        },
        features: ['CVT', 'Sunroof', 'Touchscreen', 'Rear Camera', 'Cruise Control'],
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1494976688153-c2256d7c47b0?w=800&h=600&fit=crop'
        ],
        sellerId: 'seller_mumbai_4',
        sellerName: 'City Cars Mumbai',
        sellerEmail: 'city@example.com',
        sellerPhone: '+91 65432 10987',
        status: 'active',
        views: 43,
        inquiries: 6,
        datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        make: 'Mahindra',
        model: 'XUV300',
        year: 2021,
        price: 75,
        mileage: 22000,
        fuelType: 'Diesel',
        transmission: 'Manual',
        bodyType: 'SUV',
        condition: 'Good',
        listingType: 'rent',
        location: {
          city: 'Mumbai',
          state: 'MH',
          area: 'Goregaon East',
          fullLocation: 'Mumbai, MH',
          coordinates: {
            latitude: userLat + 0.004, // ~400m away
            longitude: userLng - 0.002
          }
        },
        features: ['Diesel', 'Sunroof', 'Touchscreen', '7 Airbags', 'Disc Brakes'],
        images: [
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
        ],
        sellerId: 'seller_mumbai_5',
        sellerName: 'SUV Rentals Mumbai',
        sellerEmail: 'suv@example.com',
        sellerPhone: '+91 54321 09876',
        status: 'active',
        views: 29,
        inquiries: 4,
        datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      }
    ]

    // Add cars to the system
    mumbaiCars.forEach(car => addCar(car))
    
    alert(`Success! Added ${mumbaiCars.length} cars near your Mumbai location:\n\nAll cars are within 1km of coordinates (19.1332, 72.8990)\n\n- 3 cars for sale\n- 2 cars for rent\n- Mix of Hatchback, Sedan, SUV`)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
      <h3 className="font-bold text-gray-800 mb-3">Admin Utils</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-600">Cars in system: {cars.length}</p>
        <button
          onClick={handleLoadSampleData}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
        >
          Load Sample Cars
        </button>
        <button
          onClick={handleClearAllData}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
        >
          Clear All Cars
        </button>
        <button
          onClick={handleCheckLocalStorage}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
        >
          Check LocalStorage
        </button>
        <button
          onClick={handleForceReload}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
        >
          Force Reload
        </button>
        <button
          onClick={handleFixCarCoordinates}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm"
        >
          Fix Car Coordinates
        </button>
        <button
          onClick={handleAddCarsNearMe}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm"
        >
          Add Cars Near Me
        </button>
        <button
          onClick={handleAddMumbaiCars}
          className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
        >
          Add Mumbai Cars
        </button>
      </div>
    </div>
  )
}

export default AdminUtils
