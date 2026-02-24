
const QUIZ_API_BASE = process.env.REACT_APP_QUIZ_API_BASE || "http://localhost:4000";

function shuffle(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.v);
}

const localCategories = [
  { id: 9, name: "General Knowledge" },
  { id: 17, name: "Science & Nature" },
  { id: 18, name: "Science: Computers" },
  { id: 19, name: "Science: Mathematics" },
  { id: 22, name: "Geography" },
  { id: 23, name: "History" },
  { id: 24, name: "Politics" },
  { id: 21, name: "Sports" },
  { id: 25, name: "Art" },
  { id: 10, name: "Books" },
  { id: 11, name: "Film" },
  { id: 12, name: "Music" },
  { id: 14, name: "Television" },
  { id: 15, name: "Video Games" },
  { id: 27, name: "Animals" },
];

const localFallback = [
  {
    question: "What color is the sky on a clear day?",
    correct_answer: "Blue",
    incorrect_answers: ["Green", "Red", "Yellow"],
  },
  {
    question: "How many legs does a dog have?",
    correct_answer: "4",
    incorrect_answers: ["2", "6", "8"],
  },
  {
    question: "Which animal says 'meow'?",
    correct_answer: "Cat",
    incorrect_answers: ["Dog", "Cow", "Sheep"],
  },
];

export async function fetchCategories() {
  return localCategories;
}

function normalizeQuizItem(item) {
  const question = (item?.question || "").toString().trim();
  const correct = (item?.correct || item?.correct_answer || "").toString().trim();
  let options = Array.isArray(item?.options) ? item.options.filter(Boolean).map((o) => String(o).trim()) : [];

  if (correct && !options.includes(correct)) {
    options.push(correct);
  }

  options = shuffle(options).slice(0, 4);

  if (!question || !correct || options.length < 2) {
    return null;
  }

  return {
    question,
    correct_answer: correct,
    options,
  };
}

export async function fetchQuiz(options = {}) {
  const { amount = 5, category = null, difficulty = "easy", type = "mcq" } = options;
  const categoryName = category
    ? (localCategories.find((c) => String(c.id) === String(category))?.name || String(category))
    : "General knowledge";

  const fallback = localFallback.map((q) => ({
    question: q.question,
    correct_answer: q.correct_answer,
    options: shuffle([q.correct_answer, ...q.incorrect_answers]),
  }));

  try {
    const resp = await fetch(`${QUIZ_API_BASE}/api/generate-quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: categoryName,
        count: amount,
        difficulty,
        type,
      }),
    });

    const json = await resp.json();
    if (!resp.ok || !json || !json.success || !Array.isArray(json.quiz)) {
      return fallback;
    }

    const normalized = json.quiz
      .map((item) => normalizeQuizItem(item))
      .filter(Boolean);

    return normalized.length > 0 ? normalized : fallback;
  } catch (err) {
    return fallback;
  }
}

const quizApi = { fetchQuiz, fetchCategories };

export default quizApi;
