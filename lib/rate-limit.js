// Прост rate limit в паметта на конкретната lambda инстанция.
// Не е глобален между инстанциите, но спира наивно циклене от един клиент.
const buckets = new Map();

const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const MAX_BUCKETS = 5000;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.headers['x-real-ip'] || 'unknown';
}

function rateLimit(req, options) {
  const limit = (options && options.limit) || 30;
  const windowMs = (options && options.windowMs) || DEFAULT_WINDOW_MS;
  const key = clientIp(req);
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  entry.count += 1;

  if (buckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (now - bucket.start > windowMs) buckets.delete(bucketKey);
    }
  }

  const allowed = entry.count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: allowed ? 0 : Math.ceil((entry.start + windowMs - now) / 1000)
  };
}

module.exports = { rateLimit };
