const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sentiweb';

const dbConfig = {
  url: MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true
  }
};

module.exports = dbConfig;