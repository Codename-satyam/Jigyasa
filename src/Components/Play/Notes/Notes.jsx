import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaStickyNote,
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaChevronDown,
  FaChevronUp,
  FaRocket,
  FaFlask,
  FaCalculator,
  FaGlobeAmericas,
  FaBook,
  FaPuzzlePiece,
  FaLightbulb,
  FaArrowLeft,
} from "react-icons/fa";
import "./Notes.css";

/* ─── subject metadata ─── */
const subjects = [
  { id: "maths",            label: "Maths Magic",        icon: <FaCalculator />,     tone: "mint"  },
  { id: "science",          label: "Science Lab",         icon: <FaFlask />,          tone: "coral" },
  { id: "english",          label: "English Corner",      icon: <FaBook />,           tone: "berry" },
  { id: "socialScience",    label: "Social Science",      icon: <FaGlobeAmericas />,  tone: "sky"   },
  { id: "generalKnowledge", label: "General Knowledge",   icon: <FaLightbulb />,      tone: "sun"   },
  { id: "funActivities",    label: "Fun Activities",      icon: <FaPuzzlePiece />,    tone: "lime"  },
];

/* ─── notes data organised by subject ─── */
const notesData = {
  maths: [
    {
      title: "Addition & Subtraction",
      summary: "Master the building blocks of all mathematics.",
      points: [
        "Addition means putting numbers together — 3 + 4 = 7.",
        "Subtraction means taking away — 9 − 5 = 4.",
        "Use a number line to hop forward (add) or backward (subtract).",
        "Always start from the ones place when working with bigger numbers.",
        "Carrying and borrowing help with multi-digit problems.",
      ],
      tip: "Practice with everyday objects — count apples, toys, or steps!",
      tags: ["numbers", "basics", "warm-up"],
    },
    {
      title: "Multiplication Tables",
      summary: "Quick-recall times tables from 2 to 12.",
      points: [
        "Multiplication is repeated addition — 4 × 3 means 4 + 4 + 4.",
        "The 2× table always gives even numbers.",
        "The 5× table ends in 0 or 5 every time.",
        "9× trick: digits of the answer always add up to 9 (e.g. 9 × 4 = 36, and 3 + 6 = 9).",
        "Order doesn't matter — 3 × 7 = 7 × 3 = 21.",
      ],
      tip: "Chant tables aloud or turn them into a song for faster recall.",
      tags: ["tables", "patterns", "shortcuts"],
    },
    {
      title: "Division Basics",
      summary: "Learn how to share and split numbers equally.",
      points: [
        "Division is splitting into equal groups — 12 ÷ 3 = 4.",
        "It's the opposite of multiplication.",
        "Remainders happen when a number can't be split equally.",
        "Long division follows: Divide → Multiply → Subtract → Bring down.",
        "Any number divided by 1 is itself; divided by itself is 1.",
      ],
      tip: "Think of sharing sweets equally among friends to visualise it.",
      tags: ["division", "basics"],
    },
    {
      title: "Fractions Made Easy",
      summary: "Understand parts of a whole.",
      points: [
        "A fraction has a numerator (top) and denominator (bottom).",
        "½ means 1 out of 2 equal parts.",
        "Equivalent fractions look different but are equal — ½ = 2/4 = 3/6.",
        "To add fractions, make sure the denominators are the same first.",
        "A fraction where the numerator equals the denominator equals 1.",
      ],
      tip: "Cut a pizza or cake into slices to see fractions in action.",
      tags: ["fractions", "parts"],
    },
    {
      title: "Shapes & Geometry",
      summary: "Explore 2D and 3D shapes around you.",
      points: [
        "2D shapes are flat — circle, square, triangle, rectangle.",
        "3D shapes have depth — cube, sphere, cylinder, cone.",
        "A triangle has 3 sides; a square has 4 equal sides.",
        "Perimeter = total distance around a shape.",
        "Area = amount of space inside a flat shape.",
      ],
      tip: "Go on a shape hunt around your house — spot spheres, cylinders, and cubes.",
      tags: ["geometry", "shapes"],
    },
    {
      title: "Place Value",
      summary: "Understand what each digit in a number represents.",
      points: [
        "In 372: 3 is hundreds, 7 is tens, 2 is ones.",
        "Moving one place left means ×10; one place right means ÷10.",
        "Zero acts as a placeholder — 305 is NOT the same as 35.",
        "Expanded form: 482 = 400 + 80 + 2.",
        "Knowing place value helps with rounding and estimation.",
      ],
      tip: "Use blocks of 100s, 10s, and 1s to build numbers hands-on.",
      tags: ["numbers", "basics"],
    },
  ],

  science: [
    {
      title: "The Water Cycle",
      summary: "How water moves between Earth and the sky.",
      points: [
        "Evaporation — sun heats water in rivers/oceans, turning it into vapour.",
        "Condensation — vapour cools in the atmosphere and forms clouds.",
        "Precipitation — water falls back as rain, snow, or hail.",
        "Collection — water gathers in rivers, lakes, and underground.",
        "The cycle repeats endlessly, recycling the same water over and over.",
      ],
      tip: "Place a glass of water in the sun and cover it — watch condensation happen!",
      tags: ["water", "cycle", "earth"],
    },
    {
      title: "States of Matter",
      summary: "Solid, liquid, and gas — and how they change.",
      points: [
        "Solid: fixed shape, particles packed tightly (e.g. ice).",
        "Liquid: takes the shape of its container, particles flow (e.g. water).",
        "Gas: fills all available space, particles move freely (e.g. steam).",
        "Melting: solid → liquid. Freezing: liquid → solid.",
        "Boiling: liquid → gas. Condensation: gas → liquid.",
      ],
      tip: "Experiment: melt an ice cube and then boil the water to see all three states.",
      tags: ["matter", "experiments"],
    },
    {
      title: "Plants & Photosynthesis",
      summary: "How plants make their own food using sunlight.",
      points: [
        "Plants need sunlight, water, and carbon dioxide to photosynthesise.",
        "Chlorophyll in leaves captures sunlight — it makes them green.",
        "Plants release oxygen as a by-product — we need it to breathe!",
        "Roots absorb water; leaves absorb CO₂ through tiny pores (stomata).",
        "The food (glucose) made is used for growth and energy.",
      ],
      tip: "Cover part of a leaf with tape for a few days, then test for starch to prove photosynthesis.",
      tags: ["plants", "biology", "photosynthesis"],
    },
    {
      title: "Human Body Systems",
      summary: "The amazing systems that keep you alive and moving.",
      points: [
        "Skeletal system: 206 bones give your body shape and protection.",
        "Muscular system: muscles pull on bones to create movement.",
        "Digestive system: breaks food into nutrients for energy.",
        "Respiratory system: lungs take in oxygen and release CO₂.",
        "Circulatory system: the heart pumps blood to every cell.",
      ],
      tip: "Feel your pulse at your wrist — each beat is your heart pushing blood through your body.",
      tags: ["body", "biology", "systems"],
    },
    {
      title: "Force & Motion",
      summary: "Pushes, pulls, and why things move.",
      points: [
        "A force is a push or pull that can start, stop, or change motion.",
        "Gravity pulls everything toward the centre of the Earth.",
        "Friction slows things down — rough surfaces create more friction.",
        "Newton's 1st Law: an object stays still or keeps moving unless a force acts on it.",
        "Heavier objects need more force to move than lighter ones.",
      ],
      tip: "Roll a ball on carpet vs. tile to feel the difference friction makes.",
      tags: ["physics", "force", "motion"],
    },
    {
      title: "Solar System",
      summary: "Our sun, the planets, and what lies beyond.",
      points: [
        "The Sun is a star at the centre; 8 planets orbit it.",
        "Order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.",
        "Earth is the only known planet with liquid water and life.",
        "Jupiter is the largest planet; Mercury is the smallest.",
        "The asteroid belt sits between Mars and Jupiter.",
      ],
      tip: "Remember the order: My Very Educated Mother Just Served Us Nachos.",
      tags: ["space", "planets", "solar"],
    },
  ],

  english: [
    {
      title: "Parts of Speech",
      summary: "The eight building blocks of every sentence.",
      points: [
        "Noun — a person, place, thing, or idea (dog, London, happiness).",
        "Verb — an action or state (run, is, think).",
        "Adjective — describes a noun (tall, red, clever).",
        "Adverb — describes a verb, adjective, or adverb (quickly, very).",
        "Pronoun — replaces a noun (he, she, they, it).",
        "Preposition — shows position or time (in, on, under, before).",
        "Conjunction — joins words or sentences (and, but, or).",
        "Interjection — expresses emotion (Wow! Ouch!).",
      ],
      tip: "Highlight parts of speech in different colours when reading a paragraph.",
      tags: ["grammar", "basics"],
    },
    {
      title: "Sentence Formation",
      summary: "How to build clear, correct sentences.",
      points: [
        "A sentence needs a subject (who/what) and a predicate (what happens).",
        "Start with a capital letter; end with a full stop, question mark, or exclamation mark.",
        "Simple sentence: one complete thought — 'The cat sat on the mat.'",
        "Compound sentence: two ideas joined by a conjunction — 'I ran, and she walked.'",
        "Keep sentences short and clear for better understanding.",
      ],
      tip: "Read your sentence aloud — if it sounds complete, it probably is!",
      tags: ["grammar", "sentences"],
    },
    {
      title: "Tenses",
      summary: "Past, present, and future — when things happen.",
      points: [
        "Present tense: happening now — 'She reads a book.'",
        "Past tense: already happened — 'She read a book.'",
        "Future tense: will happen — 'She will read a book.'",
        "Continuous tenses show ongoing actions — 'She is reading.'",
        "Always match the tense throughout a paragraph.",
      ],
      tip: "Write three sentences about your day using past, present, and future tense.",
      tags: ["grammar", "tenses"],
    },
    {
      title: "Opposites & Synonyms",
      summary: "Words that mean different things and words that mean the same.",
      points: [
        "Opposites (antonyms): hot ↔ cold, big ↔ small, happy ↔ sad.",
        "Synonyms: big = large = huge; happy = joyful = glad.",
        "Using synonyms makes your writing more interesting.",
        "Prefixes can create opposites: happy → unhappy, possible → impossible.",
        "A thesaurus is the best tool for finding synonyms.",
      ],
      tip: "Learn 3 new opposite pairs every week and use them in sentences.",
      tags: ["vocabulary", "words"],
    },
    {
      title: "Story Writing",
      summary: "How to craft a great short story.",
      points: [
        "Every story needs a beginning, middle, and end.",
        "Characters: who is the story about? Make them interesting.",
        "Setting: where and when does the story happen?",
        "Problem/conflict: the challenge the character faces.",
        "Resolution: how the problem gets solved.",
      ],
      tip: "Draw a story arc on paper before you start writing — it keeps you on track.",
      tags: ["writing", "stories", "creative"],
    },
    {
      title: "Phonics & Spelling",
      summary: "Sound out words and spell them confidently.",
      points: [
        "Vowels: a, e, i, o, u. Everything else is a consonant.",
        "Blend sounds together: c-a-t → cat, s-t-o-p → stop.",
        "Silent letters: know (k is silent), write (w is silent).",
        "Common patterns: -tion = 'shun', -ight = 'ite'.",
        "Break big words into syllables to spell: in-for-ma-tion.",
      ],
      tip: "Read aloud every day for 10 minutes — it strengthens phonics naturally.",
      tags: ["phonics", "spelling"],
    },
  ],

  socialScience: [
    {
      title: "Continents & Oceans",
      summary: "The 7 continents and 5 oceans of our world.",
      points: [
        "Continents: Asia, Africa, North America, South America, Antarctica, Europe, Australia.",
        "Oceans: Pacific, Atlantic, Indian, Southern (Antarctic), Arctic.",
        "Asia is the largest continent; Australia is the smallest.",
        "The Pacific Ocean is the biggest and deepest ocean.",
        "All continents were once joined as one supercontinent called Pangaea.",
      ],
      tip: "Trace each continent on a blank world map and label the oceans.",
      tags: ["geography", "world"],
    },
    {
      title: "Map Reading",
      summary: "How to read and understand maps like a pro.",
      points: [
        "A compass rose shows North, South, East, and West.",
        "The legend/key explains symbols used on the map.",
        "Scale tells you how map distance relates to real distance.",
        "Latitude lines run east-west; longitude lines run north-south.",
        "Political maps show borders; physical maps show terrain.",
      ],
      tip: "Use a real map to find your city, nearby rivers, and neighbouring states.",
      tags: ["maps", "geography"],
    },
    {
      title: "Types of Government",
      summary: "How people organise rules and leadership.",
      points: [
        "Democracy — people vote to choose their leaders.",
        "Monarchy — a king or queen rules, usually by birth.",
        "Republic — elected representatives make decisions.",
        "Dictatorship — one person holds almost all power.",
        "India is a democratic republic with a President and Prime Minister.",
      ],
      tip: "Think about your class — electing a class monitor is a tiny democracy!",
      tags: ["civics", "government"],
    },
    {
      title: "Indian States & Capitals",
      summary: "Know the geography of India.",
      points: [
        "India has 28 states and 8 union territories.",
        "New Delhi is the national capital.",
        "Rajasthan is the largest state by area; Goa is the smallest.",
        "Uttar Pradesh has the highest population.",
        "Each state has its own capital, language, and culture.",
      ],
      tip: "Place a blank India map on your wall and fill in states one by one.",
      tags: ["india", "states", "geography"],
    },
    {
      title: "Natural Resources",
      summary: "Gifts from nature that we use every day.",
      points: [
        "Renewable resources: sunlight, wind, water — they renew naturally.",
        "Non-renewable resources: coal, oil, natural gas — they take millions of years to form.",
        "Forests give us wood, oxygen, and medicines.",
        "Water is essential — only about 3% of Earth's water is fresh.",
        "Conservation means using resources wisely so they last.",
      ],
      tip: "Start small: save electricity at home and plant a tree this month.",
      tags: ["resources", "environment"],
    },
  ],

  generalKnowledge: [
    {
      title: "Countries & Flags",
      summary: "Explore the colourful flags of the world.",
      points: [
        "India's flag: saffron (courage), white (truth), green (fertility) + Ashoka Chakra.",
        "Japan's flag is simple — a red circle on a white background.",
        "Nepal is the only country with a non-rectangular flag.",
        "The USA flag has 50 stars (states) and 13 stripes (original colonies).",
        "Olympic rings represent 5 continents: blue, yellow, black, green, red.",
      ],
      tip: "Pick one new country each day and draw its flag from memory.",
      tags: ["flags", "countries", "world"],
    },
    {
      title: "Wonders of the World",
      summary: "The most amazing structures and natural marvels.",
      points: [
        "7 New Wonders: Great Wall of China, Petra, Colosseum, Chichén Itzá, Machu Picchu, Taj Mahal, Christ the Redeemer.",
        "The Great Pyramid of Giza is the only surviving Ancient Wonder.",
        "The Taj Mahal was built by Emperor Shah Jahan in memory of his wife.",
        "Natural wonders include the Grand Canyon, Great Barrier Reef, and Northern Lights.",
        "These wonders showcase human ingenuity and nature's power.",
      ],
      tip: "Create a scrapbook of wonders with pictures and fun facts.",
      tags: ["wonders", "landmarks"],
    },
    {
      title: "Famous Personalities",
      summary: "People who changed the world.",
      points: [
        "Mahatma Gandhi: led India's non-violent freedom movement.",
        "Albert Einstein: explained relativity and changed physics.",
        "Marie Curie: first woman to win a Nobel Prize, discovered radioactivity.",
        "APJ Abdul Kalam: India's 'Missile Man' and beloved President.",
        "Malala Yousafzai: youngest Nobel laureate, champion of girls' education.",
      ],
      tip: "Read a short biography of one personality every month.",
      tags: ["people", "history", "inspiration"],
    },
    {
      title: "National Symbols of India",
      summary: "The symbols that represent our nation.",
      points: [
        "National bird: Peacock 🦚. National animal: Bengal Tiger 🐯.",
        "National flower: Lotus. National tree: Banyan.",
        "National emblem: Ashoka's Lion Capital (Satyameva Jayate).",
        "National anthem: 'Jana Gana Mana' (written by Rabindranath Tagore).",
        "National currency: Indian Rupee (₹).",
      ],
      tip: "Spot national symbols on coins, stamps, and government buildings.",
      tags: ["india", "symbols", "national"],
    },
    {
      title: "Amazing Facts",
      summary: "Blow-your-mind trivia that makes learning fun.",
      points: [
        "Honey never spoils — archaeologists found 3,000-year-old edible honey in Egyptian tombs.",
        "Octopuses have three hearts and blue blood.",
        "A group of flamingos is called a 'flamboyance'.",
        "Lightning is about 5 times hotter than the surface of the sun.",
        "Bananas are technically berries, but strawberries are not!",
      ],
      tip: "Share one amazing fact with a friend every day to stay curious.",
      tags: ["facts", "trivia", "fun"],
    },
  ],

  funActivities: [
    {
      title: "Brain Teasers & Riddles",
      summary: "Train your brain with clever puzzles.",
      points: [
        "What has hands but can't clap? → A clock.",
        "I have keys but no locks. What am I? → A piano.",
        "The more you take, the more you leave behind. → Footsteps.",
        "Riddles improve lateral thinking and vocabulary.",
        "Try creating your own riddles using everyday objects.",
      ],
      tip: "Start a riddle journal — write one riddle a day and share with friends.",
      tags: ["riddles", "brain", "fun"],
    },
    {
      title: "Easy Origami",
      summary: "Turn a flat sheet of paper into art.",
      points: [
        "All you need is a square piece of paper — no glue or scissors!",
        "Start simple: paper boats, planes, and jumping frogs.",
        "Valley folds go inward; mountain folds go outward.",
        "Crease firmly and fold accurately for the best results.",
        "Origami builds patience, focus, and spatial awareness.",
      ],
      tip: "Follow one origami tutorial a week and display your creations.",
      tags: ["crafts", "paper", "art"],
    },
    {
      title: "Colours & Painting",
      summary: "Explore the colour wheel and unleash your creativity.",
      points: [
        "Primary colours: red, blue, yellow — they can't be made by mixing.",
        "Secondary colours: mix two primaries — red + blue = purple.",
        "Warm colours (red, orange, yellow) feel energetic; cool colours (blue, green, purple) feel calm.",
        "Watercolours are great for beginners — just add water!",
        "Don't worry about perfection, art is about expression.",
      ],
      tip: "Paint a colour wheel and hang it above your study desk for inspiration.",
      tags: ["art", "colours", "creative"],
    },
    {
      title: "Kids Yoga & Mindfulness",
      summary: "Stretches and calm breathing to start or end your day.",
      points: [
        "Tree Pose: stand on one foot and balance like a tree.",
        "Cat-Cow: on all fours, arch your back up (cat) then dip it down (cow).",
        "Deep breathing: inhale for 4 counts, hold for 4, exhale for 4.",
        "Yoga improves focus and reduces stress before study time.",
        "Even 5 minutes of stretching helps your body and brain.",
      ],
      tip: "Do 5 minutes of yoga before homework — you'll concentrate better!",
      tags: ["yoga", "mindfulness", "health"],
    },
    {
      title: "Memory Boosting Games",
      summary: "Fun ways to sharpen your memory muscle.",
      points: [
        "Kim's Game: look at 10 objects for 30 seconds, cover them, recall as many as you can.",
        "Story chain: each player adds one sentence to build a wild story — remember the whole thing!",
        "Card matching: lay cards face-down and find pairs.",
        "Visualising facts as pictures makes them easier to recall.",
        "Repeat new info three times within 24 hours to lock it in.",
      ],
      tip: "Play the memory card game on this very platform to practice!",
      tags: ["memory", "games", "brain"],
    },
  ],
};

/* ─── bookmark helpers (localStorage) ─── */
const BM_KEY = "jq_noted_bookmarks";

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BM_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookmarks(list) {
  localStorage.setItem(BM_KEY, JSON.stringify(list));
}

/* ─── component ─── */
function Notes() {
  const [activeSubject, setActiveSubject] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState({});
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  /* bookmark toggle */
  const toggleBookmark = useCallback((noteKey) => {
    setBookmarks((prev) => {
      const next = prev.includes(noteKey)
        ? prev.filter((k) => k !== noteKey)
        : [...prev, noteKey];
      saveBookmarks(next);
      return next;
    });
  }, []);

  /* expand / collapse toggle */
  const toggleExpand = useCallback((noteKey) => {
    setExpanded((prev) => ({ ...prev, [noteKey]: !prev[noteKey] }));
  }, []);

  /* filtered notes */
  const visibleNotes = useMemo(() => {
    const subjectIds = activeSubject ? [activeSubject] : subjects.map((s) => s.id);
    const trimmed = query.trim().toLowerCase();

    return subjectIds.flatMap((sid) =>
      (notesData[sid] || [])
        .map((note, idx) => ({ ...note, subject: sid, key: `${sid}-${idx}` }))
        .filter((note) => {
          if (!trimmed) return true;
          return (
            note.title.toLowerCase().includes(trimmed) ||
            note.summary.toLowerCase().includes(trimmed) ||
            note.tags.some((t) => t.includes(trimmed)) ||
            note.points.some((p) => p.toLowerCase().includes(trimmed))
          );
        })
    );
  }, [activeSubject, query]);

  /* stats */
  const totalNotes = Object.values(notesData).flat().length;
  const totalSubjects = subjects.length;

  const subjectOf = (id) => subjects.find((s) => s.id === id);

  return (
    <div className="nt-root">
      {/* decorative blobs */}
      <div className="nt-blob blob-1" />
      <div className="nt-blob blob-2" />
      <div className="nt-blob blob-3" />

      {/* hero */}
      <header className="nt-hero">
        <div className="nt-badge">
          <FaStickyNote /> Study Notes
        </div>
        <h1 className="nt-title">Notes Studio</h1>
        <p className="nt-sub">
          Bite-sized study notes for every subject. Read, bookmark, and revisit
          — your pocket revision companion.
        </p>

        <div className="nt-stats">
          <div className="nt-stat">
            <span className="nt-stat-val">{totalSubjects}</span>
            <span className="nt-stat-lbl">Subjects</span>
          </div>
          <div className="nt-stat">
            <span className="nt-stat-val">{totalNotes}</span>
            <span className="nt-stat-lbl">Notes</span>
          </div>
          <div className="nt-stat">
            <span className="nt-stat-val">{bookmarks.length}</span>
            <span className="nt-stat-lbl">Bookmarked</span>
          </div>
        </div>

        <div className="nt-hero-actions">
          <Link className="nt-btn secondary" to="/courses">
            <FaArrowLeft /> Back to Courses
          </Link>
        </div>
      </header>

      {/* subject pills */}
      <section className="nt-filters">
        <div className="nt-pills">
          <button
            className={`nt-pill ${!activeSubject ? "active" : ""}`}
            onClick={() => setActiveSubject(null)}
          >
            All Subjects
          </button>
          {subjects.map((s) => (
            <button
              key={s.id}
              className={`nt-pill tone-${s.tone} ${activeSubject === s.id ? "active" : ""}`}
              onClick={() => setActiveSubject(s.id === activeSubject ? null : s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <label className="nt-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search notes, topics, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </section>

      {/* notes grid */}
      <section className="nt-grid-wrap">
        {visibleNotes.length === 0 && (
          <div className="nt-empty">
            No notes match your search. Try a different keyword.
          </div>
        )}

        <div className="nt-grid">
          {visibleNotes.map((note) => {
            const meta = subjectOf(note.subject);
            const isOpen = expanded[note.key];
            const isBookmarked = bookmarks.includes(note.key);

            return (
              <article key={note.key} className={`nt-card tone-${meta?.tone}`}>
                <div className="nt-card-head">
                  <div className="nt-card-icon">{meta?.icon}</div>
                  <div className="nt-card-info">
                    <h3 className="nt-card-title">{note.title}</h3>
                    <span className="nt-card-subj">{meta?.label}</span>
                  </div>
                  <button
                    className={`nt-bm-btn ${isBookmarked ? "bookmarked" : ""}`}
                    onClick={() => toggleBookmark(note.key)}
                    aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                </div>

                <p className="nt-card-summary">{note.summary}</p>

                <div className="nt-card-tags">
                  {note.tags.map((t) => (
                    <span key={t} className="nt-tag">
                      {t}
                    </span>
                  ))}
                </div>

                {isOpen && (
                  <div className="nt-card-body">
                    <ul className="nt-points">
                      {note.points.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                    {note.tip && (
                      <div className="nt-tip">
                        <FaRocket className="nt-tip-icon" />
                        <span>
                          <strong>Tip:</strong> {note.tip}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="nt-expand-btn"
                  onClick={() => toggleExpand(note.key)}
                >
                  {isOpen ? (
                    <>
                      Collapse <FaChevronUp />
                    </>
                  ) : (
                    <>
                      Read Notes <FaChevronDown />
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* footer CTA */}
      <section className="nt-footer-cta">
        <div className="nt-cta-card">
          <div>
            <h3>Done reading?</h3>
            <p>Test what you learned with a quick quiz or a mini-game!</p>
          </div>
          <div className="nt-cta-actions">
            <Link className="nt-btn primary" to="/play/quiz-select">
              Take a Quiz
            </Link>
            <Link className="nt-btn outline" to="/games">
              Play a Game
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Notes;