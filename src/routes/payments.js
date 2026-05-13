const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { createPremiumToken, createRecoveryLinkToken, verifyToken } = require('../lib/tokens');
const { sendActivationEmail, sendRecoveryEmail } = require('../lib/mailer');

const LS_API = 'https://api.lemonsqueezy.com/v1';

function lsHeaders() {
  return {
    'Authorization':  `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    'Accept':         'application/vnd.api+json',
    'Content-Type':   'application/vnd.api+json',
  };
}

async function getActiveSubscription(email) {
  const res  = await fetch(`${LS_API}/subscriptions?filter[user_email]=${encodeURIComponent(email)}`, { headers: lsHeaders() });
  const data = await res.json();
  return data.data?.find(s => ['active', 'on_trial'].includes(s.attributes.status)) || null;
}

/* ---- Crear sesión de checkout ---- */
router.post('/checkout', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Email inválido' });

  const clean = email.toLowerCase().trim();
  const base  = process.env.APP_URL || 'https://www.postmockup.com';

  try {
    const r = await fetch(`${LS_API}/checkouts`, {
      method:  'POST',
      headers: lsHeaders(),
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: clean,
              custom: { email: clean },
            },
            product_options: {
              redirect_url: `${base}/premium-success`,
              receipt_button_text: 'Activar mi cuenta Premium →',
              receipt_thank_you_note: 'Gracias por suscribirte a PostMockup Premium. Hacé clic en el botón para activar tu cuenta.',
            },
            checkout_options: {
              button_color: '#7C3AED',
            },
          },
          relationships: {
            store:   { data: { type: 'stores',   id: process.env.LEMONSQUEEZY_STORE_ID   } },
            variant: { data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_ID } },
          },
        },
      }),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data.errors?.[0]?.detail || 'Error al crear checkout');

    res.json({ success: true, url: data.data.attributes.url });
  } catch (e) {
    console.error('LS checkout error:', e.message);
    res.status(500).json({ success: false, error: 'Error al crear sesión de pago' });
  }
});

/* ---- Verificar pago tras redireccion exitosa ---- */
router.get('/session', async (req, res) => {
  const { order_id } = req.query;
  if (!order_id) return res.status(400).json({ success: false, error: 'Falta order_id' });

  try {
    const r    = await fetch(`${LS_API}/orders/${order_id}`, { headers: lsHeaders() });
    const data = await r.json();
    if (!r.ok) throw new Error('Orden no encontrada');

    const attrs = data.data.attributes;
    if (attrs.status !== 'paid')
      return res.status(402).json({ success: false, error: 'Pago no completado' });

    const email = attrs.user_email || attrs.user_name || '';
    const token = createPremiumToken(email, String(data.data.id));
    res.json({ success: true, token, email });
  } catch (e) {
    console.error('LS session error:', e.message);
    res.status(500).json({ success: false, error: 'Error al verificar sesión' });
  }
});

/* ---- Webhook — renovaciones y pagos ---- */
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig    = req.headers['x-signature'];
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return res.sendStatus(200);

  const hmac = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (hmac !== sig) return res.status(400).send('Invalid signature');

  let event;
  try { event = JSON.parse(req.body.toString()); }
  catch { return res.status(400).send('Invalid JSON'); }

  const name  = event.meta?.event_name;
  const email = event.data?.attributes?.user_email || event.meta?.custom_data?.email || '';
  const id    = String(event.data?.id || '');

  if ((name === 'subscription_payment_success' || name === 'order_created') && email) {
    const token = createPremiumToken(email, id);
    console.log(`[PREMIUM RENEWAL] email=${email} token=${token}`);
  }

  res.sendStatus(200);
});

/* ---- Activar cuenta tras pago — envía email de bienvenida ---- */
router.post('/activate', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Email inválido' });

  const clean = email.toLowerCase().trim();
  try {
    const r    = await fetch(`${LS_API}/subscriptions?filter[user_email]=${encodeURIComponent(clean)}`, { headers: lsHeaders() });
    const data = await r.json();

    if (!data.data?.length)
      return res.status(404).json({ success: false, error: 'No encontramos tu suscripción. Esperá unos minutos y volvé a intentarlo.' });

    const activeSub = data.data.find(s => ['active', 'on_trial'].includes(s.attributes.status));
    if (!activeSub)
      return res.status(402).json({ success: false, error: 'Tu suscripción no está activa aún. Esperá unos minutos y volvé a intentarlo.' });

    const token = createRecoveryLinkToken(clean);
    try {
      await sendActivationEmail(clean, token);
    } catch (mailErr) {
      console.error('Resend activation error:', mailErr.message);
      return res.status(500).json({ success: false, error: `Error al enviar el email: ${mailErr.message}` });
    }

    res.json({ success: true, sent: true, email: clean });
  } catch (e) {
    console.error('LS activate error:', e.message);
    res.status(500).json({ success: false, error: 'Error al verificar tu cuenta. Intenta de nuevo.' });
  }
});

/* ---- Recuperar acceso premium por email — envía magic link ---- */
router.post('/recover', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, error: 'Email inválido' });

  const clean = email.toLowerCase().trim();
  try {
    const r    = await fetch(`${LS_API}/subscriptions?filter[user_email]=${encodeURIComponent(clean)}`, { headers: lsHeaders() });
    const data = await r.json();

    if (!data.data?.length)
      return res.status(404).json({ success: false, error: 'No encontramos una cuenta Premium con ese email.' });

    const activeSub = data.data.find(s => ['active', 'on_trial'].includes(s.attributes.status));
    if (!activeSub)
      return res.status(402).json({ success: false, error: 'Tu suscripción no está activa. Puede que haya sido cancelada o no procesada.' });

    const recoveryToken = createRecoveryLinkToken(clean);
    try {
      await sendRecoveryEmail(clean, recoveryToken);
    } catch (mailErr) {
      console.error('Resend error:', mailErr.message);
      return res.status(500).json({ success: false, error: `Error al enviar el email: ${mailErr.message}` });
    }

    res.json({ success: true, sent: true, email: clean });
  } catch (e) {
    console.error('LS recover error:', e.message);
    res.status(500).json({ success: false, error: 'Error al verificar tu cuenta. Intenta de nuevo.' });
  }
});

/* ---- Verificar magic link y emitir token premium ---- */
router.get('/recover-verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ success: false, error: 'Token requerido' });

  const data = verifyToken(token);
  if (!data || data.purpose !== 'recover')
    return res.status(400).json({ success: false, error: 'Link inválido o expirado. Solicitá uno nuevo.' });

  const clean = data.email;
  try {
    const activeSub = await getActiveSubscription(clean);
    if (!activeSub)
      return res.status(402).json({ success: false, error: 'Tu suscripción no está activa.' });

    const premiumToken = createPremiumToken(clean, String(activeSub.id));
    res.json({ success: true, token: premiumToken, email: clean });
  } catch (e) {
    console.error('LS recover-verify error:', e.message);
    res.status(500).json({ success: false, error: 'Error al verificar. Intenta de nuevo.' });
  }
});

module.exports = router;
