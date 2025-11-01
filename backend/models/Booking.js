const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
  carId: { type: String, required: true },
  sellerId: { type: String, required: true },
  buyerId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'declined', 'completed'], default: 'pending' },
  // Optional buyer contact details for seller visibility
  buyerName: { type: String },
  buyerEmail: { type: String },
  buyerPhone: { type: String },
  notes: { type: String },
}, { timestamps: true })

// Helper static to check overlap
BookingSchema.statics.hasOverlap = async function (carId, startDate, endDate) {
  return await this.exists({
    carId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
    ],
  })
}

module.exports = mongoose.model('Booking', BookingSchema)
