const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { User, Car, Category } = require('../models');

dotenv.config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 Connected to MongoDB');

    // Clear existing data (optional - remove in production)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Car.deleteMany({});
    await Category.deleteMany({});

    // Create sample users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@carmarket.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'John Seller',
        email: 'john.seller@email.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Jane Buyer',
        email: 'jane.buyer@email.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Mike Motors',
        email: 'mike@motors.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@email.com',
        password: hashedPassword,
        role: 'buyer'
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@mumbaiautosales.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@premiumcars.in',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@luxuryautos.com',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Neha Gupta',
        email: 'neha.gupta@speedmotors.in',
        password: hashedPassword,
        role: 'seller'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@eliteautos.com',
        password: hashedPassword,
        role: 'seller'
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create car categories
    console.log('🏷️ Creating car categories...');
    const categories = await Category.create([
      {
        name: 'Sedan',
        slug: 'sedan',
        description: 'Four-door passenger cars',
        icon: '🚗',
        color: '#3B82F6'
      },
      {
        name: 'SUV',
        slug: 'suv',
        description: 'Sport Utility Vehicles',
        icon: '🚙',
        color: '#10B981'
      },
      {
        name: 'Hatchback',
        slug: 'hatchback',
        description: 'Compact cars with rear access door',
        icon: '🚘',
        color: '#F59E0B'
      },
      {
        name: 'Coupe',
        slug: 'coupe',
        description: 'Two-door sports cars',
        icon: '🏎️',
        color: '#EF4444'
      },
      {
        name: 'Truck',
        slug: 'truck',
        description: 'Pickup trucks and commercial vehicles',
        icon: '🛻',
        color: '#8B5CF6'
      }
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample cars
    console.log('🚗 Creating sample cars...');
    const sellers = users.filter(user => user.role === 'seller');
    
    const cars = await Car.create([
      {
        title: '2022 Honda Accord LX',
        description: 'Excellent condition Honda Accord with low mileage. Perfect for daily commuting.',
        make: 'Honda',
        model: 'Accord',
        year: 2022,
        mileage: 15000,
        price: 28500,
        originalPrice: 32000,
        fuelType: 'Petrol',
        transmission: 'CVT',
        engineSize: '1.5L',
        bodyType: 'Sedan',
        condition: 'Excellent',
        features: ['Backup Camera', 'Bluetooth', 'Cruise Control', 'Keyless Entry'],
        location: {
          city: 'Los Angeles',
          state: 'California',
          zipCode: '90210'
        },
        images: [{
          url: 'https://example.com/honda-accord-1.jpg',
          alt: 'Honda Accord Front View',
          isPrimary: true
        }],
        seller: sellers[0]._id,
        status: 'Active',
        isApproved: true,
        tags: ['reliable', 'fuel-efficient', 'family-car']
      },
      {
        title: '2021 Toyota RAV4 Adventure',
        description: 'Well-maintained RAV4 with all-wheel drive. Great for outdoor adventures.',
        make: 'Toyota',
        model: 'RAV4',
        year: 2021,
        mileage: 22000,
        price: 32000,
        originalPrice: 35000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engineSize: '2.5L',
        bodyType: 'SUV',
        condition: 'Good',
        features: ['AWD', 'Roof Rails', 'Apple CarPlay', 'Safety Sense 2.0'],
        location: {
          city: 'San Francisco',
          state: 'California',
          zipCode: '94102'
        },
        images: [{
          url: 'https://example.com/toyota-rav4-1.jpg',
          alt: 'Toyota RAV4 Front View',
          isPrimary: true
        }],
        seller: sellers[1]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'awd', 'adventure']
      },
      {
        title: '2020 BMW 3 Series 330i',
        description: 'Luxury sedan with premium features and excellent performance.',
        make: 'BMW',
        model: '3 Series',
        year: 2020,
        mileage: 28000,
        price: 35900,
        originalPrice: 42000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engineSize: '2.0L Turbo',
        bodyType: 'Sedan',
        condition: 'Excellent',
        features: ['Leather Seats', 'Sunroof', 'Navigation', 'Premium Audio'],
        location: {
          city: 'New York',
          state: 'New York',
          zipCode: '10001'
        },
        images: [{
          url: 'https://example.com/bmw-3series-1.jpg',
          alt: 'BMW 3 Series Front View',
          isPrimary: true
        }],
        seller: sellers[0]._id,
        status: 'Active',
        isApproved: true,
        tags: ['luxury', 'performance', 'premium']
      },
      {
        title: '2023 Tesla Model 3 Standard Range',
        description: 'Brand new electric vehicle with autopilot and supercharging capability.',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        mileage: 5000,
        price: 42000,
        originalPrice: 45000,
        fuelType: 'Electric',
        transmission: 'Automatic',
        engineSize: 'Electric Motor',
        bodyType: 'Sedan',
        condition: 'Like New',
        features: ['Autopilot', 'Supercharging', 'Over-the-Air Updates', 'Glass Roof'],
        location: {
          city: 'Austin',
          state: 'Texas',
          zipCode: '73301'
        },
        images: [{
          url: 'https://example.com/tesla-model3-1.jpg',
          alt: 'Tesla Model 3 Front View',
          isPrimary: true
        }],
        seller: sellers[1]._id,
        status: 'Active',
        isApproved: true,
        tags: ['electric', 'tesla', 'autopilot', 'eco-friendly']
      },
      {
        title: '2019 Ford F-150 XLT SuperCrew',
        description: 'Powerful pickup truck perfect for work and recreation.',
        make: 'Ford',
        model: 'F-150',
        year: 2019,
        mileage: 45000,
        price: 38500,
        originalPrice: 42000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engineSize: '3.5L V6',
        bodyType: 'Truck',
        condition: 'Good',
        features: ['4WD', 'Towing Package', 'Bed Liner', 'Running Boards'],
        location: {
          city: 'Dallas',
          state: 'Texas',
          zipCode: '75201'
        },
        images: [{
          url: 'https://example.com/ford-f150-1.jpg',
          alt: 'Ford F-150 Front View',
          isPrimary: true
        }],
        seller: sellers[0]._id,
        status: 'Active',
        isApproved: true,
        tags: ['truck', 'work', '4wd', 'towing']
      },
      // Mumbai-based cars from new sellers
      {
        title: '2023 Maruti Suzuki Swift VXI',
        description: 'Brand new Maruti Swift with excellent fuel efficiency. Perfect city car with modern features.',
        make: 'Maruti Suzuki',
        model: 'Swift',
        year: 2023,
        mileage: 2500,
        price: 750000,
        originalPrice: 800000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        engineSize: '1.2L',
        bodyType: 'Hatchback',
        condition: 'Like New',
        features: ['ABS', 'Airbags', 'Power Steering', 'Central Locking', 'Music System'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
          alt: 'Maruti Swift Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Maruti Swift Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Maruti Swift Interior',
          isPrimary: false
        }],
        seller: sellers[2]._id,
        status: 'Active',
        isApproved: true,
        tags: ['hatchback', 'fuel-efficient', 'city-car', 'maruti']
      },
      {
        title: '2022 Hyundai Creta SX Turbo',
        description: 'Premium SUV with turbo engine and advanced safety features. Excellent for family trips.',
        make: 'Hyundai',
        model: 'Creta',
        year: 2022,
        mileage: 18000,
        price: 1650000,
        originalPrice: 1800000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        engineSize: '1.4L Turbo',
        bodyType: 'SUV',
        condition: 'Excellent',
        features: ['Sunroof', 'Wireless Charging', 'Ventilated Seats', 'BlueLink', 'ADAS'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1549399137-8e2b8c4e5e6c?w=600&h=400&fit=crop',
          alt: 'Hyundai Creta Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1549399137-8e2b8c4e5e6c?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Hyundai Creta Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1549399137-8e2b8c4e5e6c?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Hyundai Creta Interior',
          isPrimary: false
        }],
        seller: sellers[3]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'family', 'turbo', 'premium']
      },
      {
        title: '2021 Tata Nexon EV Max',
        description: 'Electric SUV with long range and fast charging capability. Eco-friendly and cost-effective.',
        make: 'Tata',
        model: 'Nexon EV',
        year: 2021,
        mileage: 25000,
        price: 1450000,
        originalPrice: 1600000,
        fuelType: 'Electric',
        transmission: 'Automatic',
        engineSize: 'Electric Motor',
        bodyType: 'SUV',
        condition: 'Good',
        features: ['Fast Charging', 'Regenerative Braking', 'Connected Car', 'ADAS', 'Wireless Charging'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop',
          alt: 'Tata Nexon EV Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Tata Nexon EV Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Tata Nexon EV Interior',
          isPrimary: false
        }],
        seller: sellers[4]._id,
        status: 'Active',
        isApproved: true,
        tags: ['electric', 'suv', 'eco-friendly', 'tata']
      },
      {
        title: '2023 Mahindra XUV700 AX7',
        description: 'Feature-loaded premium SUV with advanced driver assistance and luxury interiors.',
        make: 'Mahindra',
        model: 'XUV700',
        year: 2023,
        mileage: 8000,
        price: 2200000,
        originalPrice: 2400000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        engineSize: '2.2L mHawk',
        bodyType: 'SUV',
        condition: 'Like New',
        features: ['ADAS', 'Panoramic Sunroof', 'Sony 3D Sound', 'AdrenoX Connect', '7-Seater'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
          alt: 'Mahindra XUV700 Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Mahindra XUV700 Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Mahindra XUV700 Interior',
          isPrimary: false
        }],
        seller: sellers[5]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'luxury', '7-seater', 'mahindra']
      },
      {
        title: '2022 Kia Seltos HTX Plus',
        description: 'Stylish compact SUV with premium features and excellent build quality.',
        make: 'Kia',
        model: 'Seltos',
        year: 2022,
        mileage: 22000,
        price: 1550000,
        originalPrice: 1700000,
        fuelType: 'Petrol',
        transmission: 'CVT',
        engineSize: '1.5L',
        bodyType: 'SUV',
        condition: 'Excellent',
        features: ['UVO Connect', 'Air Purifier', 'Ventilated Seats', 'Wireless Charging', 'Bose Audio'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
          alt: 'Kia Seltos Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Kia Seltos Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Kia Seltos Interior',
          isPrimary: false
        }],
        seller: sellers[6]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'compact', 'stylish', 'kia']
      },
      {
        title: '2023 Honda City ZX CVT',
        description: 'Premium sedan with advanced safety features and excellent fuel economy.',
        make: 'Honda',
        model: 'City',
        year: 2023,
        mileage: 5000,
        price: 1350000,
        originalPrice: 1450000,
        fuelType: 'Petrol',
        transmission: 'CVT',
        engineSize: '1.5L i-VTEC',
        bodyType: 'Sedan',
        condition: 'Like New',
        features: ['Honda SENSING', 'Sunroof', 'Wireless Charging', 'Alexa Connectivity', 'LED Headlights'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
          alt: 'Honda City Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Honda City Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Honda City Interior',
          isPrimary: false
        }],
        seller: sellers[2]._id,
        status: 'Active',
        isApproved: true,
        tags: ['sedan', 'fuel-efficient', 'premium', 'honda']
      },
      {
        title: '2021 Volkswagen Taigun GT Plus',
        description: 'German engineering meets Indian roads. Turbocharged performance with premium comfort.',
        make: 'Volkswagen',
        model: 'Taigun',
        year: 2021,
        mileage: 28000,
        price: 1750000,
        originalPrice: 1900000,
        fuelType: 'Petrol',
        transmission: 'DSG',
        engineSize: '1.0L TSI',
        bodyType: 'SUV',
        condition: 'Good',
        features: ['Virtual Cockpit', 'Wireless Charging', 'Ventilated Seats', 'My Volkswagen Connect', 'ESP'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop',
          alt: 'Volkswagen Taigun Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Volkswagen Taigun Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Volkswagen Taigun Interior',
          isPrimary: false
        }],
        seller: sellers[3]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'german', 'turbo', 'premium']
      },
      {
        title: '2022 Skoda Kushaq Style',
        description: 'European design with robust build quality. Perfect blend of comfort and performance.',
        make: 'Skoda',
        model: 'Kushaq',
        year: 2022,
        mileage: 15000,
        price: 1650000,
        originalPrice: 1800000,
        fuelType: 'Petrol',
        transmission: 'Manual',
        engineSize: '1.5L TSI',
        bodyType: 'SUV',
        condition: 'Excellent',
        features: ['MySkoda Connect', 'Wireless Charging', 'Ventilated Seats', 'Canton Sound System', 'ESC'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop',
          alt: 'Skoda Kushaq Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Skoda Kushaq Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Skoda Kushaq Interior',
          isPrimary: false
        }],
        seller: sellers[4]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'european', 'build-quality', 'skoda']
      },
      {
        title: '2023 MG Hector Plus Sharp',
        description: 'Feature-rich 7-seater SUV with internet connectivity and premium amenities.',
        make: 'MG',
        model: 'Hector Plus',
        year: 2023,
        mileage: 12000,
        price: 2100000,
        originalPrice: 2300000,
        fuelType: 'Petrol',
        transmission: 'CVT',
        engineSize: '1.5L Turbo',
        bodyType: 'SUV',
        condition: 'Like New',
        features: ['i-SMART', 'Panoramic Sunroof', 'Infinity Audio', '7-Seater', 'ADAS Level 2'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
          alt: 'MG Hector Plus Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'MG Hector Plus Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'MG Hector Plus Interior',
          isPrimary: false
        }],
        seller: sellers[5]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', '7-seater', 'connected', 'mg']
      },
      {
        title: '2022 Jeep Compass Limited Plus',
        description: 'Rugged American SUV with off-road capabilities and premium interiors.',
        make: 'Jeep',
        model: 'Compass',
        year: 2022,
        mileage: 20000,
        price: 2800000,
        originalPrice: 3100000,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        engineSize: '2.0L Multijet',
        bodyType: 'SUV',
        condition: 'Excellent',
        features: ['4x4', 'Uconnect', 'Panoramic Sunroof', 'Ventilated Seats', 'Trail Rated'],
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          coordinates: { latitude: 19.2881, longitude: 72.8562 }
        },
        images: [{
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
          alt: 'Jeep Compass Front View',
          isPrimary: true
        }, {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&auto=format&q=60',
          alt: 'Jeep Compass Side View',
          isPrimary: false
        }, {
          url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop&auto=format&q=40',
          alt: 'Jeep Compass Interior',
          isPrimary: false
        }],
        seller: sellers[6]._id,
        status: 'Active',
        isApproved: true,
        tags: ['suv', 'off-road', '4x4', 'jeep']
      }
    ]);

    console.log(`✅ Created ${cars.length} sample cars`);

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏷️ Categories: ${categories.length}`);
    console.log(`   🚗 Cars: ${cars.length}`);
    console.log('\n🔐 Sample Login Credentials:');
    console.log('   Admin: admin@carmarket.com / password123');
    console.log('   Seller: john.seller@email.com / password123');
    console.log('   Buyer: jane.buyer@email.com / password123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

// Run the initialization
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
