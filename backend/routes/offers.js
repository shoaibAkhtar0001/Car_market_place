const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Message = require('../models/message')
const Car = require('../models/car')

// Create a new offer or counter-offer
// POST /api/offers
router.post('/', auth, async (req, res) => {
  try {
    const { carId, recipientId, amount, currency = 'USD', terms, validUntil, replyToOfferId } = req.body
    if (!carId || !recipientId || typeof amount !== 'number') {
      return res.status(400).json({ message: 'carId, recipientId and numeric amount are required' })
    }

    // Check if carId is a valid MongoDB ObjectId (24 hex chars)
    const isValidObjectId = /^[a-f\d]{24}$/i.test(carId)
    
    // Only lookup car if it's a valid ObjectId; otherwise allow local car IDs
    if (isValidObjectId) {
      const car = await Car.findById(carId)
      if (!car) return res.status(404).json({ message: 'Car not found' })
    }

    const senderId = req.user.id || req.user._id?.toString()

    // Generate conversationId (consistent with backend logic: sorted participants + carId)
    const participants = [String(senderId), String(recipientId)].sort()
    const conversationId = `${participants.join('-')}-${carId}`

    // Determine message type
    const messageType = replyToOfferId ? 'Counter-Offer' : 'Offer'

    const content = messageType === 'Offer'
      ? `Offer submitted: ${currency} ${amount}`
      : `Counter-offer: ${currency} ${amount}`

    const msg = await Message.create({
      sender: senderId,
      recipient: recipientId,
      car: carId,
      conversationId,
      content,
      messageType,
      offer: {
        amount,
        currency,
        terms,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: 'Pending',
      },
    })

    const io = req.app.locals.io
    if (io) {
      // notify relevant rooms
      io.to(`car:${carId}`).emit('offer:created', msg)
      io.to(`user:${senderId}`).emit('offer:created', msg)
      io.to(`user:${recipientId}`).emit('offer:created', msg)
      io.to(`conversation:${msg.conversationId}`).emit('offer:created', msg)
    }

    return res.status(201).json(msg)
  } catch (err) {
    console.error('Create offer error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get all offers received by current user (seller view)
// GET /api/offers/received
router.get('/received', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id?.toString()
    const messages = await Message.find({
      recipient: userId,
      messageType: { $in: ['Offer', 'Counter-Offer'] },
    }).sort({ createdAt: -1 })

    return res.json(messages)
  } catch (err) {
    console.error('Get received offers error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Get offers thread for a conversation (buyer-seller-car)
// GET /api/offers/thread/:conversationId
router.get('/thread/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params
    const messages = await Message.find({
      conversationId,
      messageType: { $in: ['Offer', 'Counter-Offer'] },
    }).sort({ createdAt: 1 })

    return res.json(messages)
  } catch (err) {
    console.error('Get offer thread error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Update offer status (accept/reject/withdraw)
// PATCH /api/offers/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    const allowed = ['Accepted', 'Rejected', 'Withdrawn']
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' })

    const msg = await Message.findById(req.params.id)
    if (!msg || !['Offer', 'Counter-Offer'].includes(msg.messageType)) {
      return res.status(404).json({ message: 'Offer not found' })
    }

    const userId = req.user.id || req.user._id?.toString()

    // Permission checks
    if (status === 'Withdrawn') {
      if (msg.sender.toString() !== userId) return res.status(403).json({ message: 'Only sender can withdraw' })
    } else {
      if (msg.recipient.toString() !== userId) return res.status(403).json({ message: 'Only recipient can accept/reject' })
    }

    // Do not update if already terminal
    if (['Accepted', 'Rejected', 'Withdrawn', 'Expired'].includes(msg.offer?.status)) {
      return res.status(409).json({ message: 'Offer already finalized' })
    }

    msg.offer.status = status
    await msg.save()

    const io = req.app.locals.io
    if (io) {
      io.to(`car:${msg.car?.toString()}`).emit('offer:updated', msg)
      io.to(`user:${msg.sender?.toString()}`).emit('offer:updated', msg)
      io.to(`user:${msg.recipient?.toString()}`).emit('offer:updated', msg)
      io.to(`conversation:${msg.conversationId}`).emit('offer:updated', msg)
    }

    return res.json(msg)
  } catch (err) {
    console.error('Update offer status error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
