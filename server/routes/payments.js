const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/create-intent
// Creates a Stripe PaymentIntent for the given amount (in dollars).
router.post('/create-intent', auth, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured on the server' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency: 'usd',
      metadata: { userId: req.user.id }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create payment intent' });
  }
});

module.exports = router;
