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
}

module.exports = new SessionController();