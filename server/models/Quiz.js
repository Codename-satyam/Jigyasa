const FirestoreModel = require('../storage/firestoreModel');

class Quiz extends FirestoreModel {
  static collectionName = 'quizzes';

  constructor(data = {}) {
    super({
      questions: [],
      ispublished: false,
      createdAt: new Date().toISOString(),
      ...data,
    });
  }

  static populateMap = {
    createdBy: './User',
  };
}

module.exports = Quiz;
