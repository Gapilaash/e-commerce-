const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const router = express.Router();
router.use(auth);

function defaultTracking() {
  return [
    { key: 'placed', label: 'Order placed', completed: true, current: false },
    { key: 'processing', label: 'Processing', completed: true, current: true },
    { key: 'shipped', label: 'Shipped', completed: false, current: false },
    { key: 'delivered', label: 'Delivered', completed: false, current: false }
  ];
}

// Simulates order progress over time, purely for demo purposes (no real
// courier integration exists). Computed fresh on every read from
// `createdAt`, so it's always correct even after a server restart — no
// cron job or background timer needed.
//   0–1 min after placing  -> Processing
//   1–2 min after placing  -> Shipped
//   2+ min after placing   -> Delivered
const STAGE_ORDER = ['placed', 'processing', 'shipped', 'delivered'];
const STAGE_LABELS = { placed: 'Order placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };

function withLiveTracking(orderDoc) {
  const order = typeof orderDoc.toJSON === 'function' ? orderDoc.toJSON() : orderDoc;
  const ageMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  let status = 'processing';
  if (ageMinutes >= 2) status = 'delivered';
  else if (ageMinutes >= 1) status = 'shipped';

  const currentIndex = STAGE_ORDER.indexOf(status);
  const tracking = STAGE_ORDER.map((key, idx) => ({
    key,
    label: STAGE_LABELS[key],
    completed: idx <= currentIndex,
    current: idx === currentIndex
  }));

  return { ...order, status, tracking };
}

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders.map(withLiveTracking));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

// POST /api/orders/create
router.post('/create', async (req, res) => {
  try {
    const { address, couponCode, paymentMethod, card, paymentIntentId } = req.body;

    if (!address || !address.line1) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const productIds = cart.items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // If the DB was re-seeded after items were added to the cart, some
    // cart items may point at product IDs that no longer exist. Filter
    // those out instead of crashing, and tell the user clearly.
    const staleItems = cart.items.filter(i => !productMap.has(i.productId.toString()));
    const validCartItems = cart.items.filter(i => productMap.has(i.productId.toString()));

    if (validCartItems.length === 0) {
      return res.status(400).json({
        message: 'The items in your cart are no longer available (catalog was updated). Please clear your cart and add products again.'
      });
    }

    const items = validCartItems.map(i => {
      const product = productMap.get(i.productId.toString());
      return {
        productId: i.productId,
        name: product.name,
        price: product.price,
        qty: i.qty
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    let discountAmount = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && subtotal >= coupon.minSubtotal) {
        discountAmount = Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100;
        appliedCouponCode = coupon.code;
      }
    }

    const totalAmount = Math.round((subtotal - discountAmount) * 100) / 100;

    // Very simple payment simulation:
    // - 'dummy-card': always succeeds unless card number ends in a test-failure digit
    // - 'stripe': trusted since the client already confirmed the PaymentIntent
    let paymentStatus = 'success';
    if (paymentMethod === 'dummy-card') {
      const cardNumber = card?.cardNumber?.replace(/\s/g, '') || '';
      if (cardNumber.endsWith('0000')) paymentStatus = 'failed';
    } else if (paymentMethod === 'stripe' && !paymentIntentId) {
      paymentStatus = 'failed';
    }

    if (paymentStatus === 'failed') {
      return res.status(402).json({ message: 'Payment failed. Try a different card.' });
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      address,
      subtotal,
      discountAmount,
      couponCode: appliedCouponCode,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: 'processing',
      tracking: defaultTracking()
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ order: withLiveTracking(order) });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: `Failed to create order: ${err.message}` });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(withLiveTracking(order));
  } catch (err) {
    res.status(500).json({ message: 'Failed to load order' });
  }
});

// POST /api/orders/:orderId/return
router.post('/:orderId/return', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.paymentStatus !== 'success' || order.returnStatus) {
      return res.status(400).json({ message: 'This order is not eligible for a return' });
    }

    order.returnStatus = 'requested';
    order.returnReason = reason;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit return request' });
  }
});

module.exports = router;
