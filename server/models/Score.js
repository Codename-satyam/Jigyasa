const FirestoreModel = require('../storage/firestoreModel');

class Score extends FirestoreModel {
  static collectionName = 'scores';

  constructor(data = {}) {
    super({
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  static populateMap = {
    userId: './User',
    quizId: './Quiz',
  };
}

module.exports = Score;
