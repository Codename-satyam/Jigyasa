// server.js - Backend with local JSON storage & routes
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { getFirestore } = require('./server/storage/firebase');

const fetchJson = global.fetch
  ? (...args) => global.fetch(...args)
  : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const normalizeOrigin = (origin) => String(origin || '').replace(/\/$/, '').toLowerCase();
const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => normalizeOrigin(item.trim()))
    .filter(Boolean);

const corsAllowAll = /^true$/i.test(String(process.env.CORS_ALLOW_ALL || ''));
const allowedOrigins = new Set(
  [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://localhost:4001',
    'http://127.0.0.1:4001',
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    process.env.CLIENT_ORIGIN,
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

if (corsAllowAll) {
  console.warn('WARNING: CORS_ALLOW_ALL=true: all origins are allowed');
} else {
  console.log('CORS allowed origins:', Array.from(allowedOrigins));
}

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests or direct server calls)
    if (!origin) return callback(null, true);

    if (corsAllowAll) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    
    if (allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin, '(allowed:', Array.from(allowedOrigins), ')');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})); 

const GEMINI_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

console.log('GEMINI_API_KEY present:', !!GEMINI_KEY);
console.log('Using model:', GEMINI_MODEL);

// ==================== IMPORT ROUTES ====================
const userRoutes = require('./server/routes/user');
const quizzesRoutes = require('./server/routes/quizzes');
const scoresRoutes = require('./server/routes/scores');
const progressRoutes = require('./server/routes/progress');
const gameRoutes = require('./server/routes/game');
const flagsRoutes = require('./server/routes/flags');
const difficultyRoutes = require('./server/routes/difficulty');


// ==================== REGISTER ROUTES ====================
app.use('/api/users', userRoutes);
app.use('/api/difficulty', difficultyRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/flags', flagsRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

function tryParseJsonMaybe(text) {
  if (!text) return null;
  
  const cleaned = stripCodeFences(text);
  
  // Try 1: Parse cleaned version directly
  try { 
    const result = JSON.parse(cleaned);
    console.log('Parsed JSON from cleaned text');
    return result;
  } catch (e) {}
  
  // Try 2: Parse original text
  try { 
    const result = JSON.parse(text);
    console.log('Parsed JSON from original text');
    return result;
  } catch (e) {}
  
  // Try 3: Extract JSON from between first { and last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = text.slice(first, last + 1);
    try { 
      const result = JSON.parse(candidate);
      console.log('Parsed JSON from extracted substring');
      return result;
    } catch (e) {
      console.log('Failed to parse extracted substring:', e.message);
    }
  }

  // Try 4: Fix common JSON issues
  try {
    let fixed = text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    fixed = fixed.replace(/'/g, '"');
    const result = JSON.parse(fixed);
    console.log('Parsed JSON after fixing common issues');
    return result;
  } catch (e) {
    console.log('Failed to parse fixed JSON:', e.message);
  }

  console.log('All parsing attempts failed for text length:', text.length);
  return null;
}

function stripCodeFences(text) {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```[a-zA-Z0-9_-]*\s*/m, '').replace(/```\s*$/m, '').trim();
  }
  return trimmed;
}

app.post('/api/generate-quiz', async (req, res) => {
  console.log('\n/api/generate-quiz called');
  
  const { topic = 'General knowledge', count = 5, difficulty = 'easy', type = 'mcq' } = req.body || {};
  console.log('Parameters:', { topic, count, difficulty, type });

  // Local quiz database - works from any region, no API calls needed
  const quizDatabase = {
    'General knowledge': [
      { id: 1, question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correct: 'Paris', explanation: 'Paris is the capital and largest city of France.', difficulty: 'easy' },
      { id: 2, question: 'Which planet is closest to the sun?', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correct: 'Mercury', explanation: 'Mercury is the smallest and closest planet to the Sun.', difficulty: 'easy' },
      { id: 3, question: 'What is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'], correct: 'Pacific Ocean', explanation: 'The Pacific Ocean covers more area than all land on Earth combined.', difficulty: 'easy' },
      { id: 4, question: 'In what year did World War II end?', options: ['1943', '1944', '1945', '1946'], correct: '1945', explanation: 'World War II ended in 1945 with the surrender of Japan.', difficulty: 'easy' },
      { id: 5, question: 'Who painted the Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Botticelli'], correct: 'Leonardo da Vinci', explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 1500s.', difficulty: 'easy' },
    ],
    'Science': [
      { id: 1, question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 'Au', explanation: 'Au is the chemical symbol for Gold, derived from its Latin name aurum.', difficulty: 'easy' },
      { id: 2, question: 'What is the speed of light?', options: ['300,000 km/s', '3,000 km/s', '30,000 km/s', '3,000,000 km/s'], correct: '300,000 km/s', explanation: 'Light travels at approximately 300,000 kilometers per second in a vacuum.', difficulty: 'medium' },
      { id: 3, question: 'How many bones does an adult human have?', options: ['186', '206', '226', '246'], correct: '206', explanation: 'An adult human typically has 206 bones in their body.', difficulty: 'medium' },
    ],
    'History': [
      { id: 1, question: 'In which year did the Titanic sink?', options: ['1910', '1911', '1912', '1913'], correct: '1912', explanation: 'The RMS Titanic sank on April 15, 1912, after hitting an iceberg.', difficulty: 'easy' },
      { id: 2, question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], correct: 'George Washington', explanation: 'George Washington was the first President of the United States (1789-1797).', difficulty: 'easy' },
    ],
    'Mathematics': [
      { id: 1, question: 'What is 15 x 12?', options: ['160', '170', '180', '190'], correct: '180', explanation: '15 multiplied by 12 equals 180.', difficulty: 'easy' },
      { id: 2, question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: '12', explanation: 'The square root of 144 is 12 (12 x 12 = 144).', difficulty: 'easy' },
    ],
    'Geography': [
      { id: 1, question: 'What is the capital of Japan?', options: ['Osaka', 'Tokyo', 'Kyoto', 'Yokohama'], correct: 'Tokyo', explanation: 'Tokyo is the capital and largest city of Japan.', difficulty: 'easy' },
      { id: 2, question: 'Which is the longest river in the world?', options: ['Amazon', 'Yangtze', 'Mississippi', 'Nile'], correct: 'Nile', explanation: 'The Nile River in Africa is the longest river in the world.', difficulty: 'easy' },
    ],
  };

  try {
    // Get template for the topic (case-insensitive)
    const topicKey = Object.keys(quizDatabase).find(k => k.toLowerCase() === topic.toLowerCase()) || 'General knowledge';
    const templateQuestions = quizDatabase[topicKey] || quizDatabase['General knowledge'];
    
    // Select random questions from template
    const numToReturn = Math.min(count, templateQuestions.length);
    const selected = [];
    const usedIndices = new Set();
    
    while (selected.length < numToReturn) {
      const randomIdx = Math.floor(Math.random() * templateQuestions.length);
      if (!usedIndices.has(randomIdx)) {
        usedIndices.add(randomIdx);
        const question = { ...templateQuestions[randomIdx], id: selected.length + 1 };
        selected.push(question);
      }
    }

    console.log(`Returning ${selected.length} questions for topic: ${topicKey}`);
    res.json({ success: true, quiz: selected });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ success: false, error: 'server-exception', message: err.message });
  }
});

app.get('/api/health', async (req, res) => {
  const startedAt = Date.now();
  const db = getFirestore();
  const health = {
    success: true,
    service: 'quizy-api',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(GEMINI_KEY),
    firebase: {
      configured: Boolean(db),
      connected: false,
    },
  };

  try {
    if (db) {
      await db.collection('_health').doc('server').set({
        service: 'quizy-api',
        checkedAt: new Date().toISOString(),
      }, { merge: true });
      health.firebase.connected = true;
    }
  } catch (err) {
    health.success = false;
    health.firebase.error = err.message;
  }

  health.responseTimeMs = Date.now() - startedAt;
  res.status(health.success ? 200 : 503).json(health);
});

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

async function verifyFirebaseConnection() {
  const db = getFirestore();

  if (!db) {
    throw new Error('Firebase credentials are missing. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env');
  }

  await db.collection('_health').doc('server').set({
    service: 'quizy-api',
    checkedAt: new Date().toISOString(),
  }, { merge: true });

  console.log('Database: Firebase Firestore');
  console.log('Firebase connection verified');
}

async function startServer() {
  try {
    await verifyFirebaseConnection();

    app.listen(PORT, HOST, () => {
      const hostForLog = HOST === '0.0.0.0' ? 'localhost' : HOST;
      console.log(`Server listening on http://${hostForLog}:${PORT}`);
    });
  } catch (err) {
    console.error('Firebase connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
