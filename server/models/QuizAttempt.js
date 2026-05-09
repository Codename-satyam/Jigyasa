const FirestoreModel = require('../storage/firestoreModel');

class QuizAttempt extends FirestoreModel {
  static collectionName = 'quizAttempts';

  constructor(data = {}) {
    super({
      userId: null,
      quizTitle: null,
      quizId: null,
      category: null,
      difficulty: null,
      score: 0,
      totalQuestions: 0,
      percentage: 0,
      timeSpent: 0,
      attemptedAt: new Date().toISOString(),
      questions: [], // Array of { questionId, question, options, userAnswer, correctAnswer, isCorrect }
      ...data,
    });
  }

  static populateMap = {
    userId: './User',
    quizId: './Quiz',
  };
}

module.exports = QuizAttempt;
