require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('MONGO_URI environment variable:', process.env.MONGO_URI ? '✓ Present' : '✗ Missing');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('Error: MONGO_URI not set in .env');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');
console.log('Connection string (masked):', uri.replace(/:[^@]*@/, ':***@'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Try to list collections
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('Collections found:', collections.map(c => c.name));
    
    // Try to find users
    const User = require('./src/server/models/User');
    return User.find({});
  })
  .then((users) => {
    console.log('Users in database:', users.length);
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.email}) - Role: ${u.role}`);
    });
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    if (err.message.includes('authentication failed')) {
      console.error('Possible causes:');
      console.error('  - Incorrect MongoDB username or password');
      console.error('  - IP address not whitelisted in MongoDB Atlas');
      console.error('  - User does not have permission to access the database');
    }
    process.exit(1);
  });
