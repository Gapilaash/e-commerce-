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

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await cleanupStaleIndexes();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
