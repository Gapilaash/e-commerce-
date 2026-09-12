const express = require('express');
const auth = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

const router = express.Router();
router.use(auth);

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('productIds');
    res.json(wishlist ? wishlist.productIds : []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load wishlist' });
  }
});

// POST /api/wishlist/toggle/:productId
router.post('/toggle/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) wishlist = new Wishlist({ userId: req.user.id, productIds: [] });

    const idx = wishlist.productIds.findIndex(id => id.toString() === productId);
    let inWishlist;
    if (idx >= 0) {
      wishlist.productIds.splice(idx, 1);
      inWishlist = false;
    } else {
      wishlist.productIds.push(productId);
      inWishlist = true;
    }

    await wishlist.save();
    await wishlist.populate('productIds');
    res.json({ products: wishlist.productIds, inWishlist });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
});

module.exports = router;
