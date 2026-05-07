const FirestoreModel = require('../storage/firestoreModel');

class Game extends FirestoreModel {
  static collectionName = 'games';

  constructor(data = {}) {
    super({
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  static populateMap = {
    userId: './User',
  };
}

module.exports = Game;
