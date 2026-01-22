const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/error-handler');
const sessionController = require('./controllers/session-controller');
const dbConfig = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.post('/api/sessions', sessionController.createSession);
app.post('/api/sessions/:sessionId/emotions', sessionController.saveEmotionData);

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