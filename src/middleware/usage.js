const { verifyToken } = require('../lib/tokens');

const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || '8', 10);

function checkAuth(req) {
  const token   = req.headers['x-auth-token'];
  const payload = verifyToken(token);
  if (payload?.email) {
    req.isAuthenticated = true;
    req.userEmail       = payload.email;
    return true;
  }
  req.isAuthenticated = false;
  return false;
}

module.exports = { checkAuth, DAILY_LIMIT };
