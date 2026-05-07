const admin = require('firebase-admin');

function normalizePrivateKey(value) {
  return String(value || '').replace(/\\n/g, '\n');
}

function hasFirebaseConfig() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

let db = null;

function getFirestore() {
  if (!hasFirebaseConfig()) {
    return null;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
  }

  if (!db) {
    db = admin.firestore();
  }

  return db;
}

function isFirebaseEnabled() {
  return Boolean(getFirestore());
}

module.exports = {
  getFirestore,
  hasFirebaseConfig,
  isFirebaseEnabled,
};
