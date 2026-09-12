require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const ordersRoutes = require('./routes/orders');
const reviewsRoutes = require('./routes/reviews');
const couponsRoutes = require('./routes/coupons');
const paymentsRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const cleanupStaleIndexes = require('./utils/cleanupStaleIndexes');

const app = express();

app.use(cors());
app.use(express.json());

// Make sure MongoDB is connected before any route runs. On Vercel this
// reuses a cached connection on warm invocations instead of reconnecting.
let cleanupDone = false;
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!cleanupDone) {
      cleanupDone = true;
      await cleanupStaleIndexes();
    }
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Only start a local server when run directly (e.g. `node server.js` on
// your machine). On Vercel, this file is imported as a serverless function
// instead, so app.listen() never runs there.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
