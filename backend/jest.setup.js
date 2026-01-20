const mongoose = require('mongoose');

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
