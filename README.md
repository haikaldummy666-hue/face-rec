# Emotion Detection System - Real-time Face Expression Analysis

A modern web application that uses computer vision and machine learning to detect and analyze facial emotions in real-time. Built with Next.js, Node.js, and TensorFlow.js, deployed on Vercel and Railway.

## 🎯 Features

### Core Functionality
- **Real-time Emotion Detection**: Captures face expressions using webcam and identifies emotions (happy, sad, angry, surprised, neutral, fearful, disgusted)
- **Session Management**: Create and manage multiple emotion detection sessions
- **Data Persistence**: Store all emotion detection data in MongoDB Atlas
- **Multi-Session Analysis**: Compare emotions across multiple sessions with visual analytics
- **Export Functionality**: Export session data as PDF reports or CSV files

### Dashboard & Analytics
- **Session Dashboard**: View all sessions with emotion counts and distribution
- **Session Details**: Detailed view of individual sessions with timeline and charts
- **Multi-Session Comparison**: Compare emotion patterns across multiple sessions
- **Analytics Page**: Comprehensive analytics with trends, distributions, and statistics
- **Modern UI**: Built with Tailwind CSS for a professional, responsive design

### Advanced Features
- **Real-time Visualization**: See emotions as they're being detected
- **Performance Optimized**: Throttled emotion detection (1 per 2 seconds) to prevent server overload
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error handling and user feedback

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14.0.3 with React 18.2.0
- **AI Models**: face-api.js 0.22.2 (TinyFaceDetector + FaceExpressionNet)
- **Styling**: Tailwind CSS 3.3.0
- **Charts**: Chart.js 4.4.0 + react-chartjs-2 5.2.0
- **Export**: jspdf 2.5.1 for PDF generation
- **Deployment**: Vercel (auto-deploy from GitHub)

### Backend
- **Runtime**: Node.js 18.20.5
- **Framework**: Express 4.18.2
- **Database ODM**: Mongoose 8.0.1
- **Validation**: express-validator 7.0.1
- **CORS**: Configured for cross-origin requests
- **Deployment**: Railway (auto-deploy from GitHub)

### Database
- **Platform**: MongoDB Atlas (Cloud)
- **Database**: `sentiweb`
- **Collections**: `sessions` (stores user sessions and emotion arrays)

## 📁 Project Structure

```
project/
├── frontend/                          # Next.js frontend application
│   ├── pages/
│   │   ├── index.js                  # Main emotion detection page
│   │   ├── dashboard.js              # Session management dashboard
│   │   ├── analytics.js              # Analytics and insights
│   │   ├── compare.js                # Multi-session comparison
│   │   └── session/[id].js           # Individual session details
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── VideoFeed/           # Real-time video feed component
│   │   │   ├── EmotionDisplay/      # Emotion display component
│   │   │   ├── AnalyticsReport/     # Analytics report component
│   │   │   ├── EmotionChart/        # Emotion chart component
│   │   │   └── ...
│   │   ├── lib/                      # Utility functions
│   │   │   ├── api.js               # Fetch wrapper
│   │   │   ├── emotion-detection.js # TensorFlow.js wrapper
│   │   │   ├── session-manager.js   # Session API management
│   │   │   ├── pdf.js               # PDF export utility
│   │   │   └── modelLoader.js       # Model loading utility
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── styles/                  # Global styles
│   │   └── utils/                   # Utility functions
│   ├── public/models/               # Pre-trained ML models
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                          # Node.js backend application
│   ├── src/
│   │   ├── server.js                # Express server setup
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── models/
│   │   │   └── Session.js           # Mongoose Session model
│   │   ├── controllers/
│   │   │   └── session-controller.js # API request handlers
│   │   ├── services/
│   │   │   └── emotion-service.js   # Database operations
│   │   ├── middleware/
│   │   │   └── error-handler.js     # Error handling
│   │   └── ai/                      # AI models (Python)
│   ├── package.json
│   ├── requirements.txt
│   └── Procfile
│
├── package.json                      # Root package config
├── railway.toml                      # Railway deployment config
├── .gitignore
├── README.md
└── ...
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MongoDB Atlas account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/haikaldummy666-hue/face-rec.git
cd face-rec
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Set up environment variables**

Create `.env.local` in `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Create `.env` in `backend/`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sentiweb
PORT=5000
```

4. **Run locally**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🌐 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy automatically on push

**Live**: https://face-rec-zeta.vercel.app

### Backend (Railway)
1. Push to GitHub
2. Connect repository to Railway
3. Set environment variable: `MONGODB_URI`
4. Deploy automatically on push

**Live**: https://web-production-79a49.up.railway.app/api

## 📊 API Endpoints

### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get specific session

### Emotions
- `POST /api/sessions/:id/emotions` - Save emotion data

### Health
- `GET /api/health` - Check backend status

## 🎨 Key Components

### VideoFeed Component
Captures video from webcam and performs real-time emotion detection using face-api.js models. Detection runs at 2-second intervals to optimize performance.

### Session Manager
Handles session creation and management through REST API calls. Each session stores user ID, creation timestamp, and emotion arrays.

### Analytics
Displays emotion statistics with multiple visualization types:
- Pie charts for overall distribution
- Line charts for trends over time
- Bar charts for session comparison
- Tables for detailed statistics

### Export System
Generates PDF reports and CSV exports with:
- Session metadata
- Emotion timeline
- Distribution statistics
- Charts and visualizations

## 📈 Performance Optimizations

1. **Detection Throttling**: Limited emotion detection to 2000ms intervals (from 16ms) to prevent server overload
2. **Dynamic Imports**: Client-side only components use dynamic imports to reduce bundle size
3. **Database Indexing**: Optimized MongoDB queries with proper indexing
4. **CDN Delivery**: Static assets served through Vercel/Railway CDNs
5. **Image Optimization**: Compressed ML models and assets

## 🔒 Security

- **CORS Configuration**: Restricted to frontend domain in production
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: All user inputs validated on backend
- **Error Handling**: No sensitive information exposed in errors

## 📝 Usage Guide

### Creating a Session
1. Go to the homepage (http://localhost:3000)
2. Allow camera access when prompted
3. Click "New Session" - a session is automatically created
4. Faces will be detected and emotions recorded in real-time

### Viewing Dashboard
1. Click "📊 View Dashboard" button on home page
2. See all your sessions in a table
3. Click "View Details" on any session to see detailed analysis

### Comparing Sessions
1. Go to Dashboard
2. Select at least 2 sessions with checkboxes
3. Click "Compare Sessions" button
4. View side-by-side comparison of emotion patterns

### Analytics
1. Click "Analytics & Insights" link
2. View comprehensive statistics:
   - Overall emotion distribution
   - Trends over time
   - Session activity
   - Detailed statistics table

### Exporting Data
1. Visit a session detail page
2. Click "📄 PDF Export" or "📊 CSV Export"
3. File downloads to your computer

## 🛠️ Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: Add new feature"`
4. Push and create pull request

### Testing
```bash
# Frontend
cd frontend
npm run test

# Backend
cd backend
npm run test
```

### Code Style
- Frontend: ESLint configured for React/Next.js
- Backend: Standard Node.js style guide

## 📚 Technologies Used

### Frontend
- React 18.2.0
- Next.js 14.0.3
- Tailwind CSS 3.3.0
- Chart.js 4.4.0
- TensorFlow.js 4.10.0
- jsPDF 2.5.1

### Backend
- Node.js 18.20.5
- Express 4.18.2
- Mongoose 8.0.1
- MongoDB Atlas

### DevOps
- GitHub (Version Control)
- Vercel (Frontend Deployment)
- Railway (Backend Deployment)

## 🐛 Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS on production
- Try different browser

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check backend CORS configuration
- Ensure frontend and backend URLs are correct

### MongoDB Connection Issues
- Verify `MONGODB_URI` environment variable
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Slow Emotion Detection
- Emotion detection is throttled to 2000ms intervals by design
- This prevents server overload
- Adjust in `frontend/src/components/VideoFeed/VideoFeed.jsx` if needed

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Haikal Dummy** - [@haikaldummy666-hue](https://github.com/haikaldummy666-hue)

## 📧 Support

For issues, questions, or suggestions:
1. Open an issue on GitHub
2. Check existing issues for solutions
3. Include detailed error messages and steps to reproduce

## 🙏 Acknowledgments

- Face Detection: [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- Emotion Detection: TensorFlow.js
- Frontend: Next.js and React communities
- Deployment: Vercel and Railway teams

---

**Live Demo**: https://face-rec-zeta.vercel.app

**Repository**: https://github.com/haikaldummy666-hue/face-rec
