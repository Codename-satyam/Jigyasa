// server.js - improved
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4000' })); 

const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'; 

console.log('OPENAI_API_KEY present:', !!OPENAI_KEY);
console.log('Using model:', OPENAI_MODEL);

function tryParseJsonMaybe(text) {
  try { return JSON.parse(text); } catch (e) {}
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = text.slice(first, last + 1);
    try { return JSON.parse(candidate); } catch (e) {}
  }

  try {
    let fixed = text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
    fixed = fixed.replace(/'/g, '"');
    return JSON.parse(fixed);
  } catch (e) {}

  // Give up
  return null;
}

app.post('/api/generate-quiz', async (req, res) => {
  if (!OPENAI_KEY) return res.status(500).json({ success: false, error: 'OPENAI_API_KEY not configured on server' });

  const { topic = 'General knowledge', count = 5, difficulty = 'easy', type = 'mcq' } = req.body || {};

  const system = `You are a helpful assistant that returns EXACT JSON. Return a single JSON object with a property "quiz" which is an array of objects: { id, question, options (array of 4 strings), correct (one of options), explanation, difficulty }. Return only JSON, no surrounding text.`;
  const user = `Generate ${count} ${type} questions about ${topic} at difficulty ${difficulty}. Ensure exactly 4 options per question and short explanations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 1000,
        temperature: 0.6,
      }),
      // signal: optional AbortController for timeout if you want
    });

    const status = response.status;
    const raw = await response.text();
    console.log('OpenAI status:', status);
    console.log('OpenAI raw (truncated):', raw.slice(0, 2000));

    if (!response.ok) {
      return res.status(500).json({ success: false, error: 'OpenAI API returned error', status, raw });
    }

    // Attempt robust parsing
    let parsed = tryParseJsonMaybe(raw);
    if (!parsed || !Array.isArray(parsed.quiz)) {
      return res.json({ success: false, error: 'invalid-quiz-json', raw, parsedAttempt: parsed });
    }

    return res.json({ success: true, quiz: parsed.quiz });
  } catch (err) {
    console.error('Server -> OpenAI call failed:', err);
    return res.status(500).json({ success: false, error: 'server-exception', message: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`));
