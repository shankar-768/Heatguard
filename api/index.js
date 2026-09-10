import app from '../server/index.js';

export default function handler(req, res) {
  // If Vercel rewrote the URL to /api/index.js, restore the original requested path
  const originalUrl = req.headers['x-vercel-original-url'] || req.headers['x-matched-path'];
  if (originalUrl && (req.url === '/api/index.js' || req.url === '/api' || req.url === '/api/')) {
    req.url = originalUrl;
  }
  return app(req, res);
}
