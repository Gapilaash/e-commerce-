# Meridian — Shop Smarter

A full-stack MERN e-commerce app with authentication, cart, wishlist, reviews, coupons, payments, and a lightweight AI shopping assistant.

**🔗 Live Demo:** [e-commerce-client-tawny.vercel.app](https://e-commerce-client-tawny.vercel.app)

---

## Features

- 🔐 **Authentication** — email/password sign up & sign in via [Clerk](https://clerk.com)
- 🛍️ **Product catalog** — browse by category, filter by price/rating, search
- 🛒 **Cart & Wishlist** — add, update quantity, remove, persisted per user
- ⭐ **Reviews & ratings** — leave and update star ratings + comments
- 🎟️ **Coupons** — apply discount codes at checkout
- 💳 **Payments** — dummy card flow (always succeeds unless card ends in `0000`) or real Stripe PaymentIntents
- 🤖 **AI shopping assistant** — chat-based product search ("show me smart watches", "earphones under Rs. 10000")
- 📦 **Orders** — order history and order confirmation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) |
| Auth | Clerk |
| Payments | Stripe (optional) |
| Hosting | Vercel (client + server, both as serverless deployments) |

## Live Deployment

This project is deployed entirely on free tiers:

- **Client** → Vercel (static Vite build): `e-commerce-client-tawny.vercel.app`
- **Server** → Vercel (Express as a serverless function): `e-commerce-server-navy-two.vercel.app`
- **Database** → MongoDB Atlas free cluster

## Local Setup

### 1. MongoDB
Local install or a free MongoDB Atlas cluster both work. Copy the URI into `server/.env`.

### 2. Server
```bash
cd server
cp .env.example .env      # fill in MONGODB_URI, CLERK_SECRET_KEY, (optional) STRIPE_SECRET_KEY
npm install
npm run seed               # loads sample products so the storefront isn't empty
npm run dev                 # starts on http://localhost:5000
```

### 3. Client
```bash
cd client
cp .env.example .env        # fill in VITE_CLERK_PUBLISHABLE_KEY / VITE_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to :5000
```

## Notes

- Auth is handled by Clerk (`server/middleware/auth.js`) — every protected route expects
  an `Authorization: Bearer <clerk session token>` header.
- Payments support two paths: a dummy card form (always succeeds unless the card number
  ends in `0000`) and real Stripe PaymentIntents (needs `STRIPE_SECRET_KEY` +
  `VITE_STRIPE_PUBLISHABLE_KEY`).
- `/api/ai/chat` and `/api/ai/recommendations` are rule-based endpoints (keyword
  match + synonyms + top-rated products) — swap in a real LLM call if you want smarter responses.
- In production, the client proxies Clerk's API through `/__clerk` (see `client/api/clerk-proxy.js`
  and `client/vercel.json`) so authentication works on the free `*.vercel.app` domain without
  needing a custom domain.
