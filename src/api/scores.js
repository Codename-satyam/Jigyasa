import { apiCall } from './client';

export async function addScore(record) {
  try {
    const response = await apiCall('/api/scores', 'POST', record);
    if (response.success) {
      return response.score;
    } else {
      throw new Error(response.error || 'Failed to save score');
    }
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

export async function getScores() {
  try {
    const response = await apiCall('/api/scores', 'GET');
    return response.success ? response.scores : [];
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}

// Get scores with role-based filtering
export async function getScoresByRole(role, userId, userEmail) {
  try {
    const response = await apiCall('/api/scores', 'GET');
    const allScores = response.success ? response.scores : [];
    
    if (role === 'teacher') {
      // Teachers can see all scores
      return allScores;
    } else if (role === 'student') {
      // Students can only see their own scores
      return allScores.filter((s) => s.email === userEmail || s.userId === userId);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
}

// Get scores for a specific student (teacher view)
export async function getStudentScores(studentEmail) {
  try {
    const response = await apiCall(`/api/scores?email=${studentEmail}`, 'GET');
    const scores = response.success ? response.scores : [];
    return scores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching student scores:', error);
    return [];
  }
}

// Get all students' scores summary (for teacher dashboard)
export async function getAllStudentsScoresSummary() {
  try {
    const response = await apiCall('/api/scores', 'GET');
    const allScores = response.success ? response.scores : [];
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
      
      // Use percentage if available, otherwise calculate
      const percentage = score.percentage || 
        (score.totalQuestions > 0 ? Math.round((score.correctAnswers / score.totalQuestions) * 100) : 0) ||
        (score.total > 0 ? Math.round((score.score / score.total) * 100) : 0);
      
      studentMap[email].highestScore = Math.max(studentMap[email].highestScore, percentage);
    });
    
    // Calculate averages
    Object.keys(studentMap).forEach((email) => {
      const student = studentMap[email];
      if (student.scores.length > 0) {
        const totalPercent = student.scores.reduce((sum, s) => {
          const pct = s.percentage ||
            (s.totalQuestions > 0 ? (s.correctAnswers / s.totalQuestions) * 100 : 0) ||
            (s.total > 0 ? (s.score / s.total) * 100 : 0);
          return sum + pct;
        }, 0);
        student.averageScore = Math.round(totalPercent / student.scores.length);
      }
    });
    
    return Object.values(studentMap);
  } catch (error) {
    console.error('Error fetching scores summary:', error);
    return [];
  }
}

export async function getPublicLeaderboard() {
  try {
    const response = await apiCall('/api/scores/leaderboard/public/all', 'GET');
    return response.success ? response.leaderboard : [];
  } catch (error) {
    console.error('Error fetching public leaderboard:', error);
    return [];
  }
}

export async function clearScores() {
  try {
    const response = await apiCall('/api/scores', 'DELETE');
    return response.success;
  } catch (error) {
    console.error('Error clearing scores:', error);
    return false;
  }
}

const scores = { 
  addScore, 
  getScores, 
  getScoresByRole,
  getStudentScores,
  getAllStudentsScoresSummary,
  getPublicLeaderboard,
  clearScores 
};
export default scores;
