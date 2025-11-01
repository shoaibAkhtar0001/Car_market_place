const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Category hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
  },
  
  // Display properties
  icon: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true,
    default: "#3B82F6"
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // SEO
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  
  // Statistics
  carCount: {
    type: Number,
    default: 0
  },
  
  // Display order
  sortOrder: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static methods
categorySchema.statics.findActiveCategories = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ sortOrder: 1, name: 1 });
};

module.exports = mongoose.model("Category", categorySchema);
