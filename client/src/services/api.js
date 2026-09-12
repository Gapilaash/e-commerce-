import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach a FRESH Clerk session token to every request.
// Clerk tokens are short-lived (~60s), so we can't cache one in localStorage
// and reuse it later (e.g. at checkout, minutes after login) — it will have
// expired and the server will correctly reject it as "Invalid or expired
// token". Clerk's frontend SDK exposes a global `window.Clerk` object, so we
// ask it for a fresh token right before every request instead.
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Not signed in / Clerk not ready yet — let the request go through
    // without a token; the server will respond 401 if auth was required.
  }
  return config;
});

export default api;
