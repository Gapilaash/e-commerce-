const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();
router.use(auth);

async function buildCartResponse(cart) {
  if (!cart || cart.items.length === 0) return { items: [], total: 0 };

  const productIds = cart.items.map(i => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  const items = cart.items
    .map(i => {
      const product = productMap.get(i.productId.toString());
      if (!product) return null;
      return {
        productId: product._id.toString(),
        name: product.name,
        image: product.image,
        price: product.price,
        qty: i.qty
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, total };
}

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load cart' });
  }
});

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existing = cart.items.find(i => i.productId.toString() === productId);
    if (existing) existing.qty += qty;
    else cart.items.push({ productId, qty });

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

// PUT /api/cart/update
router.put('/update', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (qty <= 0) {
      cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    } else {
      item.qty = qty;
    }

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart' });
  }
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

// DELETE /api/cart/clear
router.delete('/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

module.exports = router;
