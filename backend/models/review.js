const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  // Review type and target
  reviewType: {
    type: String,
    enum: ["Car", "Seller", "Buyer"],
    required: true
  },
  
  // Reviewer information
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Target of the review
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car"
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Related transaction (if applicable)
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Detailed ratings (for car reviews)
  detailedRatings: {
    condition: {
      type: Number,
      min: 1,
      max: 5
    },
    performance: {
      type: Number,
      min: 1,
      max: 5
    },
    fuelEfficiency: {
      type: Number,
      min: 1,
      max: 5
    },
    comfort: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // User experience ratings (for user reviews)
  userRatings: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    responsiveness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Review metadata
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Flagged"],
    default: "Pending"
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  moderatedAt: {
    type: Date
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  
  // Engagement
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Responses
  sellerResponse: {
    content: {
      type: String,
      trim: true,
      maxlength: 500
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Media attachments
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true
    }
  }],
  
  // Flags and reports
  flags: [{
    reason: {
      type: String,
      enum: ["Inappropriate", "Spam", "Fake", "Offensive", "Other"],
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ car: 1, status: 1 });
reviewSchema.index({ reviewedUser: 1, status: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ reviewType: 1, status: 1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ 
  reviewer: 1, 
  car: 1, 
  reviewedUser: 1, 
  transaction: 1 
}, { 
  unique: true, 
  sparse: true 
});

// Virtual for helpful ratio
reviewSchema.virtual('helpfulRatio').get(function() {
  const total = this.helpfulVotes + this.unhelpfulVotes;
  return total > 0 ? (this.helpfulVotes / total) * 100 : 0;
});

// Virtual for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  if (!this.detailedRatings) return this.rating;
  
  const ratings = Object.values(this.detailedRatings).filter(r => r != null);
  if (ratings.length === 0) return this.rating;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Static methods
reviewSchema.statics.findByTarget = function(targetType, targetId, options = {}) {
  const query = { status: 'Approved' };
  
  if (targetType === 'car') {
    query.car = targetId;
    query.reviewType = 'Car';
  } else if (targetType === 'user') {
    query.reviewedUser = targetId;
    query.reviewType = { $in: ['Seller', 'Buyer'] };
  }
  
  return this.find(query)
    .populate('reviewer', 'name')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

reviewSchema.statics.getAverageRating = async function(targetType, targetId) {
  const query = { status: 'Approved' };
  
  if (targetType === 'car') {
    query.car = targetId;
    query.reviewType = 'Car';
  } else if (targetType === 'user') {
    query.reviewedUser = targetId;
    query.reviewType = { $in: ['Seller', 'Buyer'] };
  }
  
  const result = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0, ratingDistribution: [] };
  }
  
  const data = result[0];
  
  // Calculate rating distribution
  const distribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: data.ratingDistribution.filter(r => r === rating).length
  }));
  
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    distribution
  };
};

reviewSchema.statics.canUserReview = async function(userId, targetType, targetId, transactionId = null) {
  const query = {
    reviewer: userId,
    reviewType: targetType === 'car' ? 'Car' : (targetType === 'seller' ? 'Seller' : 'Buyer')
  };
  
  if (targetType === 'car') {
    query.car = targetId;
  } else {
    query.reviewedUser = targetId;
  }
  
  if (transactionId) {
    query.transaction = transactionId;
  }
  
  const existingReview = await this.findOne(query);
  return !existingReview;
};

// Instance methods
reviewSchema.methods.markHelpful = function(isHelpful = true) {
  if (isHelpful) {
    this.helpfulVotes += 1;
  } else {
    this.unhelpfulVotes += 1;
  }
  return this.save();
};

reviewSchema.methods.addFlag = function(reason, reportedBy, description = '') {
  this.flags.push({
    reason,
    reportedBy,
    description,
    reportedAt: new Date()
  });
  
  // Auto-flag if too many reports
  if (this.flags.length >= 3) {
    this.status = 'Flagged';
  }
  
  return this.save();
};

module.exports = mongoose.model("Review", reviewSchema);
