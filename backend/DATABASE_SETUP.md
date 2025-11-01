# 🗄️ MongoDB Database Setup Guide

## 📋 Overview

Your car marketplace now has a complete MongoDB database structure with the following models:

### 🏗️ Database Models

1. **👤 User Model** - User authentication and profiles
2. **🚗 Car Model** - Car listings with detailed specifications
3. **🏷️ Category Model** - Car categories and classifications
4. **💰 Transaction Model** - Purchase transactions and payments
5. **❤️ Wishlist Model** - User favorite cars
6. **⭐ Review Model** - Car and user reviews/ratings
7. **💬 Message Model** - Buyer-seller communication

## 🚀 Quick Setup

### 1. **Install MongoDB**

**Option A: MongoDB Community Server (Local)**
- Download from: https://www.mongodb.com/try/download/community
- Install and start MongoDB service
- Default connection: `mongodb://127.0.0.1:27017/car_marketplace`

**Option B: MongoDB Atlas (Cloud)**
- Create account at: https://www.mongodb.com/atlas
- Create a free cluster
- Get connection string and update `.env` file

### 2. **Environment Configuration**

Update your `.env` file:
```env
# Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/car_marketplace

# OR MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/car_marketplace

JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

### 3. **Initialize Database with Sample Data**

```bash
cd backend
node scripts/initDatabase.js
```

This will create:
- ✅ 5 sample users (admin, sellers, buyers)
- ✅ 5 car categories
- ✅ 5 sample car listings
- ✅ All necessary indexes

## 🔐 Sample Login Credentials

After running the initialization script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carmarket.com | password123 |
| Seller | john.seller@email.com | password123 |
| Seller | mike@motors.com | password123 |
| Buyer | jane.buyer@email.com | password123 |
| Buyer | sarah@email.com | password123 |

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Cars
- `GET /api/cars` - Get all cars (with filtering)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car listing (sellers only)
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Delete car listing
- `GET /api/cars/seller/:sellerId` - Get cars by seller
- `POST /api/cars/:id/approve` - Approve car (admin only)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add car to wishlist
- `DELETE /api/wishlist/:carId` - Remove from wishlist
- `PUT /api/wishlist/:carId` - Update wishlist item
- `GET /api/wishlist/check/:carId` - Check if car is in wishlist

## 🏗️ Database Schema Details

### Car Model Features
- **Basic Info**: Title, description, make, model, year
- **Specifications**: Engine, transmission, fuel type, mileage
- **Pricing**: Current price, original price
- **Location**: City, state, coordinates
- **Media**: Multiple images with primary image selection
- **Status**: Draft, Active, Sold, Under Review
- **Engagement**: Views, inquiries, favorites count
- **Search**: Full-text search on title, description, tags

### Advanced Features
- **Geolocation**: Store coordinates for location-based search
- **Image Management**: Multiple images with primary selection
- **Price Tracking**: Original vs current price for deals
- **View Analytics**: Track car listing views
- **Approval Workflow**: Admin approval system
- **Search & Filters**: Advanced filtering by multiple criteria

### Wishlist Features
- **Price Tracking**: Track price changes since added
- **Notifications**: Price alerts and status updates
- **Priority Levels**: High, Medium, Low priority
- **View Tracking**: Track how often user views wishlist items

## 🔍 Database Indexes

Optimized indexes for fast queries:
- Car search by make, model, price, location
- User-specific queries (wishlist, listings)
- Date-based sorting (newest first)
- Status and approval filters

## 📊 Admin Dashboard Data

The database supports comprehensive admin analytics:
- Total cars, active listings, pending approvals
- Revenue statistics and transaction tracking
- User engagement metrics
- Popular car makes/models

## 🔧 Development Commands

```bash
# Start MongoDB (if local)
mongod

# Start backend server
npm run dev

# Initialize database with sample data
node scripts/initDatabase.js

# Connect to MongoDB shell
mongo car_marketplace
```

## 🚀 Production Deployment

For production:
1. Use MongoDB Atlas or dedicated MongoDB server
2. Update connection string in environment variables
3. Enable authentication and SSL
4. Set up regular backups
5. Monitor performance and optimize queries

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (admin, seller, buyer)
- Input validation and sanitization
- Protected routes with middleware

Your car marketplace database is now ready for full-scale operation! 🎉
