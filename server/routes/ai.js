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

// Common shopping terms mapped to the actual words used in our catalog,
// so a search for "headphones" also finds products listed as "earphones".
const SYNONYMS = {
  headphones: 'earphones',
  headphone: 'earphones',
  earbuds: 'earphones|airpodes',
  earbud: 'earphones|airpodes',
  fridge: 'refrigerator',
  laptop: 'mobile|processor',
  phone: 'mobile',
  phones: 'mobile',
  television: 'tv',
  smartwatch: 'watches',
  smartwatches: 'watches',
  watch: 'watches',
  watches: 'watches'
};

function applySynonyms(text) {
  let result = text;
  for (const [term, replacement] of Object.entries(SYNONYMS)) {
    const re = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(re, replacement);
  }
  return result;
}

// Common conversational filler phrases people use, stripped before search
// so "show me smart watches" becomes just "smart watches".
const FILLER_PHRASES = [
  'show me', 'i want', 'i need', 'looking for', 'find me', 'search for',
  'give me', 'do you have', 'can i get', 'get me', 'i am looking for',
  'please show', 'display', 'list'
];

// Words too generic to be useful as search terms on their own.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'some', 'any', 'for', 'of', 'in', 'with', 'me', 'to',
  'please', 'and', 'or', 'products', 'product', 'items', 'item'
]);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripFillers(text) {
  let result = text;
  for (const phrase of FILLER_PHRASES) {
    const re = new RegExp(`\\b${phrase}\\b`, 'gi');
    result = result.replace(re, ' ');
  }
  return result.replace(/\s+/g, ' ').trim();
}

// Builds a regex that matches ANY of the meaningful words in the message,
// rather than requiring the whole phrase to appear literally.
function buildKeywordRegex(text) {
  const withSynonyms = applySynonyms(text);
  const words = withSynonyms
    .toLowerCase()
    .split(/[\s,]+/)
    .flatMap(w => w.split('|')) // synonyms may already contain "a|b"
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOPWORDS.has(w));

  if (words.length === 0) return null;
  return words.map(escapeRegex).join('|');
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
    const withoutPrice = message.replace(PRICE_PATTERN, '').trim();
    const withoutFillers = stripFillers(withoutPrice);
    const keywordRegex = buildKeywordRegex(withoutFillers);

    const filter = {};
    if (keywordRegex) {
      filter.$or = [
        { name: { $regex: keywordRegex, $options: 'i' } },
        { category: { $regex: keywordRegex, $options: 'i' } },
        { description: { $regex: keywordRegex, $options: 'i' } }
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
