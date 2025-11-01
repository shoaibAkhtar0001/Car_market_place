const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Car Details
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  
  // Technical Specifications
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"],
    required: true
  },
  transmission: {
    type: String,
    enum: ["Manual", "Automatic", "CVT", "Semi-Automatic"],
    required: true
  },
  engineSize: {
    type: String, // e.g., "2.0L", "1500cc"
    trim: true
  },
  bodyType: {
    type: String,
    enum: ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Wagon", "Pickup", "Van", "Truck"],
    required: true
  },
  
  // Condition & Features
  condition: {
    type: String,
    enum: ["New", "Like New", "Excellent", "Good", "Fair", "Poor"],
    required: true
  },
  features: [{
    type: String,
    trim: true
  }],
  
  // Location
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ""
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Ownership & Documentation
  ownershipHistory: {
    type: Number,
    min: 1,
    default: 1
  },
  registrationNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  insuranceStatus: {
    type: String,
    enum: ["Valid", "Expired", "Not Available"],
    default: "Not Available"
  },
  
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: ["Draft", "Active", "Sold", "Inactive", "Under Review"],
    default: "Draft"
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  approvedAt: {
    type: Date
  },
  
  // Engagement Metrics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  listedAt: {
    type: Date,
    default: Date.now
  },
  soldAt: {
    type: Date
  },
  
  // Additional Information
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Contact Preferences
  contactPreferences: {
    allowCalls: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    allowEmails: {
      type: Boolean,
      default: true
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
carSchema.index({ make: 1, model: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: 1 });
carSchema.index({ "location.city": 1, "location.state": 1 });
carSchema.index({ status: 1, isApproved: 1 });
carSchema.index({ seller: 1 });
carSchema.index({ createdAt: -1 });

// Virtual for car age
carSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for primary image
carSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Pre-save middleware
carSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let hasPrimary = false;
    this.images.forEach((img, index) => {
      if (img.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else if (img.isPrimary && hasPrimary) {
        img.isPrimary = false;
      }
    });
    
    // If no primary image set, make first one primary
    if (!hasPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Static methods
carSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    status: 'Active',
    isApproved: true
  });
};

carSchema.statics.findByLocation = function(city, state) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    status: 'Active',
    isApproved: true
  });
};

module.exports = mongoose.model("Car", carSchema);
