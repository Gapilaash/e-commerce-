// This file must live at: client/api/__clerk/[...path].js
//
// It receives requests forwarded (via a vercel.json rewrite) from
// https://e-commerce-client-tawny.vercel.app/__clerk/*
// and proxies them to Clerk's real Frontend API, exactly as required by:
// https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi

const CLERK_FAPI = 'https://frontend-api.clerk.dev';
const PROXY_URL = 'https://e-commerce-client-tawny.vercel.app/__clerk';

export default async function handler(req, res) {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      res.status(500).send('CLERK_SECRET_KEY is not set on this project');
      return;
    }

    // req.url looks like: /api/__clerk/v1/client?... — strip the prefix
    // so we can rebuild the real Clerk Frontend API URL.
    const suffix = req.url.replace(/^\/api\/__clerk/, '');
    const targetUrl = CLERK_FAPI + suffix;

    // Copy incoming headers, but drop the ones that must not be forwarded.
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      const lower = key.toLowerCase();
      if (['host', 'content-length', 'connection'].includes(lower)) continue;
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    // Required by Clerk's proxy spec.
    headers.set('Clerk-Proxy-Url', PROXY_URL);
    headers.set('Clerk-Secret-Key', secretKey);
    headers.set(
      'X-Forwarded-For',
      (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString()
    );

    const method = req.method || 'GET';
    const hasBody = !['GET', 'HEAD'].includes(method);

    // req.body is already parsed by Vercel for JSON/form requests.
    let body;
    if (hasBody) {
      if (req.body === undefined || req.body === null || req.body === '') {
        body = undefined;
      } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        body = req.body;
      } else {
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
      redirect: 'manual' // Clerk requires redirects to pass through unchanged.
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
