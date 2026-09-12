const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/auth/me — returns the current user's basic profile.
// req.user is populated by the Clerk auth middleware.
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
