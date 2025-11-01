const express = require('express');
const { Car, User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/cars - Get all cars with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      make,
      model,
      minPrice,
      maxPrice,
      year,
      fuelType,
      transmission,
      bodyType,
      condition,
      city,
      state,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      status: 'Active',
      isApproved: true
    };

    // Apply filters
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (year) query.year = Number(year);
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (bodyType) query.bodyType = bodyType;
    if (condition) query.condition = condition;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const cars = await Car.find(query)
      .populate('seller', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Car.countDocuments(query);

    res.json({
      cars,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCars: total,
        hasNext: skip + cars.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/cars/:id - Get single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('seller', 'name email role createdAt');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Increment view count
    car.views += 1;
    await car.save();

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/cars - Create new car listing (sellers only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create car listings' });
    }

    const carData = {
      ...req.body,
      seller: req.user.id
    };

    const car = new Car(carData);
    await car.save();

    await car.populate('seller', 'name email');

    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
});

// PUT /api/cars/:id - Update car listing (seller or admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user owns the car or is admin
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    res.json(updatedCar);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE /api/cars/:id - Delete car listing (seller or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if user owns the car or is admin
    if (car.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.json({ message: 'Car listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

// GET /api/cars/seller/:sellerId - Get cars by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const cars = await Car.find({
      seller: req.params.sellerId,
      status: 'Active',
      isApproved: true
    })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Car.countDocuments({
      seller: req.params.sellerId,
      status: 'Active',
      isApproved: true
    });

    res.json({
      cars,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalCars: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/cars/:id/approve - Approve car listing (admin only)
router.post('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        status: 'Active'
      },
      { new: true }
    ).populate('seller', 'name email');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Approval failed', error: error.message });
  }
});

// GET /api/cars/stats/overview - Get car statistics (admin only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = await Car.aggregate([
      {
        $group: {
          _id: null,
          totalCars: { $sum: 1 },
          activeCars: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          pendingApproval: {
            $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] }
          },
          soldCars: {
            $sum: { $cond: [{ $eq: ['$status', 'Sold'] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    res.json(stats[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
