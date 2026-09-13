const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('SUCCESS! Connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.log('FAILED! Error:', err.message);
    process.exit(1);
  });