import { MongoClient, Db } from 'mongodb';

let db: Db;

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';
    
    console.log('Attempting to connect to MongoDB...');
    
    const client = await MongoClient.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    db = client.db();
    console.log('✅ MongoDB Connected Successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if your IP address is whitelisted in MongoDB Atlas (Network Access)');
    console.error('2. Verify your username and password in the .env file');
    console.error('3. Ensure your internet connection is working');
    console.error('4. Check if MongoDB Atlas cluster is running');
    process.exit(1);
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};
