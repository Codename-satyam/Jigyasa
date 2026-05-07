const bcrypt = require('bcryptjs');
const FirestoreModel = require('../storage/firestoreModel');

class User extends FirestoreModel {
  static collectionName = 'users';

  constructor(data = {}) {
    super({
      role: 'student',
      avatarId: 1,
      blocked: false,
      approved: false,
      createdAt: new Date().toISOString(),
      ...data,
    });
  }

  async beforeSave() {
    if (!this.password) return;
    if (String(this.password).startsWith('$2a$') || String(this.password).startsWith('$2b$')) return;
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

module.exports = User;
