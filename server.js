// server.js - Complete Backend with MongoDB & Routes
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const fetchJson = global.fetch
  ? (...args) => global.fetch(...args)
  : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Allow multiple origins for development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4001',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests or direct server calls)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin, '(allowed:', allowedOrigins, ')');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
})); 

const GEMINI_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MONGO_URI = process.env.MONGO_URI || '';

console.log('GEMINI_API_KEY present:', !!GEMINI_KEY);
console.log('Using model:', GEMINI_MODEL);
console.log('MongoDB URI present:', !!MONGO_URI);

// ==================== MONGODB CONNECTION ====================
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection failed:', err.message));
} else {
  console.warn('⚠️ MONGO_URI not set - MongoDB features disabled');
}

// ==================== IMPORT ROUTES ====================
const userRoutes = require('./src/server/routes/user');
const quizzesRoutes = require('./src/server/routes/quizzes');
const scoresRoutes = require('./src/server/routes/scores');
const progressRoutes = require('./src/server/routes/progress');
const gameRoutes = require('./src/server/routes/game');
const flagsRoutes = require('./src/server/routes/flags');

// ==================== REGISTER ROUTES ====================
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/flags', flagsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ success: false, error: err.message });
});

function tryParseJsonMaybe(text) {
  if (!text) return null;
  
  const cleaned = stripCodeFences(text);
  
  // Try 1: Parse cleaned version directly
  try { 
    const result = JSON.parse(cleaned);
    console.log('✅ Parsed JSON from cleaned text');
    return result;
  } catch (e) {}
  
  // Try 2: Parse original text
  try { 
    const result = JSON.parse(text);
    console.log('✅ Parsed JSON from original text');
    return result;
  } catch (e) {}
  
  // Try 3: Extract JSON from between first { and last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = text.slice(first, last + 1);
    try { 
      const result = JSON.parse(candidate);
      console.log('✅ Parsed JSON from extracted substring');
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
    console.log('✅ Parsed JSON after fixing common issues');
    return result;
  } catch (e) {
    console.log('Failed to parse fixed JSON:', e.message);
  }

  console.log('❌ All parsing attempts failed for text length:', text.length);
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
  console.log('\n🔵 /api/generate-quiz called');
  console.log('Request body:', req.body);
  
  if (!GEMINI_KEY) {
    console.log('❌ GEMINI_KEY is empty');
    return res.status(500).json({ success: false, error: 'GOOGLE_API_KEY not configured on server' });
  }
  console.log('✅ GEMINI_KEY is present');

  const { topic = 'General knowledge', count = 5, difficulty = 'easy', type = 'mcq' } = req.body || {};
  const maxOutputTokens = Math.min(4096, 400 + Number(count || 5) * 300);
  console.log('Parameters:', { topic, count, difficulty, type, maxOutputTokens });

  const system = `You are a helpful assistant that returns EXACT JSON. Return a single JSON object with a property "quiz" which is an array of objects: { id, question, options (array of 4 strings), correct (one of options), explanation, difficulty }. Return only JSON, no surrounding text.`;
  const user = `Generate ${count} ${type} questions about ${topic} at difficulty ${difficulty}. Ensure exactly 4 options per question and short explanations.`;

  try {
    const response = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${system}\n\n${user}` }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens,
          responseMimeType: 'application/json',
        },
      }),
      // signal: optional AbortController for timeout if you want
    });

    const status = response.status;
    const raw = await response.text();
    console.log('✅ Gemini API responded with status:', status);
    console.log('Response size:', raw.length, 'bytes');

    if (!response.ok) {
      console.log('❌ Gemini API error response:', raw.slice(0, 500));
      return res.status(500).json({ success: false, error: 'Gemini API returned error', status, raw });
    }

    let apiPayload = null;
    try {
      apiPayload = JSON.parse(raw);
      console.log('✅ Valid JSON from Gemini');
    } catch (e) {
      console.log('❌ Failed to parse Gemini JSON:', e.message);
      return res.json({ success: false, error: 'invalid-gemini-json', raw });
    }

    // Try to extract content from Gemini response
    // First try the standard candidates format
    let content = apiPayload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // If that didn't work, maybe the response is structured differently
    if (!content && typeof apiPayload === 'object') {
      // Check if the entire response is the quiz data
      if (apiPayload.quiz && Array.isArray(apiPayload.quiz)) {
        console.log('✅ Found quiz directly in response');
        return res.json({ success: true, quiz: apiPayload.quiz });
      }
      
      // Try to find text in alternative structures
      if (apiPayload.text) content = apiPayload.text;
      else if (apiPayload.content) content = JSON.stringify(apiPayload.content);
    }
    
    console.log('Extracted content length:', content.length);
    console.log('Extracted content (first 300 chars):', content.slice(0, 300));
    
    if (!content) {
      console.log('❌ No content extracted from response');
      console.log('Response structure:', JSON.stringify(apiPayload).slice(0, 500));
      return res.json({ success: false, error: 'no-content-extracted', apiPayloadKeys: Object.keys(apiPayload) });
    }
    
    const finishReason = apiPayload?.candidates?.[0]?.finishReason || apiPayload?.candidates?.[0]?.finish_reason || '';
    let parsed = tryParseJsonMaybe(content);
    console.log('Parsed quiz:', parsed ? `${parsed.quiz ? parsed.quiz.length + ' questions' : 'no quiz property'}` : 'null');
    
    if (!parsed || !Array.isArray(parsed.quiz)) {
      console.log('❌ Invalid quiz format, parsed:', JSON.stringify(parsed).slice(0, 200));
      return res.json({ success: false, error: 'invalid-quiz-json', raw, content, finishReason, parsedAttempt: parsed });
    }

    console.log('✅ Returning', parsed.quiz.length, 'questions');
    return res.json({ success: true, quiz: parsed.quiz });
  } catch (err) {
    console.error('Server -> Gemini call failed:', err);
    return res.status(500).json({ success: false, error: 'server-exception', message: err.message });
  }
});

const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
app.get('/', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`));
