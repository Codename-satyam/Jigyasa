const FirestoreModel = require('../storage/firestoreModel');

class Progress extends FirestoreModel {
  static collectionName = 'progress';

  constructor(data = {}) {
    super({
      topicIndex: 0,
      completedVideos: [],
      lastViewed: 0,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }
}

module.exports = Progress;
