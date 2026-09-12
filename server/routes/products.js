const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products/categories  (must be before /:id)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

// GET /api/products/price-range  (must be before /:id)
router.get('/price-range', async (req, res) => {
  try {
    const [result] = await Product.aggregate([
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
    ]);
    res.json({ min: result ? Math.floor(result.min) : 0, max: result ? Math.ceil(result.max) : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load price range' });
  }
});

// GET /api/products  (list + filter + sort)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, minRating, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Product.find(filter);

    if (sort === 'low') query = query.sort({ price: 1 });
    else if (sort === 'high') query = query.sort({ price: -1 });
    else if (sort === 'medium') query = query.sort({ price: 1 }).collation({ locale: 'en' });

    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load products' });
  }
});

// GET /api/products/:id/similar  (must be before /:id)
router.get('/:id/similar', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const similar = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.json(similar);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load similar products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load product' });
  }
});

module.exports = router;
