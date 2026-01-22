const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/error-handler');
const sessionController = require('./controllers/session-controller');
const dbConfig = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - More permissive for development
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit preflight handler
app.options('*', cors());

app.use(express.json());

// Routes
app.post('/api/sessions', sessionController.createSession);
app.get('/api/sessions', sessionController.getAllSessions);
app.get('/api/sessions/:sessionId', sessionController.getSessionById);
app.post('/api/sessions/:sessionId/emotions', sessionController.saveEmotionData);
app.delete('/api/sessions/:sessionId', sessionController.deleteSession);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Error handling
app.use(errorHandler);

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();