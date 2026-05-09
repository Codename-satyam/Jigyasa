const FirestoreModel = require('../storage/firestoreModel');

class TeacherRequest extends FirestoreModel {
  static collectionName = 'teacherRequests';

  constructor(data = {}) {
    super({
      userId: null,
      email: null,
      name: null,
      status: 'pending', // 'pending', 'approved', 'rejected'
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      ...data,
    });
  }
}

module.exports = TeacherRequest;
