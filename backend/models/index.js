// Export all models for easy importing
const User = require('./user');
const Car = require('./car');
const Category = require('./category');
const Transaction = require('./transaction');
const Wishlist = require('./wishlist');
const Review = require('./review');
const Message = require('./message');

module.exports = {
  User,
  Car,
  Category,
  Transaction,
  Wishlist,
  Review,
  Message
};
