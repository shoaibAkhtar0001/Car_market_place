const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Booking = require('../models/Booking')
const Car = require('../models/car')

// Create a booking (buyer)
router.post('/', auth, async (req, res) => {
  try {
    const { carId, startDate, endDate, buyerName, buyerEmail, buyerPhone, notes } = req.body
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId, startDate, endDate are required' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!(start < end)) {
      return res.status(400).json({ message: 'Invalid date range' })
    }

    const car = await Car.findById(carId)
    if (!car) return res.status(404).json({ message: 'Car not found' })

    // For MVP, allow booking for any car; in future restrict to listingType rent
    const dayMs = 24 * 60 * 60 * 1000
    const days = Math.max(1, Math.ceil((end - start) / dayMs))
    const dailyRate = car.price || 0
    const totalPrice = days * dailyRate

    // overlap check
    const overlap = await Booking.hasOverlap(carId, start, end)
    if (overlap) {
      return res.status(409).json({ message: 'Selected dates are no longer available' })
    }

    const booking = await Booking.create({
      carId: car._id.toString(),
      sellerId: car.seller?.toString() || '',
      buyerId: req.user.id || req.user._id?.toString(),
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending',
      buyerName,
      buyerEmail,
      buyerPhone,
      notes,
    })

    const io = req.app.locals.io
    if (io) {
      io.to(`car:${booking.carId}`).emit('booking:created', booking)
      if (booking.buyerId) io.to(`user:${booking.buyerId}`).emit('booking:created', booking)
      if (booking.sellerId) io.to(`user:${booking.sellerId}`).emit('booking:created', booking)
    }

    return res.status(201).json(booking)
  } catch (err) {
    console.error('Create booking error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get bookings for a car (public)
router.get('/car/:carId', async (req, res) => {
  try {
    const bookings = await Booking.find({ carId: req.params.carId })
      .sort({ startDate: 1 })
    return res.json(bookings)
  } catch (err) {
    console.error('Get car bookings error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get current buyer bookings
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id?.toString()
    const bookings = await Booking.find({ buyerId: userId }).sort({ createdAt: -1 })
    return res.json(bookings)
  } catch (err) {
    console.error('Get my bookings error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get seller bookings (across their cars)
router.get('/seller', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id?.toString()
    const bookings = await Booking.find({ sellerId: userId }).sort({ createdAt: -1 })
    return res.json(bookings)
  } catch (err) {
    console.error('Get seller bookings error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Update booking status (seller approve/decline; buyer cancel)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['pending','confirmed','cancelled','declined','completed']
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' })

    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const userId = req.user.id || req.user._id?.toString()
    const isSeller = booking.sellerId === userId
    const isBuyer = booking.buyerId === userId

    // Permissions
    if (['confirmed','declined','completed'].includes(status) && !isSeller) {
      return res.status(403).json({ message: 'Only seller can set this status' })
    }
    if (status === 'cancelled' && !(isBuyer || isSeller)) {
      return res.status(403).json({ message: 'Not allowed' })
    }

    booking.status = status
    await booking.save()

    const io = req.app.locals.io
    if (io) {
      io.to(`car:${booking.carId}`).emit('booking:updated', booking)
      if (booking.buyerId) io.to(`user:${booking.buyerId}`).emit('booking:updated', booking)
      if (booking.sellerId) io.to(`user:${booking.sellerId}`).emit('booking:updated', booking)
    }

    return res.json(booking)
  } catch (err) {
    console.error('Update booking status error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get rental quote for a date range
// GET /api/bookings/quote?carId=...&startDate=...&endDate=...
router.get('/quote', async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId, startDate, endDate are required' })
    }

    // Check if carId is a valid ObjectId (MongoDB car)
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(carId)
    if (!isObjectId) {
      // Local car ID - return generic quote (client should handle this)
      return res.status(400).json({ message: 'Quote only available for backend cars' })
    }

    const car = await Car.findById(carId)
    if (!car) return res.status(404).json({ message: 'Car not found' })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!(start < end)) {
      return res.status(400).json({ message: 'Invalid date range' })
    }

    const dayMs = 24 * 60 * 60 * 1000
    const days = Math.max(1, Math.ceil((end - start) / dayMs))
    const dailyRate = car.price || 0
    const subtotal = days * dailyRate
    const depositRate = 0.2
    const deposit = Math.round(subtotal * depositRate)
    const total = subtotal + deposit

    return res.json({
      days,
      dailyRate,
      deposit,
      subtotal,
      total,
      currency: 'USD',
    })
  } catch (err) {
    console.error('Get quote error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Check availability and return conflicts
// GET /api/bookings/availability?carId=...&startDate=...&endDate=...
router.get('/availability', async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.query
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'carId, startDate, endDate are required' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (!(start < end)) {
      return res.status(400).json({ message: 'Invalid date range' })
    }

    // Check if carId is a valid ObjectId (MongoDB car)
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(carId)
    if (!isObjectId) {
      // Local car ID - assume available (client handles local bookings)
      return res.json({ available: true, conflicts: [] })
    }

    const conflicts = await Booking.find({
      carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    }).select('startDate endDate status')

    return res.json({ available: conflicts.length === 0, conflicts })
  } catch (err) {
    console.error('Availability check error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
