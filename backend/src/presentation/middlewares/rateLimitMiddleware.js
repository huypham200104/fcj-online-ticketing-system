export function createRateLimiter({
  windowMs = 60_000,
  max = 120,
  keyPrefix = 'default',
  message = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
} = {}) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(max - 1));
      res.setHeader('RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
      next();
      return;
    }

    current.count += 1;
    const remaining = Math.max(max - current.count, 0);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

    if (current.count > max) {
      res.status(429).json({
        success: false,
        error: message
      });
      return;
    }

    next();
  };
}
