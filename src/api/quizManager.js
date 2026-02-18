// Quiz Manager - handles quiz creation, assignment, and retrieval
const QUIZZES_KEY = 'qq_quizzes';
const QUIZ_ASSIGNMENTS_KEY = 'qq_quiz_assignments';

function loadQuizzes() {
  try {
    const raw = localStorage.getItem(QUIZZES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveQuizzes(quizzes) {
  localStorage.setItem(QUIZZES_KEY, JSON.stringify(quizzes));
}

function loadAssignments() {
  try {
    const raw = localStorage.getItem(QUIZ_ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAssignments(assignments) {
  localStorage.setItem(QUIZ_ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

// Create a new quiz (teacher only)
export function createQuiz({ title, description, questions, createdBy, createdByName, difficulty = 'medium' }) {
  const quizzes = loadQuizzes();
  const quiz = {
    id: Date.now(),
    title,
    description,
    questions, // Array of { id, question, options, correct, explanation }
    createdBy, // Teacher ID
    createdByName,
    difficulty,
    createdAt: new Date().toISOString(),
    isPublished: false,
    studentCount: 0
  };
  quizzes.push(quiz);
  saveQuizzes(quizzes);
  return quiz;
}

// Get all quizzes created by a teacher
export function getQuizzesByTeacher(teacherId) {
  const quizzes = loadQuizzes();
  return quizzes.filter((q) => q.createdBy === teacherId);
}

// Get all published quizzes
export function getAllPublishedQuizzes() {
  const quizzes = loadQuizzes();
  return quizzes.filter((q) => q.isPublished);
}

// Get a specific quiz by ID
export function getQuizById(quizId) {
  const quizzes = loadQuizzes();
  return quizzes.find((q) => q.id === quizId);
}

// Update quiz (teacher only)
export function updateQuiz(quizId, updates) {
  const quizzes = loadQuizzes();
  const index = quizzes.findIndex((q) => q.id === quizId);
  if (index !== -1) {
    quizzes[index] = { ...quizzes[index], ...updates };
    saveQuizzes(quizzes);
    return quizzes[index];
  }
  return null;
}

// Publish/Unpublish a quiz
export function publishQuiz(quizId, publish = true) {
  return updateQuiz(quizId, { isPublished: publish });
}

// Delete a quiz (teacher only)
export function deleteQuiz(quizId) {
  const quizzes = loadQuizzes();
  const filtered = quizzes.filter((q) => q.id !== quizId);
  saveQuizzes(filtered);
}

// Assign quiz to students
export function assignQuizToStudents(quizId, studentEmails, assignedBy) {
  const assignments = loadAssignments();
  studentEmails.forEach((email) => {
    assignments.push({
      id: Date.now() + Math.random(),
      quizId,
      studentEmail: email,
      assignedBy,
      assignedAt: new Date().toISOString(),
      completed: false,
      score: null
    });
  });
  saveAssignments(assignments);
}

// Get quizzes assigned to a student
export function getAssignedQuizzes(studentEmail) {
  const assignments = loadAssignments();
  const assignedQuizIds = assignments
    .filter((a) => a.studentEmail === studentEmail)
    .map((a) => a.quizId);
  
  const quizzes = loadQuizzes();
  return quizzes.filter((q) => assignedQuizIds.includes(q.id));
}

// Mark quiz as completed for a student
export function markQuizCompleted(quizId, studentEmail, score) {
  const assignments = loadAssignments();
  const assignment = assignments.find((a) => a.quizId === quizId && a.studentEmail === studentEmail);
  if (assignment) {
    assignment.completed = true;
    assignment.score = score;
    assignment.completedAt = new Date().toISOString();
    saveAssignments(assignments);
    return assignment;
  }
  return null;
}

// Get quiz response rate (for teacher)
export function getQuizResponseRate(quizId) {
  const assignments = loadAssignments();
  const quizAssignments = assignments.filter((a) => a.quizId === quizId);
  if (quizAssignments.length === 0) return 0;
  const completed = quizAssignments.filter((a) => a.completed).length;
  return {
    total: quizAssignments.length,
    completed,
    percentage: Math.round((completed / quizAssignments.length) * 100),
    students: quizAssignments
  };
}

const quizManager = {
  createQuiz,
  getQuizzesByTeacher,
  getAllPublishedQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
  assignQuizToStudents,
  getAssignedQuizzes,
  markQuizCompleted,
  getQuizResponseRate
};

export default quizManager;
