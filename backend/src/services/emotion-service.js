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
      if (!sessionId) {
        throw new Error('sessionId is required');
      }
      
      if (!emotionData) {
        throw new Error('emotionData is required');
      }

      const result = await Session.findByIdAndUpdate(
        sessionId,
        { $push: { emotions: emotionData } },
        { new: true, runValidators: false }
      );
      
      if (!result) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      return result;
    } catch (error) {
      console.error('Emotion service error:', error);
      throw new Error(`Failed to save emotion data: ${error.message}`);
    }
  }
}

module.exports = new EmotionService();