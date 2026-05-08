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
      { id: 6, question: 'What is the largest country by area?', options: ['Canada', 'Russia', 'China', 'USA'], correct: 'Russia', explanation: 'Russia is the largest country in the world by total area.', difficulty: 'easy' },
      { id: 7, question: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: '7', explanation: 'There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Oceania, and South America.', difficulty: 'easy' },
      { id: 8, question: 'Which is the smallest country in the world?', options: ['Monaco', 'Liechtenstein', 'Vatican City', 'Malta'], correct: 'Vatican City', explanation: 'Vatican City is the smallest independent country in the world.', difficulty: 'medium' },
      { id: 9, question: 'How many strings does a violin have?', options: ['3', '4', '5', '6'], correct: '4', explanation: 'A violin typically has 4 strings.', difficulty: 'medium' },
      { id: 10, question: 'What is the deepest ocean trench?', options: ['Mariana Trench', 'Tonga Trench', 'Philippine Trench', 'Kuril-Kamchatka Trench'], correct: 'Mariana Trench', explanation: 'The Mariana Trench in the Pacific Ocean is the deepest known oceanic trench.', difficulty: 'medium' },
      { id: 11, question: 'Who invented the telephone?', options: ['Nikola Tesla', 'Alexander Graham Bell', 'Thomas Edison', 'Michael Faraday'], correct: 'Alexander Graham Bell', explanation: 'Alexander Graham Bell is credited with inventing the telephone in 1876.', difficulty: 'easy' },
      { id: 12, question: 'What is the chemical formula for salt?', options: ['NaCl', 'KCl', 'CaCl2', 'MgCl2'], correct: 'NaCl', explanation: 'Sodium chloride (NaCl) is the chemical formula for common salt.', difficulty: 'medium' },
    ],
    'Science': [
      { id: 1, question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 'Au', explanation: 'Au is the chemical symbol for Gold, derived from its Latin name aurum.', difficulty: 'easy' },
      { id: 2, question: 'What is the speed of light?', options: ['300,000 km/s', '3,000 km/s', '30,000 km/s', '3,000,000 km/s'], correct: '300,000 km/s', explanation: 'Light travels at approximately 300,000 kilometers per second in a vacuum.', difficulty: 'medium' },
      { id: 3, question: 'How many bones does an adult human have?', options: ['186', '206', '226', '246'], correct: '206', explanation: 'An adult human typically has 206 bones in their body.', difficulty: 'medium' },
      { id: 4, question: 'What is the chemical symbol for Oxygen?', options: ['O', 'Ox', 'O2', 'Oy'], correct: 'O', explanation: 'O is the chemical symbol for Oxygen on the periodic table.', difficulty: 'easy' },
      { id: 5, question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'], correct: 'Mitochondria', explanation: 'The mitochondria is responsible for producing energy in the cell through cellular respiration.', difficulty: 'medium' },
      { id: 6, question: 'How many chambers does a human heart have?', options: ['2', '3', '4', '5'], correct: '4', explanation: 'The human heart has 4 chambers: two atria and two ventricles.', difficulty: 'easy' },
      { id: 7, question: 'What is the most abundant gas in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], correct: 'Nitrogen', explanation: 'Nitrogen (N2) makes up about 78% of Earth\'s atmosphere.', difficulty: 'medium' },
      { id: 8, question: 'What is the boiling point of water?', options: ['90°C', '100°C', '110°C', '120°C'], correct: '100°C', explanation: 'Water boils at 100 degrees Celsius at sea level.', difficulty: 'easy' },
      { id: 9, question: 'What do plants primarily use sunlight for?', options: ['Respiration', 'Photosynthesis', 'Reproduction', 'Growth'], correct: 'Photosynthesis', explanation: 'Plants use sunlight during photosynthesis to convert light energy into chemical energy.', difficulty: 'easy' },
      { id: 10, question: 'What is the SI unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 'Newton', explanation: 'The Newton (N) is the SI unit of force in physics.', difficulty: 'medium' },
    ],
    'History': [
      { id: 1, question: 'In which year did the Titanic sink?', options: ['1910', '1911', '1912', '1913'], correct: '1912', explanation: 'The RMS Titanic sank on April 15, 1912, after hitting an iceberg.', difficulty: 'easy' },
      { id: 2, question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], correct: 'George Washington', explanation: 'George Washington was the first President of the United States (1789-1797).', difficulty: 'easy' },
      { id: 3, question: 'In which century did the French Revolution occur?', options: ['17th', '18th', '19th', '20th'], correct: '18th', explanation: 'The French Revolution took place in the late 18th century (1789-1799).', difficulty: 'medium' },
      { id: 4, question: 'Who was the first Emperor of Rome?', options: ['Julius Caesar', 'Augustus', 'Nero', 'Caligula'], correct: 'Augustus', explanation: 'Augustus was the first Roman Emperor, ruling from 27 BC to 14 AD.', difficulty: 'medium' },
      { id: 5, question: 'In which year did the Berlin Wall fall?', options: ['1987', '1988', '1989', '1990'], correct: '1989', explanation: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War.', difficulty: 'medium' },
      { id: 6, question: 'Who discovered America in 1492?', options: ['Leif Erikson', 'Christopher Columbus', 'Vasco da Gama', 'Ferdinand Magellan'], correct: 'Christopher Columbus', explanation: 'Christopher Columbus is credited with the European discovery of America in 1492.', difficulty: 'easy' },
      { id: 7, question: 'In which year did the Magna Carta sign?', options: ['1115', '1215', '1315', '1415'], correct: '1215', explanation: 'The Magna Carta was signed in 1215, establishing the principle of rule of law in England.', difficulty: 'hard' },
      { id: 8, question: 'Who was the first Soviet leader?', options: ['Stalin', 'Lenin', 'Trotsky', 'Khrushchev'], correct: 'Lenin', explanation: 'Vladimir Lenin was the first leader of the Soviet Union after the Russian Revolution.', difficulty: 'medium' },
      { id: 9, question: 'In which year did the Titanic sink?', options: ['1911', '1912', '1913', '1914'], correct: '1912', explanation: 'The Titanic sank on April 15, 1912.', difficulty: 'easy' },
      { id: 10, question: 'Who was the first female Prime Minister of the UK?', options: ['Barbara Castle', 'Margaret Thatcher', 'Theresa May', 'Indira Gandhi'], correct: 'Margaret Thatcher', explanation: 'Margaret Thatcher was the first female Prime Minister of the United Kingdom (1979-1990).', difficulty: 'medium' },
    ],
    'Mathematics': [
      { id: 1, question: 'What is 15 x 12?', options: ['160', '170', '180', '190'], correct: '180', explanation: '15 multiplied by 12 equals 180.', difficulty: 'easy' },
      { id: 2, question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correct: '12', explanation: 'The square root of 144 is 12 (12 x 12 = 144).', difficulty: 'easy' },
      { id: 3, question: 'What is 25% of 200?', options: ['40', '50', '60', '70'], correct: '50', explanation: '25% of 200 = 0.25 × 200 = 50.', difficulty: 'easy' },
      { id: 4, question: 'What is the value of Pi (π) approximately?', options: ['2.14', '3.14', '4.14', '5.14'], correct: '3.14', explanation: 'Pi (π) is approximately 3.14159.', difficulty: 'easy' },
      { id: 5, question: 'What is 7 squared?', options: ['42', '49', '56', '63'], correct: '49', explanation: '7 squared (7²) = 7 × 7 = 49.', difficulty: 'easy' },
      { id: 6, question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correct: '180°', explanation: 'The sum of all interior angles in a triangle is always 180 degrees.', difficulty: 'medium' },
      { id: 7, question: 'What is 100 divided by 4?', options: ['20', '25', '30', '35'], correct: '25', explanation: '100 ÷ 4 = 25.', difficulty: 'easy' },
      { id: 8, question: 'What is the next prime number after 10?', options: ['11', '12', '13', '14'], correct: '11', explanation: '11 is the next prime number after 10.', difficulty: 'medium' },
      { id: 9, question: 'What is 8 cubed?', options: ['512', '524', '536', '548'], correct: '512', explanation: '8 cubed (8³) = 8 × 8 × 8 = 512.', difficulty: 'medium' },
      { id: 10, question: 'What is 50% of 80?', options: ['35', '40', '45', '50'], correct: '40', explanation: '50% of 80 = 0.5 × 80 = 40.', difficulty: 'easy' },
    ],
    'Geography': [
      { id: 1, question: 'What is the capital of Japan?', options: ['Osaka', 'Tokyo', 'Kyoto', 'Yokohama'], correct: 'Tokyo', explanation: 'Tokyo is the capital and largest city of Japan.', difficulty: 'easy' },
      { id: 2, question: 'Which is the longest river in the world?', options: ['Amazon', 'Yangtze', 'Mississippi', 'Nile'], correct: 'Nile', explanation: 'The Nile River in Africa is the longest river in the world.', difficulty: 'easy' },
      { id: 3, question: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 'Canberra', explanation: 'Canberra is the capital city of Australia.', difficulty: 'medium' },
      { id: 4, question: 'Which country has the most mountains?', options: ['Switzerland', 'Norway', 'China', 'Nepal'], correct: 'China', explanation: 'China has the most mountains of any country in the world.', difficulty: 'hard' },
      { id: 5, question: 'What is the capital of Egypt?', options: ['Alexandria', 'Giza', 'Cairo', 'Luxor'], correct: 'Cairo', explanation: 'Cairo is the capital and largest city of Egypt.', difficulty: 'easy' },
      { id: 6, question: 'Which is the largest island in the world?', options: ['New Guinea', 'Borneo', 'Greenland', 'Madagascar'], correct: 'Greenland', explanation: 'Greenland is the largest island in the world.', difficulty: 'medium' },
      { id: 7, question: 'What is the capital of India?', options: ['Mumbai', 'Delhi', 'Bangalore', 'Calcutta'], correct: 'Delhi', explanation: 'New Delhi is the capital of India.', difficulty: 'easy' },
      { id: 8, question: 'How many countries are in the European Union?', options: ['25', '27', '29', '31'], correct: '27', explanation: 'As of 2024, there are 27 member states in the European Union.', difficulty: 'medium' },
      { id: 9, question: 'What is the tallest mountain in the world?', options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'], correct: 'Mount Everest', explanation: 'Mount Everest, located in the Himalayas, is the tallest mountain in the world at 29,032 feet.', difficulty: 'easy' },
      { id: 10, question: 'Which desert is the largest in the world?', options: ['Sahara', 'Arabian', 'Gobi', 'Kalahari'], correct: 'Sahara', explanation: 'The Sahara is the largest hot desert in the world, located in Africa.', difficulty: 'easy' },
    ],
    'Video Games': [
      { id: 1, question: 'In The Legend of Zelda series, what is the name of the magical artifact sought by Ganondorf?', options: ['Master Sword', 'Hylian Shield', 'Triforce', 'Ocarina of Time'], correct: 'Triforce', explanation: 'The Triforce is the central magical artifact in The Legend of Zelda series.', difficulty: 'medium' },
      { id: 2, question: 'Which game franchise features a character named Mario?', options: ['Sonic the Hedgehog', 'Super Mario', 'Mega Man', 'Donkey Kong'], correct: 'Super Mario', explanation: 'Mario is the protagonist of the Super Mario video game franchise by Nintendo.', difficulty: 'easy' },
      { id: 3, question: 'What is the name of the protagonist in The Witcher 3?', options: ['Geralt of Rivia', 'Ciri', 'Yennefer', 'Triss'], correct: 'Geralt of Rivia', explanation: 'Geralt of Rivia is the main protagonist and playable character in The Witcher 3.', difficulty: 'medium' },
      { id: 4, question: 'In Minecraft, what is the most basic building block?', options: ['Wood', 'Stone', 'Dirt', 'Grass'], correct: 'Dirt', explanation: 'Dirt is one of the most basic and abundant building materials in Minecraft.', difficulty: 'easy' },
      { id: 5, question: 'Which game is NOT part of the Halo franchise?', options: ['Halo: Combat Evolved', 'Halo 2', 'Call of Duty', 'Halo 3'], correct: 'Call of Duty', explanation: 'Call of Duty is a separate first-person shooter franchise, not part of Halo.', difficulty: 'medium' },
      { id: 6, question: 'What is the main goal in The Legend of Zelda: Breath of the Wild?', options: ['Rescue the princess', 'Defeat Ganon', 'Collect all items', 'Complete all dungeons'], correct: 'Defeat Ganon', explanation: 'The main objective in Breath of the Wild is to defeat Calamity Ganon.', difficulty: 'medium' },
      { id: 7, question: 'In Fortnite, what does reaching level 100 unlock?', options: ['New weapons', 'Victory Royale', 'Battle Pass reward', 'A special skin'], correct: 'Battle Pass reward', explanation: 'Reaching level 100 in Fortnite unlocks special rewards from the Battle Pass.', difficulty: 'hard' },
      { id: 8, question: 'What is the best-selling video game of all time?', options: ['Grand Theft Auto V', 'Tetris', 'Minecraft', 'PUBG'], correct: 'Tetris', explanation: 'Tetris is one of the best-selling video games of all time with over 100 million copies sold.', difficulty: 'hard' },
      { id: 9, question: 'In Pokemon, what is the first Pokemon in the Pokedex?', options: ['Pikachu', 'Squirtle', 'Bulbasaur', 'Charmander'], correct: 'Bulbasaur', explanation: 'Bulbasaur is the first Pokemon in the National Pokedex.', difficulty: 'easy' },
      { id: 10, question: 'What console did Super Smash Bros. Melee release on?', options: ['Nintendo 64', 'GameCube', 'Wii', 'Switch'], correct: 'GameCube', explanation: 'Super Smash Bros. Melee was released for the Nintendo GameCube in 2001.', difficulty: 'medium' },
    ],
    'Sports': [
      { id: 1, question: 'How many players are on a basketball team on the court?', options: ['4', '5', '6', '7'], correct: '5', explanation: 'Each basketball team has 5 players on the court at a time.', difficulty: 'easy' },
      { id: 2, question: 'In cricket, how many runs make a century?', options: ['50', '75', '100', '150'], correct: '100', explanation: 'A century in cricket is 100 runs scored by a batsman.', difficulty: 'easy' },
      { id: 3, question: 'How many sets must a tennis player win to win a standard match?', options: ['1', '2', '3', '4'], correct: '2', explanation: 'In most tennis matches, a player must win 2 out of 3 sets to win.', difficulty: 'medium' },
      { id: 4, question: 'How many players are on an American football team on the field?', options: ['10', '11', '12', '13'], correct: '11', explanation: 'Each American football team has 11 players on the field at a time.', difficulty: 'easy' },
      { id: 5, question: 'How many overs are played in a Twenty20 cricket match?', options: ['10', '15', '20', '25'], correct: '20', explanation: 'A Twenty20 cricket match consists of 20 overs per team.', difficulty: 'medium' },
      { id: 6, question: 'What is the maximum score in 10-pin bowling?', options: ['200', '250', '300', '350'], correct: '300', explanation: 'The maximum perfect score in bowling is 300 points.', difficulty: 'medium' },
      { id: 7, question: 'How many players are on a soccer team on the field?', options: ['10', '11', '12', '13'], correct: '11', explanation: 'Each soccer team has 11 players on the field at a time.', difficulty: 'easy' },
      { id: 8, question: 'In golf, what is a score of one under par called?', options: ['Birdie', 'Eagle', 'Albatross', 'Bogie'], correct: 'Birdie', explanation: 'A birdie in golf is a score of one stroke under par.', difficulty: 'medium' },
      { id: 9, question: 'How many rounds are in a professional boxing match?', options: ['8', '10', '12', '14'], correct: '12', explanation: 'Professional boxing matches consist of 12 rounds (3 minutes each).', difficulty: 'medium' },
      { id: 10, question: 'What is the height of the basketball hoop from the ground?', options: ['9 feet', '10 feet', '11 feet', '12 feet'], correct: '10 feet', explanation: 'A basketball hoop is 10 feet (3.05 meters) above the ground.', difficulty: 'easy' },
    ],
    'Books': [
      { id: 1, question: 'Who wrote "Pride and Prejudice"?', options: ['Charlotte Brontë', 'Jane Austen', 'Emily Dickinson', 'George Eliot'], correct: 'Jane Austen', explanation: 'Jane Austen wrote Pride and Prejudice, published in 1813.', difficulty: 'easy' },
      { id: 2, question: 'How many books are in the Harry Potter series?', options: ['5', '6', '7', '8'], correct: '7', explanation: 'J.K. Rowling wrote 7 books in the Harry Potter series.', difficulty: 'easy' },
      { id: 3, question: 'Who wrote "1984"?', options: ['George Orwell', 'Aldous Huxley', 'Ray Bradbury', 'Margaret Atwood'], correct: 'George Orwell', explanation: 'George Orwell wrote the dystopian novel 1984, published in 1949.', difficulty: 'easy' },
      { id: 4, question: 'Who is the author of "The Great Gatsby"?', options: ['Ernest Hemingway', 'F. Scott Fitzgerald', 'William Faulkner', 'John Steinbeck'], correct: 'F. Scott Fitzgerald', explanation: 'F. Scott Fitzgerald wrote The Great Gatsby, published in 1925.', difficulty: 'easy' },
      { id: 5, question: 'How many books are in the Lord of the Rings series?', options: ['3', '4', '5', '6'], correct: '3', explanation: 'J.R.R. Tolkien wrote 3 main books in The Lord of the Rings series.', difficulty: 'easy' },
      { id: 6, question: 'Who wrote "To Kill a Mockingbird"?', options: ['Harper Lee', 'Margaret Mitchell', 'Carson McCullers', 'Flannery O\'Connor'], correct: 'Harper Lee', explanation: 'Harper Lee wrote To Kill a Mockingbird, published in 1960.', difficulty: 'easy' },
      { id: 7, question: 'Who is the author of "War and Peace"?', options: ['Dostoevsky', 'Tolstoy', 'Chekhov', 'Pushkin'], correct: 'Tolstoy', explanation: 'Leo Tolstoy wrote War and Peace, one of the longest novels ever written.', difficulty: 'medium' },
      { id: 8, question: 'How many books did Agatha Christie write?', options: ['50', '60', '66', '70'], correct: '66', explanation: 'Agatha Christie wrote 66 detective novels during her lifetime.', difficulty: 'hard' },
      { id: 9, question: 'Who wrote "The Catcher in the Rye"?', options: ['J.D. Salinger', 'Norman Mailer', 'Saul Bellow', 'Philip Roth'], correct: 'J.D. Salinger', explanation: 'J.D. Salinger wrote The Catcher in the Rye, published in 1951.', difficulty: 'medium' },
      { id: 10, question: 'Who is the author of "Jane Eyre"?', options: ['Jane Austen', 'Charlotte Brontë', 'Emily Brontë', 'Anne Brontë'], correct: 'Charlotte Brontë', explanation: 'Charlotte Brontë wrote Jane Eyre, a gothic romance novel published in 1847.', difficulty: 'medium' },
    ],
    'Film': [
      { id: 1, question: 'In which year was the first Star Wars film released?', options: ['1975', '1977', '1979', '1981'], correct: '1977', explanation: 'A New Hope, the first Star Wars film, was released in 1977.', difficulty: 'easy' },
      { id: 2, question: 'Who directed "Inception"?', options: ['Steven Spielberg', 'Christopher Nolan', 'James Cameron', 'Martin Scorsese'], correct: 'Christopher Nolan', explanation: 'Christopher Nolan directed the science fiction film Inception in 2010.', difficulty: 'medium' },
      { id: 3, question: 'Who won Best Actor at the 2020 Academy Awards?', options: ['Joaquin Phoenix', 'Christian Bale', 'Leonardo DiCaprio', 'Tom Hanks'], correct: 'Joaquin Phoenix', explanation: 'Joaquin Phoenix won Best Actor for his role in Joker at the 2020 Academy Awards.', difficulty: 'medium' },
      { id: 4, question: 'In how many parts was The Hobbit trilogy filmed?', options: ['2', '3', '4', '5'], correct: '3', explanation: 'The Hobbit was adapted into a trilogy of films directed by Peter Jackson.', difficulty: 'easy' },
      { id: 5, question: 'Who directed "The Shawshank Redemption"?', options: ['Steven Spielberg', 'Frank Darabont', 'Martin Scorsese', 'Quentin Tarantino'], correct: 'Frank Darabont', explanation: 'Frank Darabont directed The Shawshank Redemption, released in 1994.', difficulty: 'medium' },
      { id: 6, question: 'Which movie won the Academy Award for Best Picture in 2022?', options: ['Dune', 'CODA', 'West Side Story', 'Don\'t Look Up'], correct: 'CODA', explanation: 'CODA won the Academy Award for Best Picture at the 2022 Oscars.', difficulty: 'hard' },
      { id: 7, question: 'Who directed "Pulp Fiction"?', options: ['David Fincher', 'Quentin Tarantino', 'Paul Thomas Anderson', 'Christopher Nolan'], correct: 'Quentin Tarantino', explanation: 'Quentin Tarantino directed Pulp Fiction, released in 1994.', difficulty: 'easy' },
      { id: 8, question: 'What year was "Avatar" released?', options: ['2007', '2008', '2009', '2010'], correct: '2009', explanation: 'Avatar, directed by James Cameron, was released in 2009.', difficulty: 'easy' },
      { id: 9, question: 'Who won the Golden Globe for Best Drama Film in 2023?', options: ['Top Gun', 'Avatar', 'The Fabelmans', 'Tar'], correct: 'Avatar', explanation: 'Avatar: The Way of Water won the Golden Globe for Best Drama Film in 2023.', difficulty: 'hard' },
      { id: 10, question: 'Who directed "The Dark Knight"?', options: ['Tim Burton', 'Joel Schumacher', 'Christopher Nolan', 'Jon Favreau'], correct: 'Christopher Nolan', explanation: 'Christopher Nolan directed The Dark Knight, released in 2008.', difficulty: 'easy' },
    ],
    'Computers': [
      { id: 1, question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Personal Utility', 'Computing Processing Unit'], correct: 'Central Processing Unit', explanation: 'CPU stands for Central Processing Unit, the main processor in a computer.', difficulty: 'easy' },
      { id: 2, question: 'How many bits are in a byte?', options: ['4', '8', '16', '32'], correct: '8', explanation: 'One byte consists of 8 bits of data.', difficulty: 'easy' },
      { id: 3, question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High-Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correct: 'Hyper Text Markup Language', explanation: 'HTML stands for Hyper Text Markup Language, used for creating web pages.', difficulty: 'easy' },
      { id: 4, question: 'What does RAM stand for?', options: ['Random Access Memory', 'Read-Only Access Module', 'Rapid Application Module', 'Run-At-Memory'], correct: 'Random Access Memory', explanation: 'RAM stands for Random Access Memory, a type of computer memory.', difficulty: 'easy' },
      { id: 5, question: 'What does GPU stand for?', options: ['Graphics Presentation Unit', 'Graphics Processing Unit', 'General Purpose Unit', 'Global Processing Unit'], correct: 'Graphics Processing Unit', explanation: 'GPU stands for Graphics Processing Unit, responsible for rendering graphics.', difficulty: 'medium' },
      { id: 6, question: 'What does SQL stand for?', options: ['Strong Query Language', 'Structured Query Language', 'System Query Language', 'Simple Query Language'], correct: 'Structured Query Language', explanation: 'SQL stands for Structured Query Language, used for managing databases.', difficulty: 'medium' },
      { id: 7, question: 'What is the smallest unit of data a computer can process?', options: ['Byte', 'Bit', 'Kilobyte', 'Megabyte'], correct: 'Bit', explanation: 'A bit (binary digit) is the smallest unit of data in computing, representing 0 or 1.', difficulty: 'easy' },
      { id: 8, question: 'How many gigabytes are in a terabyte?', options: ['100', '512', '1000', '1024'], correct: '1024', explanation: '1 terabyte equals 1024 gigabytes in binary storage measurement.', difficulty: 'medium' },
      { id: 9, question: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Programming Input', 'Application Process Interface', 'Advanced Process Input'], correct: 'Application Programming Interface', explanation: 'API stands for Application Programming Interface, allowing software to communicate.', difficulty: 'medium' },
      { id: 10, question: 'What is the main function of an operating system?', options: ['Store files', 'Run applications', 'Manage hardware and software resources', 'Connect to internet'], correct: 'Manage hardware and software resources', explanation: 'An operating system manages hardware and software resources and enables applications to run.', difficulty: 'easy' },
    ],
  };

  try {
    // Map frontend category names to database keys
    const categoryMapping = {
      'General Knowledge': 'General knowledge',
      'General knowledge': 'General knowledge',
      'Science & Nature': 'Science',
      'Science': 'Science',
      'Science: Computers': 'Computers',
      'Computers': 'Computers',
      'Science: Mathematics': 'Mathematics',
      'Mathematics': 'Mathematics',
      'Geography': 'Geography',
      'History': 'History',
      'Politics': 'General knowledge', // fallback
      'Sports': 'Sports',
      'Art': 'General knowledge', // fallback
      'Books': 'Books',
      'Film': 'Film',
      'Music': 'General knowledge', // fallback
      'Television': 'Film', // fallback to Film
      'Video Games': 'Video Games',
      'Animals': 'Science', // fallback to Science
    };
    
    // Get the mapped topic or use the mapping, or fall back to the topic itself
    let mappedTopic = categoryMapping[topic];
    if (!mappedTopic) {
      // Try case-insensitive matching
      mappedTopic = Object.keys(categoryMapping).find(k => k.toLowerCase() === topic.toLowerCase());
      if (mappedTopic) {
        mappedTopic = categoryMapping[mappedTopic];
      } else {
        mappedTopic = 'General knowledge';
      }
    }
    
    const templateQuestions = quizDatabase[mappedTopic] || quizDatabase['General knowledge'];
    console.log(`Topic: "${topic}" -> Mapped to: "${mappedTopic}", Found ${templateQuestions.length} questions`);
    
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

    console.log(`Returning ${selected.length} questions for topic: ${topic} (mapped to: ${mappedTopic})`);
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
