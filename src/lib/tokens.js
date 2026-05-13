const crypto = require('crypto');

function secret() {
  return process.env.TOKEN_SECRET || 'dev-secret-change-in-production';
}

function createToken(email, extra = {}) {
  const payload = Buffer.from(JSON.stringify({ email, v: 1, ...extra })).toString('base64url');
  const sig     = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/* Crea token premium con vencimiento a 35 días (5 días de gracia sobre los 30) */
function createPremiumToken(email, stripeCustomerId) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 35;
  return createToken(email, { tier: 'premium', exp, stripeCustomerId });
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
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    /* Tokens premium con exp: verificar que no haya vencido */
    if (data.exp && Math.floor(Date.now() / 1000) > data.exp) return null;
    return data;
  } catch { return null; }
}

/* Token de un solo uso para magic link de recuperación — expira en 15 min */
function createRecoveryLinkToken(email) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 15;
  return createToken(email, { purpose: 'recover', exp });
}

module.exports = { createToken, createPremiumToken, createRecoveryLinkToken, verifyToken };
