const crypto = require('crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 часа

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(payload) {
  return crypto.createHmac('sha256', secret()).update(String(payload)).digest('hex');
}

// Сравнява два низа в постоянно време (през HMAC, за да са с еднаква дължина).
function safeEqual(a, b) {
  const ha = Buffer.from(sign('cmp:' + a));
  const hb = Buffer.from(sign('cmp:' + b));
  return crypto.timingSafeEqual(ha, hb);
}

function isConfigured() {
  return !!process.env.ADMIN_PASSWORD;
}

function checkPassword(password) {
  if (!isConfigured() || typeof password !== 'string') return false;
  return safeEqual(password, process.env.ADMIN_PASSWORD);
}

function createToken() {
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${sign('tok:' + exp)}`;
}

function verifyToken(token) {
  if (!isConfigured() || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = sign('tok:' + exp);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function bearer(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : '';
}

function parseBody(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch (_) { return {}; }
  }
  return b;
}

module.exports = { isConfigured, checkPassword, createToken, verifyToken, bearer, parseBody };
