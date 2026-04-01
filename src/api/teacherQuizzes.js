import { apiCall } from './client';

function normalizeQuiz(quiz) {
  if (!quiz) return null;
  return {
    ...quiz,
    id: quiz._id || quiz.id,
    isPublished: Boolean(quiz.ispublished ?? quiz.isPublished),
  };
}

export async function createTeacherQuiz({ title, description, difficulty, questions }) {
  const topic = title?.trim() ? title.trim() : 'Custom Teacher Quiz';

  const response = await apiCall('/api/quizzes', 'POST', {
    title,
    description,
    topic,
    difficulty,
    type: 'mcq',
    questions,
  });

  if (!response.success || !response.quiz) {
    throw new Error(response.error || 'Failed to create quiz');
  }

  return normalizeQuiz(response.quiz);
}

export async function publishTeacherQuiz(quizId) {
  const response = await apiCall(`/api/quizzes/${quizId}/publish`, 'POST');
  if (!response.success || !response.quiz) {
    throw new Error(response.error || 'Failed to publish quiz');
  }
  return normalizeQuiz(response.quiz);
}

export async function getTeacherOwnedQuizzes(teacherId) {
  const response = await apiCall('/api/quizzes/all', 'GET');
  const quizzes = response.success && Array.isArray(response.quizzes) ? response.quizzes : [];

  return quizzes
    .filter((quiz) => {
      const ownerId = quiz?.createdBy?._id || quiz?.createdBy;
      return String(ownerId) === String(teacherId);
    })
    .map(normalizeQuiz);
}

export async function deleteTeacherQuiz(quizId) {
  const response = await apiCall(`/api/quizzes/${quizId}`, 'DELETE');
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete quiz');
  }
  return true;
}

export async function getPublishedTeacherQuizzes() {
  const response = await apiCall('/api/quizzes', 'GET');
  const quizzes = response.success && Array.isArray(response.quizzes) ? response.quizzes : [];
  return quizzes.map(normalizeQuiz);
}

export async function getTeacherQuizById(quizId) {
  const response = await apiCall(`/api/quizzes/${quizId}`, 'GET');
  if (!response.success || !response.quiz) {
    throw new Error(response.error || 'Quiz not found');
  }
  return normalizeQuiz(response.quiz);
}

const teacherQuizzes = {
  createTeacherQuiz,
  publishTeacherQuiz,
  getTeacherOwnedQuizzes,
  deleteTeacherQuiz,
  getPublishedTeacherQuizzes,
  getTeacherQuizById,
};

export default teacherQuizzes;
