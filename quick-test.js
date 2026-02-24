// Quick connection test
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ SUCCESS! MongoDB connected');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  });
