// Vercel Serverless Function: Health Check & System Observability
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bwygpjlzoefhfixtyxdg.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eWdwamx6b2VmaGZpeHR5eGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTA2ODAsImV4cCI6MjA5OTA4NjY4MH0.4IbM23kSH2ohMKWAU_7-1PRQdnfcUlH-XrlpyEv9YWU';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();
  let dbStatus = 'unknown';
  let dbLatencyMs = null;

  try {
    const dbStart = Date.now();
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = dbRes.ok ? 'connected' : `degraded (status ${dbRes.status})`;
  } catch (err) {
    dbStatus = `unreachable (${err.message})`;
  }

  const isHealthy = dbStatus === 'connected';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'NexaTransform Hub LMIS API',
    version: '2.0.0-enterprise',
    timestamp: new Date().toISOString(),
    uptime_ms: process.uptime ? Math.round(process.uptime() * 1000) : null,
    total_latency_ms: Date.now() - startTime,
    database: {
      status: dbStatus,
      latency_ms: dbLatencyMs
    },
    environment: process.env.NODE_ENV || 'production'
  });
}
