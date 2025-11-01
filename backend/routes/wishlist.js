const express = require('express');
const { Wishlist, Car } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/wishlist - Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findByUser(req.user.id);
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wishlist - Add car to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { carId, notes } = req.body;

    // Check if car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user: req.user.id,
      car: carId
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Car is already in your wishlist' });
    }

    const wishlistItem = await Wishlist.addToWishlist(
      req.user.id,
      carId,
      car.price,
      notes
    );

    await wishlistItem.populate('car');
    
    // Update car favorites count
    car.favorites += 1;
    await car.save();

    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/wishlist/:carId - Remove car from wishlist
router.delete('/:carId', auth, async (req, res) => {
  try {
    const removed = await Wishlist.removeFromWishlist(req.user.id, req.params.carId);
    
    if (!removed) {
      return res.status(404).json({ message: 'Car not found in wishlist' });
    }

    // Update car favorites count
    const car = await Car.findById(req.params.carId);
    if (car && car.favorites > 0) {
      car.favorites -= 1;
      await car.save();
    }

    res.json({ message: 'Car removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/wishlist/:carId - Update wishlist item
router.put('/:carId', auth, async (req, res) => {
  try {
    const { notes, priority, maxPrice, notifications } = req.body;

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { user: req.user.id, car: req.params.carId },
      { notes, priority, maxPrice, notifications },
      { new: true }
    ).populate('car');

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Car not found in wishlist' });
    }

    res.json(wishlistItem);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// GET /api/wishlist/check/:carId - Check if car is in wishlist
router.get('/check/:carId', auth, async (req, res) => {
  try {
    const isInWishlist = await Wishlist.isInWishlist(req.user.id, req.params.carId);
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/wishlist/:carId/view - Track wishlist item view
router.post('/:carId/view', auth, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      user: req.user.id,
      car: req.params.carId
    });

    if (wishlistItem) {
      await wishlistItem.updateViewCount();
      res.json({ message: 'View tracked' });
    } else {
      res.status(404).json({ message: 'Car not found in wishlist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
