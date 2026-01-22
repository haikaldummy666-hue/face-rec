const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    index: true  // Index for faster queries
  },
  emotions: [{
    emotion: String,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true  // Index for faster date queries
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);