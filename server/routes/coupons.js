const express = require('express');
const auth = require('../middleware/auth');
const Coupon = require('../models/Coupon');

const router = express.Router();

// POST /api/coupons/validate
router.post('/validate', auth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    if (subtotal < coupon.minSubtotal) {
      return res.status(400).json({
        message: `Minimum order of $${coupon.minSubtotal.toFixed(2)} required for this coupon`
      });
    }

    const discount = Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100;
    const newTotal = Math.round((subtotal - discount) * 100) / 100;

    res.json({ code: coupon.code, discount, newTotal });
  } catch (err) {
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

module.exports = router;
