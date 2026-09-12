const mongoose = require('mongoose');

// Serverless functions (Vercel) can reuse a "warm" instance between requests,
// so we cache the connection instead of reconnecting every time — and we
// never process.exit() here, since that would crash the whole function.
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log('MongoDB connected:', mongooseInstance.connection.host);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('MongoDB connection error:', err.message);
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;
