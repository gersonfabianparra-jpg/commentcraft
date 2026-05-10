/* ============================================================
   CommentCraft — Main Application Logic
   ============================================================ */

/* ----- State ----- */
let currentPlatform  = 'tiktok';
let avatarImg        = null;
let tiktokBubbleMode = false;

/* ----- DOM refs ----- */
const $ = id => document.getElementById(id);

const tabs           = document.querySelectorAll('.tab-btn');
const previewOuter   = $('previewOuter');
const previewContent = $('previewContent');
const generateBtn    = $('generateBtn');
const downloadBtn    = $('downloadPngBtn');
const shareBtn       = $('shareImgBtn');
const copyBtn        = $('copyImgBtn');
const saveBtn        = $('saveHistoryBtn');
const historyGrid    = $('historyGrid');
const charCount      = $('charCount');
const commentText    = $('commentText');
const avatarThumb    = $('avatarThumb');
const avatarFile     = $('avatarFile');
const removeAvatarBtn = $('removeAvatarBtn');

/* ============================================================
   PLATFORM SWITCHING
   ============================================================ */
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    currentPlatform = tab.dataset.platform;
    previewOuter.dataset.platform = currentPlatform;
    updatePlatformFields();
    generatePreview();
  });
});

function updatePlatformFields() {
  const isWhatsapp = currentPlatform === 'whatsapp';
  $('fields-standard').classList.toggle('hidden', isWhatsapp);
  $('fields-whatsapp').classList.toggle('hidden', !isWhatsapp);
  document.querySelectorAll('.platform-specific').forEach(el => el.classList.add('hidden'));
  if (!isWhatsapp) {
    const extra = $(`${currentPlatform}-extra`);
    if (extra) extra.classList.remove('hidden');
  }
}

/* ============================================================
   AVATAR — upload / URL / color
   ============================================================ */
function updateAvatarThumb() {
  const color   = $('avatarColor').value || '#7C3AED';
  const username = $('username').value.trim();
  const initial  = (username || 'U').charAt(0).toUpperCase();

  avatarThumb.style.background = color;

  if (avatarImg) {
    avatarThumb.innerHTML = `<img src="${avatarImg}" alt="avatar"
      style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;" />`;
    removeAvatarBtn.classList.remove('hidden');
  } else {
    avatarThumb.innerHTML = `<span class="avatar-thumb-text">${initial}</span>`;
    removeAvatarBtn.classList.add('hidden');
  }
}

/* File upload → base64 */
avatarFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    avatarImg = ev.target.result;
    updateAvatarThumb();
    generatePreview();
  };
  reader.readAsDataURL(file);
});

/* Remove photo */
removeAvatarBtn.addEventListener('click', () => {
  avatarImg     = null;
  avatarFile.value = '';
  updateAvatarThumb();
  generatePreview();
});

/* Color change */
$('avatarColor').addEventListener('input', () => {
  updateAvatarThumb();
  generatePreview();
});

/* ============================================================
   CHAR COUNT
   ============================================================ */
commentText.addEventListener('input', () => {
  charCount.textContent = commentText.value.length;
});

/* ============================================================
   FORM DATA
   ============================================================ */
function getFormData() {
  return {
    username:    $('username').value.trim()    || 'usuario',
    avatarColor: $('avatarColor').value        || '#7C3AED',
    avatarImg,
    commentText: commentText.value.trim()      || 'Escribe tu comentario aquí...',
    likesCount:  $('likesCount')?.value.trim() || '0',
    verified:    $('isVerified')?.checked      || false,
    timestamp:   $('timestamp').value.trim()   || 'ahora',
    replyCount:  $('replyCount')?.value.trim() || '',
    fbReaction:  $('fbReaction')?.value        || 'like',
    fbReplies:   $('fbReplies')?.value.trim()  || '',
    igReplies:   $('igReplies')?.value.trim()  || '',
    igStoryRing: $('igStoryRing')?.checked     || false,
    waTime:    $('waTime')?.value.trim() || '12:00',
    waIsGroup: $('waIsGroup')?.checked  || false,
    waType:    document.querySelector('input[name="waType"]:checked')?.value || 'received',
    ytPinned:          $('ytPinned')?.checked        || false,
    ytCreatorHeart:    $('ytCreatorHeart')?.checked  || false,
    ytReplies:         $('ytReplies')?.value.trim()  || '',
  };
}

/* ============================================================
   TIKTOK MODE TOGGLE (Comentario ↔ Responder)
   ============================================================ */
document.querySelectorAll('.tt-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tt-mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tiktokBubbleMode = btn.dataset.mode === 'bubble';
    $('tiktok-normal-fields').classList.toggle('hidden', tiktokBubbleMode);
    $('tiktok-reply-fields').classList.toggle('hidden', !tiktokBubbleMode);
    generatePreview();
  });
});

/* ============================================================
   GENERATE PREVIEW (called on every input change)
   ============================================================ */
function generatePreview() {
  const data = getFormData();
  const key  = (currentPlatform === 'tiktok' && tiktokBubbleMode) ? 'tiktokBubble' : currentPlatform;
  const generator = Generators[key];
  if (!generator) return;

  previewContent.innerHTML = generator(data);
  downloadBtn.disabled = false;
  copyBtn.disabled     = false;
  if (canShare) shareBtn.disabled = false;
}

generateBtn.addEventListener('click', generatePreview);

/* ============================================================
   REAL-TIME LISTENERS — debounce 150 ms for text, instant for selects
   ============================================================ */
let liveTimer;
function liveUpdate() {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(generatePreview, 150);
}

['username', 'commentText', 'timestamp', 'likesCount',
 'replyCount', 'fbReplies', 'igReplies', 'waTime', 'ytReplies',
].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', liveUpdate);
});

['isVerified', 'fbReaction', 'waIsGroup', 'ytPinned', 'ytCreatorHeart', 'igStoryRing'].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('change', generatePreview);
});

document.querySelectorAll('input[name="waType"]').forEach(el => {
  el.addEventListener('change', generatePreview);
});

/* ============================================================
   DOWNLOAD
   ============================================================ */

/* Elemento a capturar:
   - Globo TikTok → previewContent (sin fondo CSS propio → PNG transparente)
   - Resto        → previewOuter   (tiene el fondo de plataforma en CSS → se captura automático) */
function getCaptureTarget() {
  return (currentPlatform === 'tiktok' && tiktokBubbleMode)
    ? previewContent
    : previewOuter;
}

downloadBtn.addEventListener('click', async () => {
  downloadBtn.disabled  = true;
  downloadBtn.innerHTML = '⏳ Generando...';

  const ok = await downloadAsPng(getCaptureTarget(), `${currentPlatform}-comment`);
  showToast(ok ? '✅ Imagen descargada' : '❌ Error al descargar', ok ? 'success' : 'error');

  downloadBtn.disabled  = false;
  downloadBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
    Descargar PNG`;
});

/* ============================================================
   SHARE (Web Share API — móvil)
   ============================================================ */
const canShare = !!(navigator.canShare &&
  navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] }));

if (canShare) shareBtn.classList.remove('hidden');

shareBtn.addEventListener('click', async () => {
  shareBtn.disabled = true;
  shareBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Preparando...`;
  const result = await shareImage(getCaptureTarget(), currentPlatform);
  if (result === false) showToast('❌ No se pudo compartir', 'error');
  shareBtn.disabled = false;
  shareBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Compartir`;
});

/* ============================================================
   COPY TO CLIPBOARD
   ============================================================ */
copyBtn.addEventListener('click', async () => {
  copyBtn.disabled = true;
  const ok = await copyToClipboard(getCaptureTarget());
  showToast(ok ? '📋 Copiado al portapapeles' : '❌ No se pudo copiar (usa Chrome/Edge)', ok ? 'success' : 'error');
  copyBtn.disabled = false;
});

/* ============================================================
   SAVE TO HISTORY — localStorage
   ============================================================ */
saveBtn.addEventListener('click', () => {
  const data = getFormData();
  if (data.commentText === 'Escribe tu comentario aquí...') {
    showToast('⚠️ Ingresa un comentario primero', 'error');
    return;
  }
  const items = getStoredHistory();
  items.unshift({
    id:           Date.now().toString(),
    platform:     currentPlatform,
    tiktokBubble: tiktokBubbleMode,
    username:     data.username,
    comment_text: data.commentText,
    created_at:   new Date().toISOString(),
    formData:     { ...data, avatarImg: avatarImg }, // avatarImg = base64 del upload actual
  });
  if (items.length > 50) items.length = 50;
  localStorage.setItem('cc_history', JSON.stringify(items));
  showToast('💾 Guardado en el historial', 'success');
  loadHistory();
});

/* ============================================================
   HISTORY — localStorage
   ============================================================ */
function getStoredHistory() {
  try { return JSON.parse(localStorage.getItem('cc_history') || '[]'); }
  catch { return []; }
}

function loadHistory() {
  renderHistory(getStoredHistory());
}

const PLATFORM_BG = {
  tiktok:    '#121212',
  facebook:  '#F0F2F5',
  instagram: '#FFFFFF',
  whatsapp:  '#E5DDD5',
  youtube:   '#FFFFFF',
};

async function reDownloadFromHistory(item, btn) {
  const key = (item.platform === 'tiktok' && item.tiktokBubble) ? 'tiktokBubble' : item.platform;
  const generator = Generators[key];
  if (!generator) return;

  const bg = PLATFORM_BG[item.platform] || '#121212';
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:absolute;top:-9999px;left:0;width:400px;padding:10px 12px;background:${bg};border-radius:14px;`;
  wrapper.innerHTML = generator(item.formData);
  document.body.appendChild(wrapper);

  // Esperar dos frames para que CSS aplique
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 3, useCORS: true, allowTaint: true,
      backgroundColor: bg, logging: false,
      removeContainer: true, imageTimeout: 20000,
    });
    const a = document.createElement('a');
    a.download = `${item.platform}-mockpost-${item.id}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('✅ Imagen descargada', 'success');
  } catch (err) {
    showToast('❌ Error al descargar', 'error');
    console.error(err);
  } finally {
    document.body.removeChild(wrapper);
  }
}

function renderHistory(items) {
  if (!items.length) {
    historyGrid.innerHTML = `
      <div class="history-empty">
        <p>No hay comentarios guardados aún.<br/>Genera un comentario y haz clic en <strong>💾 Guardar</strong>.</p>
      </div>`;
    return;
  }
  const labels = { tiktok:'TikTok', facebook:'Facebook', instagram:'Instagram', whatsapp:'WhatsApp', youtube:'YouTube' };
  historyGrid.innerHTML = items.map(item => {
    const date = new Date(item.created_at).toLocaleDateString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    const dlBtn = item.formData
      ? `<button class="history-dl btn-ghost btn-sm" data-id="${item.id}" title="Descargar imagen">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
         </button>`
      : '';
    return `
<div class="history-card" data-id="${item.id}">
  <span class="history-platform-badge badge-${item.platform}">${labels[item.platform] || item.platform}</span>
  <p class="history-username">${escHtml(item.username)}</p>
  <p class="history-text">${escHtml(item.comment_text)}</p>
  <div class="history-footer">
    <span class="history-date">${date}</span>
    <div class="history-actions">
      ${dlBtn}
      <button class="history-delete btn-ghost btn-sm" data-id="${item.id}" title="Eliminar">🗑</button>
    </div>
  </div>
</div>`;
  }).join('');

  document.querySelectorAll('.history-dl').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const item = getStoredHistory().find(i => i.id === btn.dataset.id);
      if (!item?.formData) return;
      btn.disabled = true;
      btn.innerHTML = '⏳';
      await reDownloadFromHistory(item, btn);
      btn.disabled = false;
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;
    });
  });

  document.querySelectorAll('.history-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const items = getStoredHistory().filter(i => i.id !== btn.dataset.id);
      localStorage.setItem('cc_history', JSON.stringify(items));
      showToast('🗑 Eliminado', 'success');
      loadHistory();
    });
  });
}

function clearHistory() {
  if (!confirm('¿Eliminar todo el historial?')) return;
  localStorage.removeItem('cc_history');
  loadHistory();
  showToast('🗑 Historial limpiado', 'success');
}

[$('clearHistoryBtn'), $('clearHistoryBtn2')].forEach(btn => {
  if (btn) btn.addEventListener('click', clearHistory);
});

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg, type = '') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className   = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ============================================================
   EMOJI PICKER
   ============================================================ */
const EMOJIS = {
  '🔥 Top':    ['😂','🤣','❤️','😍','🔥','💯','👍','😭','🥹','💀','🫡','✨','🎉','👀','😎','🤯','💪','🙏','😅','💅','🫶','🤌','💃','🕺','🤝','😤','🥴','👑','🫠','😈'],
  '😀 Caras':  ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😇','😍','🥰','😘','😋','😛','😜','🤪','🤓','😎','🤩','🥳','😏','😒','😔','😟','😣','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😬','🙄','😴','🤤','🥴','😈','💩','🤡','👻'],
  '👋 Gestos': ['👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','🤙','👈','👉','👆','👇','☝️','✋','🖐️','👋','🤏','💪','🙏','🤝','👐','🫶','🤲','💅','🫰','🫵','🦾','🤦','🤷'],
  '❤️ Amor':   ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','🩷','🩵','🩶','😍','🥰','😘','💏','💑','🫦'],
  '🎉 Más':    ['🎉','🎊','🎈','🏆','🥇','🎯','🌟','⭐','💫','✨','🎁','🎀','🚀','🌈','🦋','🌸','🍀','🍕','🎵','🎶','📸','💡','⚡','🌙','☀️','🌊','💎','👻','🤡','🫣','💰','🔑'],
};

let currentEmojiCategory = '🔥 Top';
let emojiPickerOpen      = false;

function buildEmojiPicker() {
  const panel = $('emojiPanel');
  if (!panel) return;

  const tabs = Object.keys(EMOJIS).map(cat =>
    `<button class="emoji-tab${cat === currentEmojiCategory ? ' active' : ''}" data-cat="${escHtml(cat)}">${cat}</button>`
  ).join('');

  const grid = EMOJIS[currentEmojiCategory].map(e =>
    `<button class="emoji-btn" data-emoji="${e}">${e}</button>`
  ).join('');

  panel.innerHTML = `<div class="emoji-tabs">${tabs}</div><div class="emoji-grid">${grid}</div>`;

  panel.querySelectorAll('.emoji-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.stopPropagation();
      currentEmojiCategory = tab.dataset.cat;
      buildEmojiPicker();
    });
  });

  panel.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const start = commentText.selectionStart;
      const end   = commentText.selectionEnd;
      const val   = commentText.value;
      commentText.value = val.slice(0, start) + btn.dataset.emoji + val.slice(end);
      commentText.selectionStart = commentText.selectionEnd = start + btn.dataset.emoji.length;
      commentText.focus();
      charCount.textContent = commentText.value.length;
      liveUpdate();
    });
  });
}

$('emojiBtn').addEventListener('click', e => {
  e.stopPropagation();
  emojiPickerOpen = !emojiPickerOpen;
  const panel = $('emojiPanel');
  panel.classList.toggle('open', emojiPickerOpen);
  if (emojiPickerOpen) buildEmojiPicker();
});

$('emojiPanel').addEventListener('click', e => e.stopPropagation());

document.addEventListener('click', () => {
  emojiPickerOpen = false;
  $('emojiPanel').classList.remove('open');
});

/* ============================================================
   INIT — auto-genera al cargar la página
   ============================================================ */
function init() {
  updatePlatformFields();
  updateAvatarThumb();
  loadHistory();
  generatePreview();  // preview automático al cargar
}

document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   PWA INSTALL BANNER
   ============================================================ */
(function () {
  const banner     = $('pwaBanner');
  const closeBtn   = $('pwaBannerClose');
  const installBtn = $('pwaInstallBtn');
  if (!banner) return;

  const isIOS        = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  const dismissed    = localStorage.getItem('pwa_banner_dismissed');

  if (isStandalone || dismissed) return;

  let deferredPrompt = null;

  /* Android / Chrome — captura el evento de instalación nativa */
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.querySelector('.android-hint').style.display = 'inline-flex';
    showBanner();
  });

  /* iOS Safari — muestra instrucciones manuales */
  if (isIOS) {
    document.querySelector('.ios-hint').style.display = 'block';
    setTimeout(showBanner, 3000);
  }

  function showBanner() {
    banner.classList.add('show');
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.remove('show');
    localStorage.setItem('pwa_banner_dismissed', '1');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      banner.classList.remove('show');
      localStorage.setItem('pwa_banner_dismissed', '1');
    }
    deferredPrompt = null;
  });
})();
