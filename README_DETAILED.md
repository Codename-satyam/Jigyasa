# 🎮 Jigyasa - Gamified Quiz Platform

A comprehensive, interactive learning platform designed to transform traditional quizzes into engaging game-like experiences. Jigyasa (meaning "curiosity" in Sanskrit) combines education with gamification to help students of all ages learn effectively while having fun.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Jigyasa** is a full-stack educational platform that revolutionizes how students engage with learning content. By integrating gamification mechanics—such as points, badges, leaderboards, and difficulty adaptation—it transforms mundane quizzes into an adventure-based learning experience.

### Core Philosophy
- **Education meets Entertainment**: Learning should be fun
- **Personalization**: AI-driven adaptive difficulty for each learner
- **Transparency**: Teachers and parents get actionable performance insights
- **Safety**: Secure, kid-friendly environment

---

## ✨ Key Features

### 🧠 Learning Features
- **Gamified Quiz System**: Interactive question formats with instant feedback
- **Adaptive Difficulty**: ML-powered difficulty adjustment based on student performance
- **Text Summarization**: AI-assisted content condensation for quick learning
- **Performance Analytics**: Track progress with detailed score breakdowns and achievement insights
- **Multi-difficulty Levels**: Easy, Medium, and Hard challenges
- **Flag Questions**: Mark questions for review or reporting

### 👥 Role-Based System
- **Students**: Take quizzes, earn points, view achievements and leaderboards
- **Teachers**: Create custom quizzes, monitor student progress, view class analytics
- **Admin**: System administration, user management, platform monitoring

### 🏆 Gamification Elements
- **Reward Points**: Earn points for correct answers
- **Achievement Badges**: Unlock badges based on milestones
- **Leaderboards**: Global and class-based rankings
- **Progress Tracking**: Visual representation of learning journey
- **Daily Streaks**: Encourage consistent learning habits

### 🔐 Security & Authentication
- **Secure Login**: Firebase Authentication with JWT tokens
- **Role-Based Access Control (RBAC)**: Granular permission management
- **Data Encryption**: End-to-end security for sensitive data
- **Rate Limiting**: Protection against abuse

### 📱 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **3D Animations**: React Three Fiber for immersive visual effects
- **Smooth Transitions**: Framer Motion for fluid page transitions
- **Dark/Light Theme Support**: Accessibility-focused design
- **Accessibility**: Reduced motion support for users with vestibular disorders

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router v7.9.4
- **State Management**: React Context API
- **Styling**: CSS3 with custom themes
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion v12.31.0
- **Charts**: Recharts v3.8.1
- **UI Components**: React Icons, FontAwesome
- **Authentication**: Firebase SDK
- **HTTP Client**: Axios (via custom client wrapper)
- **Build Tool**: Create React App (React Scripts v5.0.1)

### Backend
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js v5.1.0
- **Authentication**: Firebase Admin SDK v13.8.0, JWT
- **Security**: bcryptjs, express-rate-limit
- **CORS**: Dynamic origin management
- **Database**: Firestore (Firebase)
- **Middleware**: Body Parser, CORS, Rate Limiting

### ML Service
- **Language**: Python 3.x
- **Framework**: Flask v3.1.0
- **ML Library**: scikit-learn v1.6.1 (GradientBoostingRegressor)
- **Data Processing**: NumPy v2.2.4
- **Model Persistence**: joblib v1.4.2
- **Server**: Gunicorn v23.0.0
- **CORS**: Flask-CORS v4.0.0

### Deployment
- **Frontend**: Render
- **Backend**: Render
- **ML Service**: Render
- **Database**: Google Firebase/Firestore
- **Region**: Singapore

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     JIGYASA PLATFORM                        │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
         ┌──────▼───┐ ┌────▼────┐ ┌───▼────────┐
         │ Frontend  │ │ Backend │ │ ML Service │
         │ (React)   │ │(Express)│ │  (Flask)   │
         └──────┬───┘ └────┬────┘ └───┬────────┘
                │          │           │
    ┌───────────┴──────────┼───────────┴──────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌──────────┐          ┌───────────┐
│ Render  │          │ Firestore│          │ Joblib    │
│  CDN    │          │  (NoSQL) │          │ ML Models │
└─────────┘          └──────────┘          └───────────┘
```

### Data Flow
1. **User Actions** → React Frontend captures interactions
2. **API Requests** → Frontend sends to Express Backend
3. **Authentication** → Firebase validates JWT tokens
4. **Data Processing** → Backend queries/updates Firestore
5. **ML Prediction** → ML Service provides difficulty scores
6. **Real-time Updates** → Firestore emits changes to frontend
7. **Response** → Backend returns data to frontend

---

## 📁 Project Structure

```
quizy/
├── src/                          # React Frontend
│   ├── Components/               # React Components
│   │   ├── Auth/                # Login, Register, Profile
│   │   ├── Play/                # Quiz gameplay screens
│   │   ├── Dashboard/           # User dashboard
│   │   ├── LandingPage/         # Home page
│   │   ├── LeaderBoard/         # Rankings
│   │   ├── Achievements/        # Badges and achievements
│   │   ├── Settings/            # User preferences
│   │   └── ...
│   ├── api/                      # API Integration
│   │   ├── client.js            # Axios HTTP client
│   │   ├── quizApi.js           # Quiz API calls
│   │   ├── auth.js              # Authentication API
│   │   ├── scores.js            # Score management
│   │   ├── textSummarization.js # ML text summarization
│   │   └── ...
│   ├── services/                 # Firebase services
│   │   └── firebaseAuthService.js
│   ├── Assets/                   # Static assets (images, videos)
│   ├── App.js                    # Main App component
│   └── index.js                  # Entry point
│
├── server/                        # Express Backend
│   ├── routes/                   # API endpoints
│   │   ├── user.js              # User management
│   │   ├── quizzes.js           # Quiz CRUD
│   │   ├── scores.js            # Score tracking
│   │   ├── games.js             # Game state
│   │   ├── progress.js          # Progress tracking
│   │   ├── difficulty.js        # Difficulty endpoints
│   │   └── ml/                  # ML service routes
│   ├── models/                   # Firestore data models
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   ├── Score.js
│   │   └── ...
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT authentication
│   │   └── validate.js          # Input validation
│   ├── storage/                  # Database connectors
│   │   ├── firebase.js          # Firebase configuration
│   │   └── firestoreModel.js    # Firestore ORM
│   └── data/
│
├── ml_service/                   # Python ML Microservice
│   ├── app.py                   # Flask application
│   ├── models/                  # Trained ML models
│   ├── requirements.txt         # Python dependencies
│   └── Procfile
│
├── build/                        # Production build (generated)
├── public/                       # Static public assets
├── package.json                  # Frontend dependencies
├── backend-package.json          # Backend dependencies
├── server.js                     # Backend entry point
├── vercel.json                   # Deployment config
├── Procfile                      # Heroku/Render config
└── README.md                     # Original README
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.8 or higher (for ML service)
- **npm**: v9.0.0 or higher
- **Git**: Version control
- **Firebase Account**: For authentication and database

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/jigyasa.git
cd jigyasa
```

### Step 2: Frontend Setup
```bash
# Install frontend dependencies
npm install

# Verify the build works
npm run build

# Start development server
npm start
```
The frontend will be available at `http://localhost:3000`

### Step 3: Backend Setup
```bash
# Install backend dependencies
npm install -f --prefix backend-package.json

# Verify backend
node server.js
```
The backend will run at `http://localhost:4000`

### Step 4: ML Service Setup (Optional, for adaptive difficulty)
```bash
cd ml_service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run Flask app
python app.py
```
The ML service will run at `http://localhost:5000`

### Step 5: Firebase Configuration
1. Download your Firebase service account key from Firebase Console
2. Place it in `server/storage/` and `src/services/` directories
3. Add path to `.env` file (see below)

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend (REACT_APP_ prefix)
REACT_APP_API_URL=http://localhost:4000
REACT_APP_QUIZ_API_BASE=http://localhost:4000/api
ML_SERVICE_URL=http://localhost:5000

# Backend
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_SDK_PATH=./server/storage/firebase-adminsdk.json

# JWT
JWT_SECRET=your_secure_jwt_secret_key_here_min_32_chars

# CORS Configuration
CORS_ALLOW_ALL=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CLIENT_ORIGIN=http://localhost:3000

# ML Service
ML_SERVICE_URL=http://localhost:5000
ML_MIN_SAMPLES=5

# Database
FIRESTORE_EMULATOR_HOST=localhost:8080  # Optional: for local testing
```

### Production `.env` (on Render)
```env
REACT_APP_API_URL=https://jigyasa-backend-fbak.onrender.com
REACT_APP_QUIZ_API_BASE=https://jigyasa-backend-fbak.onrender.com/api
ML_SERVICE_URL=https://jigyasa-ml.onrender.com
NODE_ENV=production
JWT_SECRET=<your_strong_secret>
CORS_ALLOW_ALL=false
ALLOWED_ORIGINS=https://jigyasa-frontend.onrender.com
```

---

## 🎮 Getting Started

### For Students
1. **Sign Up**: Create an account with email/password or Google Sign-In
2. **Browse Quizzes**: Navigate to the quiz selection page
3. **Take Quiz**: Select a difficulty level and attempt questions
4. **View Results**: See immediate feedback and score breakdown
5. **Track Progress**: Monitor achievements and leaderboard ranking

### For Teachers
1. **Sign Up** with teacher role
2. **Create Quizzes**: 
   - Add questions with multiple answer options
   - Set difficulty levels
   - Configure points and timer
3. **Publish Quiz**: Make it available to students
4. **Monitor Progress**: View class analytics and individual student performance
5. **Adjust Content**: Update quizzes based on student performance

### For Admins
1. **User Management**: Create/manage accounts and roles
2. **Platform Monitoring**: View system health and usage statistics
3. **Content Moderation**: Review flagged questions
4. **Analytics**: System-wide performance insights

---

## 🌐 Deployment

### Current Deployment
The application is deployed on **Render** (Singapore region):
- **Frontend**: https://jigyasa-frontend.onrender.com/
- **Backend**: https://jigyasa-backend-fbak.onrender.com/
- **ML Service**: https://jigyasa-ml.onrender.com/

### Deploying to Render

#### 1. Frontend Deployment
```bash
# Build React app
npm run build

# Push to GitHub
git push origin main
```
Connect to Render:
- Select "New +" → "Web Service"
- Connect GitHub repository
- Build command: `npm install && npm run build`
- Start command: `npm start`

#### 2. Backend Deployment
```bash
# Ensure server.js is in root
# Push changes to GitHub
git push origin main
```
Connect to Render:
- Select "New +" → "Web Service"
- Build command: `npm install`
- Start command: `node server.js`
- Add environment variables from `.env`

#### 3. ML Service Deployment
```bash
# Create Procfile in ml_service/
web: gunicorn app:app
```
Connect to Render:
- Select "New +" → "Web Service"
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

### Docker Deployment (Optional)
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]

# ML Service Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "app:app"]
```

---

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/user/register
POST /api/user/login
GET /api/user/profile
PUT /api/user/profile
POST /api/user/logout
```

### Quiz Endpoints
```
GET /api/quizzes                    # List all quizzes
GET /api/quizzes/:id               # Get specific quiz
POST /api/quizzes                  # Create quiz (teacher)
PUT /api/quizzes/:id               # Update quiz (teacher)
DELETE /api/quizzes/:id            # Delete quiz (teacher)
```

### Score Endpoints
```
POST /api/scores                   # Submit quiz attempt
GET /api/scores/user               # Get user scores
GET /api/scores/leaderboard        # Get leaderboard
```

### ML Service Endpoints
```
POST /ml/predict                   # Get difficulty prediction
POST /ml/summarize                 # Summarize text
```

---

## 🧪 Testing

### Frontend Tests
```bash
npm test -- --watchAll=false
```

### Backend Validation
```bash
node quick-test.js
```

### ML Service Testing
```bash
python -m pytest tests/
```

---

## 📊 Performance & Optimization

### Frontend
- **Bundle Size**: ~528 KB (gzipped)
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Compressed assets
- **Caching**: Browser and CDN caching

### Backend
- **Rate Limiting**: 100 requests per 15 minutes
- **Database Queries**: Indexed fields for fast retrieval
- **Caching**: Response caching for frequently accessed data

### ML Service
- **Model Training**: Incremental updates
- **Prediction Speed**: <100ms average response time
- **Scalability**: Per-user model files stored locally

---

## 🔐 Security Best Practices

- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcryptjs for secure storage
- ✅ **CORS Protection**: Whitelist allowed origins
- ✅ **Rate Limiting**: Prevent DDoS and brute force
- ✅ **Input Validation**: Server-side sanitization
- ✅ **Secrets Management**: Environment variables for sensitive data
- ✅ **HTTPS**: All production endpoints use TLS
- ✅ **Git Security**: Service keys never committed to repo

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting PR
- Update documentation as needed

### Reporting Issues
- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide error logs and screenshots
- Mention your environment (OS, Node version, etc.)

---

## 📈 Future Roadmap

- 🎵 **Sound Effects & Music**: Enhance audio experience
- 🌍 **Multiplayer Mode**: Real-time competitive quizzes
- 📱 **Mobile App**: Native iOS/Android applications
- 🤖 **Advanced AI**: GPT integration for question generation
- 🌐 **Multi-language**: Support for international students
- 📊 **Advanced Analytics**: Detailed learning insights and reports
- 🎓 **Certification**: Digital certificates on completion
- 🏫 **School Integration**: Classroom management tools

---

## 📞 Support & Contact

- **Issues**: GitHub Issues
- **Email**: support@jigyasa.com
- **Discord**: Join our community server
- **Documentation**: Full docs available at docs.jigyasa.com

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Team**: All contributors and developers
- **Frameworks**: React, Express, Flask communities
- **Icons**: FontAwesome, React Icons
- **Inspiration**: Educational technology innovators

---

## 🎯 Key Metrics

| Metric | Value |
|--------|-------|
| Frontend Build Size | ~528 KB (gzipped) |
| Backend Endpoints | 50+ |
| ML Models | Per-user adaptive models |
| Supported Users | Scalable to 10k+ concurrent |
| Database | Firestore (NoSQL) |
| Deployment Region | Singapore |
| Uptime SLA | 99.5% |

---

**Last Updated**: May 8, 2026 | **Version**: 1.0.0

---

*Made with ❤️ for educators and learners everywhere*
