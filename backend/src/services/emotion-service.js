const Session = require('../models/Session');

class EmotionService {
  async getNextUserId() {
    try {
      // Get the highest user_id from database and increment
      const lastSession = await Session.findOne()
        .sort({ user_id: -1 })
        .select('user_id');
      
      return lastSession ? lastSession.user_id + 1 : 1;
    } catch (error) {
      console.error('Error getting next userId:', error);
      return 1;  // Fallback to 1
    }
  }

  async createSession(userId) {
    try {
      // If userId not provided, auto-generate next one
      const finalUserId = userId || (await this.getNextUserId());
      
      return await Session.create({ 
        user_id: finalUserId,
        emotions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
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

  async getAllSessions() {
    try {
      const sessions = await Session.find()
        .select('_id user_id createdAt emotions')
        .sort({ createdAt: -1 });
      
      return sessions;
    } catch (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }
  }

  async getSessionById(sessionId) {
    try {
      const session = await Session.findById(sessionId);
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      return session;
    } catch (error) {
      throw new Error(`Failed to fetch session: ${error.message}`);
    }
  }
}

module.exports = new EmotionService();