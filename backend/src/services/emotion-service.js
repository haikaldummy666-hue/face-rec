const Session = require('../models/Session');

class EmotionService {
  async createSession(userId) {
    try {
      return await Session.create({ userId });
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async saveEmotionData(sessionId, emotionData) {
    try {
      return await Session.findByIdAndUpdate(
        sessionId,
        { $push: { emotions: emotionData } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to save emotion data: ${error.message}`);
    }
  }
}

module.exports = new EmotionService();