const mongoose = require('mongoose');

// Set NODE_ENV to test if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Setup MongoDB connection for tests
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db';
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
