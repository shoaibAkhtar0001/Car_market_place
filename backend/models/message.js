const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  // Conversation participants - can be ObjectId or String for local users
  sender: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Related car (if applicable) - can be ObjectId or String for local cars
  car: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Related transaction (if applicable)
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Message type
  messageType: {
    type: String,
    enum: ["Text", "Image", "Document", "System", "Offer", "Counter-Offer"],
    default: "Text"
  },
  
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ["Image", "Document", "Video"],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number // in bytes
    },
    mimeType: {
      type: String
    }
  }],
  
  // Offer details (for offer messages)
  offer: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: "USD"
    },
    validUntil: {
      type: Date
    },
    terms: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Expired", "Withdrawn"],
      default: "Pending"
    }
  },
  
  // Message status
  status: {
    type: String,
    enum: ["Sent", "Delivered", "Read", "Failed"],
    default: "Sent"
  },
  
  // Read status
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Delivery tracking
  deliveredAt: {
    type: Date
  },
  
  // Thread/Conversation ID
  conversationId: {
    type: String,
    required: true
  },
  
  // Message priority
  priority: {
    type: String,
    enum: ["Low", "Normal", "High", "Urgent"],
    default: "Normal"
  },
  
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ["Approved", "Rejected", "Flagged"],
    default: "Approved"
  },
  
  // Flags and reports
  flags: [{
    reason: {
      type: String,
      enum: ["Spam", "Inappropriate", "Scam", "Harassment", "Other"],
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
    }
  }],
  
  // Reply to another message
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  
  // Message reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Auto-generated messages
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  
  // Message scheduling
  scheduledFor: {
    type: Date
  },
  
  // Encryption (for future use)
  isEncrypted: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ car: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function() {
  return [this.sender, this.recipient];
});

// Virtual for unread status
messageSchema.virtual('isUnread').get(function() {
  return this.status !== 'Read';
});

// Pre-save middleware to generate conversation ID
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    // Create consistent conversation ID regardless of sender/recipient order
    const participants = [this.sender.toString(), this.recipient.toString()].sort();
    this.conversationId = participants.join('-');
    
    // Add car ID if present for car-specific conversations
    if (this.car) {
      this.conversationId += `-${this.car.toString()}`;
    }
  }
  next();
});

// Static methods
messageSchema.statics.getConversation = function(conversationId, options = {}) {
  return this.find({ conversationId })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('car', 'title make model year price')
    .sort({ createdAt: options.sortOrder || 1 })
    .limit(options.limit || 100);
};

messageSchema.statics.getUserConversations = async function(userId, options = {}) {
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: mongoose.Types.ObjectId(userId) }, { recipient: mongoose.Types.ObjectId(userId) }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$sender', mongoose.Types.ObjectId(userId)] },
                  { $ne: ['$status', 'Read'] }
                ]
              },
              1,
              0
            ]
          }
        },
        messageCount: { $sum: 1 }
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    },
    {
      $limit: options.limit || 20
    }
  ]);
  
  // Populate the last message details
  await this.populate(conversations, {
    path: 'lastMessage.sender lastMessage.recipient lastMessage.car',
    select: 'name email title make model year price'
  });
  
  return conversations;
};

messageSchema.statics.markAsRead = function(conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      recipient: userId,
      status: { $ne: 'Read' }
    },
    {
      $set: { status: 'Read' },
      $push: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    }
  );
};

messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: { $ne: 'Read' }
  });
};

messageSchema.statics.createSystemMessage = function(conversationId, content, car = null) {
  return this.create({
    sender: null, // System message
    recipient: null,
    conversationId,
    content,
    car,
    messageType: 'System',
    isSystemMessage: true,
    status: 'Delivered'
  });
};

// Instance methods
messageSchema.methods.markAsRead = function(userId) {
  if (this.recipient.toString() === userId.toString() && this.status !== 'Read') {
    this.status = 'Read';
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model("Message", messageSchema);
