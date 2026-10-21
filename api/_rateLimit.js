// In-memory sliding-window rate limiter for Vercel Serverless Functions
const clientRequests = new Map();

/**
 * Checks if a client IP has exceeded the allowed request limit within a time window.
 * @param {string} ip - The caller's IP address
 * @param {number} limit - Maximum allowed requests (default 30)
 * @param {number} windowMs - Window duration in milliseconds (default 60,000ms / 1 min)
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(ip, limit = 30, windowMs = 60 * 1000) {
  const clientKey = String(ip || 'unknown').trim();
  const now = Date.now();
  const entry = clientRequests.get(clientKey) || { count: 0, resetAt: now + windowMs };

  // Periodic cleanup if map grows large (> 5000 entries)
  if (clientRequests.size > 5000) {
    for (const [key, val] of clientRequests.entries()) {
      if (now > val.resetAt) clientRequests.delete(key);
    }
  }

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count += 1;
  }

  clientRequests.set(clientKey, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt
  };
}
