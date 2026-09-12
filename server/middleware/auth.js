const { clerkClient, createClerkClient } = require('@clerk/clerk-sdk-node');

// Clerk JWT verification middleware
// Replaces the old JWT + Google OAuth approach
// All we need is CLERK_SECRET_KEY in .env

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.split(' ')[1];

  try {
    // Verify the Clerk session token
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const { sub, email, name, picture } = await clerk.verifyToken(token);

    // Attach user info to request (same shape as before: id, email, name)
    req.user = {
      id: sub,       // Clerk user ID (e.g. user_2abc...)
      email: email || '',
      name: name || '',
      avatar: picture || null
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = auth;
