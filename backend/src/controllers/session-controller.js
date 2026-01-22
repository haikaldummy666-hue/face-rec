const EmotionService = require('../services/emotion-service');

class SessionController {
  async createSession(req, res) {
    try {
      const { userId } = req.body;
      const session = await EmotionService.createSession(userId);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveEmotionData(req, res) {
    try {
      const { sessionId } = req.params;
      const { emotionData } = req.body;
      const updatedSession = await EmotionService.saveEmotionData(sessionId, emotionData);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new SessionController();