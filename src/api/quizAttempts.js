import { apiCall } from './client.js';

// Save detailed quiz attempt with all questions and answers
export async function saveQuizAttempt(attemptData) {
  try {
    console.log('📝 [quizAttempts.js] Saving quiz attempt...');
    const response = await apiCall('/api/quiz-attempts', 'POST', attemptData);
    if (response.success) {
      console.log('✅ [quizAttempts.js] Quiz attempt saved:', response.attempt);
      return response.attempt;
    } else {
      throw new Error(response.error || 'Failed to save quiz attempt');
    }
  } catch (error) {
    console.error('❌ [quizAttempts.js] Error saving quiz attempt:', error);
    throw error;
  }
}

// Get user's quiz attempts (paginated)
export async function getQuizAttempts(limit = 10, offset = 0) {
  try {
    const response = await apiCall(`/api/quiz-attempts?limit=${limit}&offset=${offset}`, 'GET');
    if (response.success) {
      return response.attempts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return [];
  }
}

// Get specific quiz attempt with full details
export async function getQuizAttemptDetails(attemptId) {
  try {
    console.log(`📖 [quizAttempts.js] Fetching attempt details: ${attemptId}`);
    const response = await apiCall(`/api/quiz-attempts/${attemptId}`, 'GET');
    if (response.success) {
      return response.attempt;
    }
    throw new Error(response.error || 'Failed to fetch attempt details');
  } catch (error) {
    console.error('Error fetching attempt details:', error);
    throw error;
  }
}

// Get recent attempts summary
export async function getRecentAttempts(limit = 5) {
  try {
    const response = await apiCall(`/api/quiz-attempts/summary/recent?limit=${limit}`, 'GET');
    if (response.success) {
      return response.attempts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching recent attempts:', error);
    return [];
  }
}

// Get statistics for a specific quiz
export async function getQuizStats(quizTitle) {
  try {
    const encodedTitle = encodeURIComponent(quizTitle);
    const response = await apiCall(`/api/quiz-attempts/stats/${encodedTitle}`, 'GET');
    if (response.success) {
      return response.stats;
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return null;
  }
}

const quizAttempts = {
  saveQuizAttempt,
  getQuizAttempts,
  getQuizAttemptDetails,
  getRecentAttempts,
  getQuizStats,
};

export default quizAttempts;
