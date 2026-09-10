/**
 * HeatGuard AI - Dedicated Serverless Health Check
 * Endpoint: /api/health
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  // Check if server-side Weather API key is configured
  const hasKey = Boolean(process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY.trim());

  return res.status(200).json({
    status: 'ok',
    backend: 'connected',
    service: 'HeatGuard AI Telemetry & Auth Gateway',
    timestamp: new Date().toISOString(),
    provider: hasKey ? 'WeatherAPI.com (Key Active)' : (process.env.WEATHER_API_PROVIDER || 'openmeteo'),
    activeKey: hasKey,
    environment: process.env.VERCEL ? 'vercel-serverless' : (process.env.NODE_ENV || 'production')
  });
}
