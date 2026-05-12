const crypto = require('crypto');

function secret() {
  return process.env.TOKEN_SECRET || 'dev-secret-change-in-production';
}

function createToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, v: 1 })).toString('base64url');
  const sig     = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const payload  = token.slice(0, dot);
  const sig      = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch { return null; }
}

module.exports = { createToken, verifyToken };
