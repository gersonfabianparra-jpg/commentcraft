const express              = require('express');
const router               = express.Router();
const { createToken, verifyToken } = require('../lib/tokens');
const { checkAuth, DAILY_LIMIT }   = require('../middleware/usage');

async function logToSheets(email, type, ip) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    const params = new URLSearchParams({ email, type, ip });
    await fetch(`${url}?${params}`, { redirect: 'follow' });
  } catch (_) {}
}

router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'CommentCraft', v: '1.0.0' }));

/* ---- Consultar estado de autenticación ---- */
router.get('/usage', (req, res) => {
  checkAuth(req);
  if (req.isAuthenticated) {
    const isOwner   = req.userEmail === (process.env.OWNER_EMAIL || '').toLowerCase();
    const isPremium = req.userTier === 'premium' || isOwner;
    return res.json({ success: true, authenticated: true, isOwner, isPremium, email: req.userEmail, limit: null });
  }
  res.json({ success: true, authenticated: false, isOwner: false, isPremium: false, limit: DAILY_LIMIT });
});

/* ---- Validar token (llamada de descarga) ---- */
router.post('/generate', (req, res) => {
  checkAuth(req);
  res.json({ success: true, authenticated: req.isAuthenticated, limit: DAILY_LIMIT });
});

/* ---- Registrar usuario con email ---- */
router.post('/auth/register', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Email inválido' });
  const clean = email.toLowerCase().trim();
  const token = createToken(clean);
  const ip    = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
  await logToSheets(clean, 'registro', ip);
  res.json({ success: true, token });
});

/* ---- Desbloqueo de propietario (PIN validado en servidor) ---- */
router.post('/auth/owner-unlock', async (req, res) => {
  const { pin } = req.body;
  const ownerPin   = process.env.OWNER_PIN;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerPin || !ownerEmail)
    return res.status(503).json({ success: false, error: 'No configurado' });
  if (!pin || pin !== ownerPin)
    return res.status(401).json({ success: false, error: 'PIN incorrecto' });

  const token = createToken(ownerEmail.toLowerCase().trim());
  await logToSheets(ownerEmail.toLowerCase().trim(), 'propietario', req.ip || '');
  res.json({ success: true, token });
});

/* ---- Panel admin — lista de suscriptores Premium ---- */
router.get('/admin/subscribers', async (req, res) => {
  checkAuth(req);
  const isOwner = req.isAuthenticated && req.userEmail === (process.env.OWNER_EMAIL || '').toLowerCase();
  if (!isOwner) return res.status(403).json({ success: false, error: 'Acceso denegado' });

  const LS_API = 'https://api.lemonsqueezy.com/v1';
  const lsHeaders = {
    'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    'Accept': 'application/vnd.api+json',
  };

  try {
    const pages = [];
    let url = `${LS_API}/subscriptions?page[size]=100`;
    while (url) {
      const r    = await fetch(url, { headers: lsHeaders });
      const data = await r.json();
      if (!r.ok) throw new Error(data.errors?.[0]?.detail || 'Error al obtener suscripciones');
      pages.push(...(data.data || []));
      url = data.links?.next || null;
    }

    const fmt = (s) => {
      const a = s.attributes;
      const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('es-ES') : '—';
      return {
        email:       a.user_email || '—',
        name:        a.user_name  || '—',
        status:      a.status,
        amount:      '2.99',
        currency:    'USD',
        created:     fmtDate(a.created_at),
        nextBilling: fmtDate(a.renews_at),
      };
    };

    const active   = pages.filter(s => ['active', 'on_trial'].includes(s.attributes.status)).map(fmt);
    const canceled = pages.filter(s => !['active', 'on_trial'].includes(s.attributes.status)).map(fmt);

    res.json({ success: true, active, canceled });
  } catch (e) {
    console.error('Admin subscribers error:', e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ---- History (localStorage — rutas mantenidas por compatibilidad) ---- */
router.get('/history',       (_req, res) => res.json({ success: true, data: [] }));
router.post('/history',      (_req, res) => res.json({ success: true, id: null }));
router.delete('/history/:id',(_req, res) => res.json({ success: true }));
router.delete('/history',    (_req, res) => res.json({ success: true }));

module.exports = router;
