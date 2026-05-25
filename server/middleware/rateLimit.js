const buckets = new Map();

const createRateLimit = ({ windowMs = 60_000, max = 60, message = 'Too many requests' } = {}) => (req, res, next) => {
  const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.baseUrl || req.path}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (current.count >= max) {
    return res.status(429).json({ message });
  }

  current.count += 1;
  return next();
};

module.exports = createRateLimit;
