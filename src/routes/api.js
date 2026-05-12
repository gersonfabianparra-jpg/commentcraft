const express              = require('express');
const router               = express.Router();
const { createToken, verifyToken } = require('../lib/tokens');
const { checkAuth, DAILY_LIMIT }   = require('../middleware/usage');

function logToSheets(email, type, ip) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, type, ip }),
  }).catch(() => {}); // fire-and-forget, nunca bloquea
}

router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'CommentCraft', v: '1.0.0' }));

/* ---- Consultar estado de autenticación ---- */
router.get('/usage', (req, res) => {
  checkAuth(req);
  if (req.isAuthenticated) {
    const isOwner = req.userEmail === (process.env.OWNER_EMAIL || '').toLowerCase();
    return res.json({ success: true, authenticated: true, isOwner, email: req.userEmail, limit: null });
  }
  res.json({ success: true, authenticated: false, isOwner: false, limit: DAILY_LIMIT });
});

/* ---- Validar token (llamada de descarga) ---- */
router.post('/generate', (req, res) => {
  checkAuth(req);
  res.json({ success: true, authenticated: req.isAuthenticated, limit: DAILY_LIMIT });
});

/* ---- Registrar usuario con email ---- */
router.post('/auth/register', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Email inválido' });
  const clean = email.toLowerCase().trim();
  const token = createToken(clean);
  const ip    = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
  logToSheets(clean, 'registro', ip);
  res.json({ success: true, token });
});

/* ---- Desbloqueo de propietario (PIN validado en servidor) ---- */
router.post('/auth/owner-unlock', (req, res) => {
  const { pin } = req.body;
  const ownerPin   = process.env.OWNER_PIN;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerPin || !ownerEmail)
    return res.status(503).json({ success: false, error: 'No configurado' });
  if (!pin || pin !== ownerPin)
    return res.status(401).json({ success: false, error: 'PIN incorrecto' });

  const token = createToken(ownerEmail.toLowerCase().trim());
  logToSheets(ownerEmail.toLowerCase().trim(), 'propietario', req.ip || '');
  res.json({ success: true, token });
});

/* ---- History (localStorage — rutas mantenidas por compatibilidad) ---- */
router.get('/history',       (_req, res) => res.json({ success: true, data: [] }));
router.post('/history',      (_req, res) => res.json({ success: true, id: null }));
router.delete('/history/:id',(_req, res) => res.json({ success: true }));
router.delete('/history',    (_req, res) => res.json({ success: true }));

module.exports = router;
