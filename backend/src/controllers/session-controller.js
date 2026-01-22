const EmotionService = require('../services/emotion-service');

class SessionController {
  async createSession(req, res) {
    try {
      const { userId } = req.body;
      const session = await EmotionService.createSession(userId);
      console.log('Session created:', session._id);
      res.status(201).json(session);
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async saveEmotionData(req, res) {
    try {
      const { sessionId } = req.params;
      const { emotionData } = req.body;
      
      console.log('Saving emotion for session:', sessionId, 'Data:', emotionData);
      
      if (!sessionId || !emotionData) {
        return res.status(400).json({ error: 'Missing sessionId or emotionData' });
      }
      
      const updatedSession = await EmotionService.saveEmotionData(sessionId, emotionData);
      console.log('Emotion saved successfully');
      res.json(updatedSession);
    } catch (error) {
      console.error('Save emotion error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllSessions(req, res) {
    try {
      const sessions = await EmotionService.getAllSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getSessionById(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }
      
      const session = await EmotionService.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SessionController();
