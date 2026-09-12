const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');

const router = express.Router();

// Extracts a rough "under $X" price ceiling from free text, if present.
function extractMaxPrice(text) {
  const match = text.match(/under\s*\$?(\d+(\.\d+)?)/i) || text.match(/below\s*\$?(\d+(\.\d+)?)/i);
  return match ? Number(match[1]) : null;
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
    const cleaned = message.replace(/under\s*\$?\d+(\.\d+)?/i, '').trim();

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
      reply = `Here's what I found${maxPrice ? ` under $${maxPrice}` : ''}:`;
    }

    res.json({ reply, products });
  } catch (err) {
    res.status(500).json({ message: 'AI assistant failed to respond' });
  }
});

module.exports = router;
