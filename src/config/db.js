const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/samy_desserts';

  try {
    // Attempt connecting to the configured MONGO_URI
    console.log(`[Database] Attempting connection to MongoDB: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback if local mongod is not started
    });
    console.log(`[Database] Connected to MongoDB successfully at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to external MongoDB: ${err.message}`);
    console.log(`[Database] Initializing in-memory MongoDB server for development...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to in-memory MongoDB instance: ${memUri}`);
      console.log(`[Database] You can set MONGO_URI in .env to connect to MongoDB Atlas or local daemon anytime.`);
    } catch (memErr) {
      console.error(`[Database] Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
