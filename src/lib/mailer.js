const { Resend } = require('resend');

function client() {
  return new Resend(process.env.RESEND_API_KEY);
}

const BASE = process.env.APP_URL || 'https://www.postmockup.com';
const FROM = process.env.RESEND_FROM || 'PostMockup <noreply@postmockup.com>';

function emailTemplate({ icon, title, body, buttonText, link, footer }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0D0D1A;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D1A;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#13131F;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;max-width:480px;width:100%;">
        <tr><td align="center" style="padding-bottom:8px;">
          <div style="font-size:3rem;line-height:1;">${icon}</div>
        </td></tr>
        <tr><td align="center" style="padding-bottom:12px;">
          <h1 style="margin:0;font-size:1.5rem;font-weight:800;color:#F1F1F8;">${title}</h1>
        </td></tr>
        <tr><td align="center" style="padding-bottom:28px;">
          <p style="margin:0;color:rgba(255,255,255,0.55);font-size:0.92rem;line-height:1.65;">${body}</p>
        </td></tr>
        <tr><td align="center" style="padding-bottom:28px;">
          <a href="${link}"
             style="display:inline-block;padding:15px 36px;background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:1rem;letter-spacing:0.01em;">
            ${buttonText}
          </a>
        </td></tr>
        <tr><td align="center">
          <p style="margin:0;color:rgba(255,255,255,0.28);font-size:0.75rem;line-height:1.7;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendActivationEmail(email, token) {
  const link = `${BASE}/premium-recover?token=${encodeURIComponent(token)}`;
  await client().emails.send({
    from:    FROM,
    to:      email,
    subject: '¡Bienvenido a Premium! Activá tu cuenta — PostMockup',
    html:    emailTemplate({
      icon:       '⭐',
      title:      '¡Tu cuenta Premium está lista!',
      body:       `Gracias por suscribirte a PostMockup Premium, <strong style="color:#a78bfa;">${email}</strong>.<br/>Hacé clic en el botón para activar tu acceso. El link es válido por <strong style="color:#a78bfa;">15 minutos</strong>.`,
      buttonText: 'Activar mi cuenta Premium →',
      link,
      footer:     'Si no realizaste este pago, ignorá este email.<br/>El link expira en 15 minutos.',
    }),
  });
}

async function sendRecoveryEmail(email, token) {
  const link = `${BASE}/premium-recover?token=${encodeURIComponent(token)}`;
  await client().emails.send({
    from:    FROM,
    to:      email,
    subject: 'Recuperá tu acceso Premium — PostMockup',
    html:    emailTemplate({
      icon:       '🔑',
      title:      'Recuperar acceso Premium',
      body:       `Recibimos una solicitud para recuperar el acceso Premium de <strong style="color:#a78bfa;">${email}</strong>.<br/>Hacé clic en el botón para restaurar tu acceso. El link es válido por <strong style="color:#a78bfa;">15 minutos</strong>.`,
      buttonText: 'Recuperar mi acceso →',
      link,
      footer:     'Si no solicitaste esto, podés ignorar este email.<br/>El link expira en 15 minutos y solo funciona con tu suscripción activa.',
    }),
  });
}

module.exports = { sendActivationEmail, sendRecoveryEmail };
