// This file must live at exactly: client/api/clerk-proxy.js
// (plain filename, no brackets — avoids Windows rename issues)

const CLERK_FAPI = 'https://frontend-api.clerk.dev';
const PROXY_URL = 'https://e-commerce-client-tawny.vercel.app/__clerk';

export default async function handler(req, res) {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      res.status(500).send('CLERK_SECRET_KEY is not set on this project');
      return;
    }

    // The vercel.json rewrite passes the rest of the path as ?path=...
    const suffix = req.query.path || '';
    const suffixPath = Array.isArray(suffix) ? suffix.join('/') : suffix;

    // Rebuild any other query params (excluding our own "path" param).
    const otherParams = new URLSearchParams(req.query);
    otherParams.delete('path');
    const qs = otherParams.toString();
    const targetUrl = `${CLERK_FAPI}/${suffixPath}${qs ? '?' + qs : ''}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      const lower = key.toLowerCase();
      if (['host', 'content-length', 'connection'].includes(lower)) continue;
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    headers.set('Clerk-Proxy-Url', PROXY_URL);
    headers.set('Clerk-Secret-Key', secretKey);
    headers.set(
      'X-Forwarded-For',
      (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString()
    );

    const method = req.method || 'GET';
    const hasBody = !['GET', 'HEAD'].includes(method);

    const originalContentType = (req.headers['content-type'] || '').toLowerCase();

    let body;
    if (hasBody) {
      if (req.body === undefined || req.body === null || req.body === '') {
        body = undefined;
      } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        // Already raw (e.g. Vercel didn't parse it) — pass through as-is.
        body = req.body;
      } else if (originalContentType.includes('application/x-www-form-urlencoded')) {
        // Vercel auto-parsed a urlencoded body into an object — rebuild the
        // exact urlencoded string so Clerk's API can read it correctly.
        body = new URLSearchParams(req.body).toString();
      } else {
        // Assume JSON for everything else.
        body = JSON.stringify(req.body);
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual'
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (['content-encoding', 'transfer-encoding', 'connection'].includes(lower)) return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error('Clerk proxy error:', err);
    res.status(502).send('Clerk proxy error: ' + err.message);
  }
}
