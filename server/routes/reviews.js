const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load reviews' });
  }
});

// POST /api/reviews/:productId
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = await Review.findOneAndUpdate(
      { productId, userId: req.user.id },
      {
        productId,
        userId: req.user.id,
        userName: req.user.name || req.user.email || 'Anonymous',
        rating,
        comment
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const allReviews = await Review.find({ productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Math.round(avgRating * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

module.exports = router;
