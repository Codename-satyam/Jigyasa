const SCORES_KEY = 'qq_scores';

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveScores(list) {
  localStorage.setItem(SCORES_KEY, JSON.stringify(list));
}

export function addScore(record) {
  const list = loadScores();
  list.push({ id: Date.now(), ...record });
  saveScores(list);
}

export function getScores() {
  return loadScores();
}

// Get scores with role-based filtering
export function getScoresByRole(role, userId, userEmail) {
  const allScores = loadScores();
  
  if (role === 'teacher') {
    // Teachers can see all scores
    return allScores;
  } else if (role === 'student') {
    // Students can only see their own scores
    return allScores.filter((s) => s.email === userEmail || s.userId === userId);
  }
  
  return [];
}

// Get scores for a specific student (teacher view)
export function getStudentScores(studentEmail) {
  const allScores = loadScores();
  return allScores
    .filter((s) => s.email === studentEmail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Get all students' scores summary (for teacher dashboard)
export function getAllStudentsScoresSummary() {
  const allScores = loadScores();
  const studentMap = {};
  
  allScores.forEach((score) => {
    const email = score.email;
    if (!studentMap[email]) {
      studentMap[email] = {
        email,
        name: score.name || 'Unknown',
        totalQuizzes: 0,
        averageScore: 0,
        highestScore: 0,
        scores: []
      };
    }
    studentMap[email].scores.push(score);
    studentMap[email].totalQuizzes += 1;
    const percentage = score.total > 0 ? (score.score / score.total) * 100 : 0;
    studentMap[email].highestScore = Math.max(studentMap[email].highestScore, percentage);
  });
  
  // Calculate averages
  Object.keys(studentMap).forEach((email) => {
    const student = studentMap[email];
    if (student.scores.length > 0) {
      const totalPercent = student.scores.reduce((sum, s) => {
        return sum + (s.total > 0 ? (s.score / s.total) * 100 : 0);
      }, 0);
      student.averageScore = Math.round(totalPercent / student.scores.length);
    }
  });
  
  return Object.values(studentMap);
}

export function clearScores() {
  saveScores([]);
}

const scores = { 
  addScore, 
  getScores, 
  getScoresByRole,
  getStudentScores,
  getAllStudentsScoresSummary,
  clearScores 
};
export default scores;
