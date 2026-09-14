const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// Extracts a rough "under X" price ceiling from free text, if present.
// Supports $, Rs., Rs, and ₹ as optional currency markers.
const PRICE_PATTERN = /(under|below)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:\.\d+)?)/i;

function extractMaxPrice(text) {
  const match = text.match(PRICE_PATTERN);
  return match ? Number(match[2]) : null;
}

// GET /api/ai/recommendations
// Simple "recommended for you" feed: top-rated products.
router.get('/recommendations', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load recommendations' });
  }
});

// POST /api/ai/chat
// Lightweight rule-based assistant: matches the message against product
// name/category/description and an optional "under $X" price filter.
// Swap this for a real LLM call (e.g. the Anthropic API) if desired.
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.json({ reply: "I didn't catch that — try asking about a product or category.", products: [] });
    }

    const maxPrice = extractMaxPrice(message);
    const cleaned = message.replace(PRICE_PATTERN, '').trim();

    const filter = {};
    if (cleaned) {
      filter.$or = [
        { name: { $regex: cleaned, $options: 'i' } },
        { category: { $regex: cleaned, $options: 'i' } },
        { description: { $regex: cleaned, $options: 'i' } }
      ];
    }
    if (maxPrice) filter.price = { $lte: maxPrice };

    const products = await Product.find(filter).limit(6);

    let reply;
    if (products.length === 0) {
      reply = "I couldn't find anything matching that. Try a different keyword or category.";
    } else {
      reply = `Here's what I found${maxPrice ? ` under Rs. ${maxPrice}` : ''}:`;
    }

    res.json({ reply, products });
  } catch (err) {
    res.status(500).json({ message: 'AI assistant failed to respond' });
  }
});

module.exports = router;
