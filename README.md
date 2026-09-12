# Setup

## 1. MongoDB
Local install or a free MongoDB Atlas cluster both work. Copy the URI into `server/.env`.

## 2. Server
```
cd server
cp .env.example .env      # fill in MONGODB_URI, CLERK_SECRET_KEY, (optional) STRIPE_SECRET_KEY
npm install
npm run seed               # loads 10 sample products so the storefront isn't empty
npm run dev                 # starts on http://localhost:5000
```

## 3. Client
```
cd client
cp .env.example .env        # if present, fill in Clerk publishable key / Stripe publishable key
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
```

## Notes
- Auth is handled by Clerk (`server/middleware/auth.js`) — every protected route expects
  an `Authorization: Bearer <clerk session token>` header.
- Payments support two paths: a dummy card form (always succeeds unless the card number
  ends in `0000`) and real Stripe PaymentIntents (needs `STRIPE_SECRET_KEY` +
  `VITE_STRIPE_PUBLISHABLE_KEY`).
- `/api/ai/chat` and `/api/ai/recommendations` are simple rule-based endpoints (keyword
  match + top-rated products) — swap in a real LLM call if you want smarter responses.
