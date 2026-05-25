const normalizeShortCode = (value, fallback = '') => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits) return digits.slice(-6);
  const fallbackDigits = String(fallback || '').replace(/\D/g, '');
  return fallbackDigits ? fallbackDigits.slice(-6) : '';
};

const generateShortCode = (seed = Date.now().toString()) => {
  const digits = normalizeShortCode(seed, Date.now().toString());
  return digits.padStart(6, '0').slice(-6);
};

module.exports = {
  normalizeShortCode,
  generateShortCode,
};
