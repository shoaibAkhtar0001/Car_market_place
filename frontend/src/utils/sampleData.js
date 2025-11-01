// Sample cars for testing the marketplace
// This can be used to populate the system with test data

export const sampleCars = [
  {
    id: 'car_sample_1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 2500000,
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'Mumbai',
      state: 'MH',
      area: 'Bandra West',
      fullLocation: 'Mumbai, MH',
      coordinates: {
        latitude: 19.2881,
        longitude: 72.8562
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Music System'],
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_1',
    sellerName: 'Rajesh Kumar',
    sellerEmail: 'rajesh@example.com',
    sellerPhone: '+91 98765 43210',
    status: 'active',
    views: 45,
    inquiries: 3,
    datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_2',
    make: 'Honda',
    model: 'City',
    year: 2021,
    price: 1800000,
    mileage: 25000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Sedan',
    condition: 'Good',
    listingType: 'sale',
    location: {
      city: 'Delhi',
      state: 'DL',
      area: 'Connaught Place',
      fullLocation: 'Delhi, DL',
      coordinates: {
        latitude: 28.6139,
        longitude: 77.2090
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'Central Locking', 'Music System'],
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494976688153-c2256d7c47b0?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_2',
    sellerName: 'Priya Sharma',
    sellerEmail: 'priya@example.com',
    sellerPhone: '+91 87654 32109',
    status: 'active',
    views: 32,
    inquiries: 5,
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_3',
    make: 'Maruti Suzuki',
    model: 'Swift',
    year: 2020,
    price: 750000,
    mileage: 35000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Hatchback',
    condition: 'Good',
    listingType: 'sale',
    location: {
      city: 'Bangalore',
      state: 'KA',
      area: 'Koramangala',
      fullLocation: 'Bangalore, KA',
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'Central Locking'],
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_3',
    sellerName: 'Amit Patel',
    sellerEmail: 'amit@example.com',
    sellerPhone: '+91 76543 21098',
    status: 'active',
    views: 28,
    inquiries: 2,
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_4',
    make: 'Hyundai',
    model: 'Creta',
    year: 2023,
    price: 1200000,
    mileage: 8000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'Mumbai',
      state: 'MH',
      area: 'Andheri East',
      fullLocation: 'Mumbai, MH',
      coordinates: {
        latitude: 19.1136,
        longitude: 72.8697
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Sunroof', 'Touchscreen'],
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_1',
    sellerName: 'Rajesh Kumar',
    sellerEmail: 'rajesh@example.com',
    sellerPhone: '+91 98765 43210',
    status: 'active',
    views: 67,
    inquiries: 8,
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_5',
    make: 'Tata',
    model: 'Nexon',
    year: 2022,
    price: 45,
    mileage: 12000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'SUV',
    condition: 'Excellent',
    listingType: 'rent',
    location: {
      city: 'Mumbai',
      state: 'MH',
      area: 'Powai',
      fullLocation: 'Mumbai, MH',
      coordinates: {
        latitude: 19.1197,
        longitude: 72.9059
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Electric', 'Fast Charging'],
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_4',
    sellerName: 'Neha Singh',
    sellerEmail: 'neha@example.com',
    sellerPhone: '+91 87654 32100',
    status: 'active',
    views: 23,
    inquiries: 4,
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_6',
    make: 'Mahindra',
    model: 'XUV700',
    year: 2023,
    price: 2200000,
    mileage: 5000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'Delhi',
      state: 'DL',
      area: 'Gurgaon',
      fullLocation: 'Delhi, DL',
      coordinates: {
        latitude: 28.4595,
        longitude: 77.0266
      }
    },
    features: ['Air Conditioning', 'Power Steering', 'ABS', 'Airbags', 'Sunroof', 'AWD', 'Premium Audio'],
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_2',
    sellerName: 'Priya Sharma',
    sellerEmail: 'priya@example.com',
    sellerPhone: '+91 87654 32109',
    status: 'active',
    views: 89,
    inquiries: 12,
    datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    lastUpdated: new Date().toISOString()
  },
  // US Cars for global coverage
  {
    id: 'car_sample_7',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    price: 45000,
    mileage: 5000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'San Francisco',
      state: 'CA',
      area: 'Downtown',
      fullLocation: 'San Francisco, CA',
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    features: ['Autopilot', 'Supercharging', 'Premium Audio', 'Glass Roof', 'Over-the-air Updates'],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_5',
    sellerName: 'John Smith',
    sellerEmail: 'john@example.com',
    sellerPhone: '+1 555-123-4567',
    status: 'active',
    views: 156,
    inquiries: 15,
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_8',
    make: 'BMW',
    model: 'X5',
    year: 2022,
    price: 65000,
    mileage: 12000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'New York',
      state: 'NY',
      area: 'Manhattan',
      fullLocation: 'New York, NY',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    features: ['AWD', 'Premium Audio', 'Sunroof', 'Leather Seats', 'Navigation'],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_6',
    sellerName: 'Sarah Johnson',
    sellerEmail: 'sarah@example.com',
    sellerPhone: '+1 555-987-6543',
    status: 'active',
    views: 89,
    inquiries: 7,
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_9',
    make: 'Ford',
    model: 'Mustang',
    year: 2021,
    price: 85,
    mileage: 18000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    bodyType: 'Coupe',
    condition: 'Good',
    listingType: 'rent',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      area: 'Hollywood',
      fullLocation: 'Los Angeles, CA',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    features: ['V8 Engine', 'Sport Mode', 'Premium Audio', 'Racing Stripes'],
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_7',
    sellerName: 'Mike Davis',
    sellerEmail: 'mike@example.com',
    sellerPhone: '+1 555-456-7890',
    status: 'active',
    views: 234,
    inquiries: 18,
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'car_sample_10',
    make: 'Audi',
    model: 'A4',
    year: 2023,
    price: 42000,
    mileage: 3000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    condition: 'Excellent',
    listingType: 'sale',
    location: {
      city: 'Chicago',
      state: 'IL',
      area: 'Downtown',
      fullLocation: 'Chicago, IL',
      coordinates: {
        latitude: 41.8781,
        longitude: -87.6298
      }
    },
    features: ['Quattro AWD', 'Virtual Cockpit', 'Premium Audio', 'Heated Seats'],
    images: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1494976688153-c2256d7c47b0?w=800&h=600&fit=crop'
    ],
    sellerId: 'seller_8',
    sellerName: 'Emily Wilson',
    sellerEmail: 'emily@example.com',
    sellerPhone: '+1 555-321-0987',
    status: 'active',
    views: 67,
    inquiries: 5,
    datePosted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString()
  }
]

// Function to load sample data into the system
export const loadSampleData = (addCarFunction) => {
  sampleCars.forEach(car => {
    // Remove the id so addCar generates a new one
    const { id, ...carData } = car
    addCarFunction(carData)
  })
  console.log(`Loaded ${sampleCars.length} sample cars into the system`)
}
