const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
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
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);