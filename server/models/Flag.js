const FirestoreModel = require('../storage/firestoreModel');

class Flag extends FirestoreModel {
  static collectionName = 'flags';

  constructor(data = {}) {
    super({
      severity: 'medium',
      status: 'open',
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  static populateMap = {
    userId: './User',
    quizId: './Quiz',
    gameId: './Game',
    reviewedBy: './User',
  };
}

module.exports = Flag;
