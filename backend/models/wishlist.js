const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true
  },
  
  // Additional metadata
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  
  // Notification preferences
  notifications: {
    priceChange: {
      type: Boolean,
      default: true
    },
    statusChange: {
      type: Boolean,
      default: true
    },
    similarCars: {
      type: Boolean,
      default: false
    }
  },
  
  // Price tracking
  priceWhenAdded: {
    type: Number,
    required: true
  },
  maxPrice: {
    type: Number // User's maximum willing price
  },
  
  // Activity tracking
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one wishlist entry per user-car combination
wishlistSchema.index({ user: 1, car: 1 }, { unique: true });
wishlistSchema.index({ user: 1, createdAt: -1 });
wishlistSchema.index({ car: 1 });

// Virtual for price change
wishlistSchema.virtual('priceChange').get(function() {
  if (this.populated('car') && this.car.price) {
    return this.car.price - this.priceWhenAdded;
  }
  return 0;
});

// Virtual for price change percentage
wishlistSchema.virtual('priceChangePercent').get(function() {
  if (this.populated('car') && this.car.price && this.priceWhenAdded > 0) {
    return ((this.car.price - this.priceWhenAdded) / this.priceWhenAdded) * 100;
  }
  return 0;
});

// Static methods
wishlistSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId })
    .populate({
      path: 'car',
      populate: {
        path: 'seller',
        select: 'name email'
      }
    })
    .sort({ createdAt: -1 });
};

wishlistSchema.statics.addToWishlist = async function(userId, carId, currentPrice, notes = '') {
  try {
    const wishlistItem = new this({
      user: userId,
      car: carId,
      priceWhenAdded: currentPrice,
      notes: notes
    });
    
    return await wishlistItem.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Car is already in your wishlist');
    }
    throw error;
  }
};

wishlistSchema.statics.removeFromWishlist = function(userId, carId) {
  return this.findOneAndDelete({ user: userId, car: carId });
};

wishlistSchema.statics.isInWishlist = async function(userId, carId) {
  const item = await this.findOne({ user: userId, car: carId });
  return !!item;
};

// Instance methods
wishlistSchema.methods.updateViewCount = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save();
};

module.exports = mongoose.model("Wishlist", wishlistSchema);
