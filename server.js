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
const quizAttemptsRoutes = require('./server/routes/quizAttempts');
const progressRoutes = require('./server/routes/progress');
const gameRoutes = require('./server/routes/game');
const flagsRoutes = require('./server/routes/flags');
const difficultyRoutes = require('./server/routes/difficulty');


// ==================== REGISTER ROUTES ====================
app.use('/api/users', userRoutes);
app.use('/api/difficulty', difficultyRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/quiz-attempts', quizAttemptsRoutes);
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
  console.log('Parameters:', { topic, count, difficulty, type, GEMINI_KEY: !!GEMINI_KEY, GEMINI_MODEL });

  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY is not configured');
    return res.status(500).json({ error: 'Quiz generation service not available (GEMINI_API_KEY not configured)' });
  }

  try {
    const prompt = `Generate exactly ${count} multiple choice quiz questions about "${topic}" with difficulty level "${difficulty}". 
    
    Return ONLY a valid JSON array with this exact structure, no additional text:
    [
      {
        "id": 1,
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": "Option A",
        "explanation": "Explanation of why this answer is correct",
        "difficulty": "${difficulty}"
      }
    ]
    
    Requirements:
    - Each question must have exactly 4 options
    - The "correct" field must be EXACTLY one of the 4 options
    - Make sure the correct answer is randomly positioned among the 4 options (not always first)
    - Difficulty should be: ${difficulty}
    - Return ONLY the JSON array, no markdown, no code blocks, no extra text`;

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_KEY;

    const response = await fetchJson(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      return res.status(response.status || 500).json({
        error: 'Failed to generate quiz with Gemini API',
        details: errorData?.error?.message || response.statusText,
      });
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure');
      return res.status(500).json({ error: 'Unexpected response from Gemini API' });
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);

    let questions = [];
    try {
      questions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError.message);
      
      // Try to extract JSON from markdown code blocks
      let cleanedText = generatedText;
      
      // Remove markdown code blocks (```json...``` or ```...```)
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleanedText = cleanedText.trim();
      
      console.log('Cleaned text:', cleanedText.substring(0, 100) + '...');
      
      try {
        questions = JSON.parse(cleanedText);
      } catch (retryError) {
        console.error('Failed to parse cleaned text:', retryError.message);
        
        // Last resort: try to extract JSON array with regex
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            questions = JSON.parse(jsonMatch[0]);
          } catch (finalError) {
            console.error('Failed to parse regex-extracted JSON:', finalError.message);
            return res.status(500).json({ error: 'Failed to parse quiz data from Gemini API', details: finalError.message });
          }
        } else {
          console.error('Could not extract JSON array from response');
          return res.status(500).json({ error: 'Failed to parse quiz data from Gemini API', details: 'No JSON array found in response' });
        }
      }
    }

    if (!Array.isArray(questions)) {
      console.error('Generated questions is not an array:', questions);
      return res.status(500).json({ error: 'Invalid quiz format from Gemini API' });
    }

    console.log(`Returning ${questions.length} questions for topic: ${topic}`);
    res.json({ success: true, quiz: questions });
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
