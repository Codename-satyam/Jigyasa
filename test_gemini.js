require('dotenv').config();

const GEMINI_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

console.log('Testing Gemini API...');
console.log('API Key:', GEMINI_KEY ? `${GEMINI_KEY.substring(0, 10)}...` : 'MISSING');

const requestBody = {
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: 'Generate 1 multiple choice question about general knowledge. Return a JSON object with properties: {question, options (array of 4), correct}'
        }
      ]
    }
  ],
  generationConfig: {
    temperature: 0.6,
    maxOutputTokens: 1000
  }
};

const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

console.log(`\nCalling: ${url}`);
console.log('\nRequest body:');
console.log(JSON.stringify(requestBody, null, 2));

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
  timeout: 30000
})
  .then(async (res) => {
    console.log('\n✓ Got response');
    console.log('Status:', res.status, res.statusText);
    console.log('Headers:', Object.fromEntries(res.headers));
    
    const text = await res.text();
    console.log('\nRaw response (first 2000 chars):');
    console.log(text.substring(0, 2000));
    
    if (res.ok) {
      try {
        const json = JSON.parse(text);
        console.log('\n✓ Valid JSON received');
        console.log('Response structure:');
        console.log('- candidates:', json.candidates ? json.candidates.length : 'missing');
        if (json.candidates && json.candidates[0]) {
          console.log('  - content:', json.candidates[0].content ? 'present' : 'missing');
          if (json.candidates[0].content && json.candidates[0].content.parts) {
            console.log('  - parts:', json.candidates[0].content.parts.length);
            if (json.candidates[0].content.parts[0]) {
              console.log('    - text:', json.candidates[0].content.parts[0].text.substring(0, 200));
            }
          }
        }
      } catch (e) {
        console.log('\n✗ JSON parse error:', e.message);
      }
    }
  })
  .catch((err) => {
    console.log('\n✗ Request failed');
    console.log('Error:', err.message);
  });
