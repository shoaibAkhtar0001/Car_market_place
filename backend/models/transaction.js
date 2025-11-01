const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // Transaction ID
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Parties involved
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: true
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "USD",
    uppercase: true
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ["Cash", "Bank Transfer", "Check", "Financing", "Credit Card", "Other"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded", "Cancelled"],
    default: "Pending"
  },
  paymentReference: {
    type: String,
    trim: true
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ["Initiated", "In Progress", "Completed", "Cancelled", "Disputed"],
    default: "Initiated"
  },
  
  // Important Dates
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Documentation
  documents: [{
    type: {
      type: String,
      enum: ["Contract", "Receipt", "Title Transfer", "Insurance", "Inspection Report", "Other"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  
  // Communication & Notes
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery/Pickup Information
  delivery: {
    method: {
      type: String,
      enum: ["Pickup", "Delivery", "Shipping", "Other"],
      default: "Pickup"
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "USA" }
    },
    scheduledDate: Date,
    completedDate: Date,
    trackingNumber: String
  },
  
  // Fees & Commissions
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Dispute Information
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    initiatedAt: Date,
    resolvedAt: Date,
    resolution: String
  },
  
  // Review & Rating
  buyerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  sellerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ buyer: 1 });
transactionSchema.index({ seller: 1 });
transactionSchema.index({ car: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ paymentStatus: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for total fees
transactionSchema.virtual('totalFees').get(function() {
  return this.platformFee + this.processingFee;
});

// Virtual for net amount to seller
transactionSchema.virtual('netAmount').get(function() {
  return this.amount - this.totalFees;
});

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

// Static methods
transactionSchema.statics.findByUser = function(userId, role = 'both') {
  const query = {};
  if (role === 'buyer') {
    query.buyer = userId;
  } else if (role === 'seller') {
    query.seller = userId;
  } else {
    query.$or = [{ buyer: userId }, { seller: userId }];
  }
  
  return this.find(query)
    .populate('buyer', 'name email')
    .populate('seller', 'name email')
    .populate('car', 'title make model year price')
    .sort({ createdAt: -1 });
};

transactionSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'Completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalFees: { $sum: { $add: ['$platformFee', '$processingFee'] } },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model("Transaction", transactionSchema);
