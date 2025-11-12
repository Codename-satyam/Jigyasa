
const OPEN_TRIVIA_BASE = "https://opentdb.com";

function decodeHTMLEntities(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

function shuffle(arr) {
  return arr
    .map((v) => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.v);
}

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
  try {
    const resp = await fetch(`${OPEN_TRIVIA_BASE}/api_category.php`);
    const data = await resp.json();
    return data.trivia_categories || [];
  } catch (e) {
    return [];
  }
}

export async function fetchQuiz(options = {}) {
  const { amount = 5, category = null, difficulty = null, type = 'multiple' } = options;
  const params = new URLSearchParams();
  params.set('amount', String(amount));
  if (category) params.set('category', String(category));
  if (difficulty) params.set('difficulty', difficulty);
  if (type) params.set('type', type);
  params.set('encode', 'url3986');

  try {
    const resp = await fetch(`${OPEN_TRIVIA_BASE}/api.php?${params.toString()}`);
    const json = await resp.json();
    if (!json || json.response_code !== 0 || !Array.isArray(json.results) || json.results.length === 0) {
      return localFallback.map((q) => ({
        question: q.question,
        correct_answer: q.correct_answer,
        options: shuffle([q.correct_answer, ...q.incorrect_answers]),
      }));
    }

    return json.results.map((r) => {
      const question = decodeHTMLEntities(r.question);
      const correct = decodeHTMLEntities(r.correct_answer);
      const incorrect = (r.incorrect_answers || []).map((s) => decodeHTMLEntities(s));
      const optionsArr = shuffle([correct, ...incorrect]);
      return {
        question,
        correct_answer: correct,
        options: optionsArr,
      };
    });
  } catch (err) {
    return localFallback.map((q) => ({
      question: q.question,
      correct_answer: q.correct_answer,
      options: shuffle([q.correct_answer, ...q.incorrect_answers]),
    }));
  }
}

const quizApi = { fetchQuiz, fetchCategories };

export default quizApi;
