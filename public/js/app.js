/* ============================================================
   CommentCraft — Main Application Logic
   ============================================================ */

/* ----- State ----- */
let currentPlatform  = 'tiktok';
let avatarImg        = null;
let tiktokBubbleMode = false;
let attachedImg2     = null;   // imagen adjunta (Reddit / Twitter)
let replyAvatarImg   = null;   // avatar de la respuesta anidada
let slotCount        = 0;      // número de slots extra (0–3)

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

  /* dark mode toggle — solo YouTube, Instagram, LinkedIn */
  const darkRow = $('darkModeRow');
  if (darkRow) {
    const supportsDark = ['youtube', 'instagram', 'linkedin'].includes(currentPlatform);
    darkRow.style.display = supportsDark ? '' : 'none';
    if (!supportsDark && $('darkMode')) $('darkMode').checked = false;
  }

  /* imagen adjunta — solo Reddit y Twitter */
  const attachedRow = $('attachedImgRow');
  if (attachedRow) {
    const supportsAttached = ['reddit', 'twitter'].includes(currentPlatform);
    attachedRow.style.display = supportsAttached ? '' : 'none';
    if (!supportsAttached) { attachedImg2 = null; }
  }

  /* reply — ocultar en WhatsApp */
  const replySection = $('replySection');
  if (replySection) replySection.style.display = isWhatsapp ? 'none' : '';
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
    twitterHandle:     $('twitterHandle')?.value.trim()   || '',
    twitterReplyTo:    $('twitterReplyTo')?.value.trim()  || '',
    twitterReplies:    $('twitterReplies')?.value.trim()  || '',
    twitterRetweets:   $('twitterRetweets')?.value.trim() || '',
    twitterViews:      $('twitterViews')?.value.trim()    || '',
    threadsReplies:    $('threadsReplies')?.value.trim()  || '',
    linkedinTitle:     $('linkedinTitle')?.value.trim()   || '',
    linkedinDegree:    $('linkedinDegree')?.value         || '1st',
    linkedinReaction:  $('linkedinReaction')?.value       || 'like',
    redditSub:         $('redditSub')?.value.trim()       || 'AskReddit',
    redditVotes:       $('redditVotes')?.value.trim()     || '1K',
    redditAwards:      $('redditAwards')?.value.trim()    || '',
    redditReplies:     $('redditReplies')?.value.trim()   || '',
    redditIsOp:        $('redditIsOp')?.checked           || false,
    darkMode:          $('darkMode')?.checked             || false,
    attachedImg:       attachedImg2,
    showReply:         $('showReply')?.checked            || false,
    replyUsername:     $('replyUsername')?.value.trim()   || '',
    replyAvatarColor:  $('replyAvatarColor')?.value       || '#E53E3E',
    replyText:         $('replyText')?.value.trim()       || '',
    replyLikes:        $('replyLikes')?.value.trim()      || '0',
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
/* Plataformas claras (requieren línea conectora oscura en reply) */
const LIGHT_PLATFORMS = new Set(['facebook','instagram','youtube','linkedin','threads']);

function generatePreview() {
  const data = getFormData();
  const key  = (currentPlatform === 'tiktok' && tiktokBubbleMode) ? 'tiktokBubble' : currentPlatform;
  const generator = Generators[key];
  if (!generator) return;

  /* --- fondo dark mode en previewOuter --- */
  const darkBgs = { youtube: '#0F0F0F', instagram: '#000000', linkedin: '#1B1B1B' };
  if (data.darkMode && darkBgs[currentPlatform]) {
    previewOuter.style.background = darkBgs[currentPlatform];
  } else {
    previewOuter.style.background = '';
  }

  /* --- comentario principal --- */
  let html = generator(data);

  /* --- respuesta anidada --- */
  if (data.showReply && data.replyText) {
    const replyData = {
      ...data,
      username:    data.replyUsername || 'usuario',
      avatarColor: data.replyAvatarColor,
      avatarImg:   replyAvatarImg,
      commentText: data.replyText,
      likesCount:  data.replyLikes,
      verified: false, ytPinned: false, ytCreatorHeart: false,
      twitterReplyTo: '', igStoryRing: false,
    };
    const isLight = LIGHT_PLATFORMS.has(currentPlatform) && !data.darkMode;
    html += `<div class="nested-reply${isLight ? ' light-reply' : ''}">${generator(replyData)}</div>`;
  }

  /* --- slots apilados --- */
  document.querySelectorAll('.extra-slot').forEach(slot => {
    const u  = slot.querySelector('.slot-username').value.trim() || 'usuario';
    const t  = slot.querySelector('.slot-text').value.trim();
    if (!t) return;
    const slotData = {
      ...data,
      username:    u,
      avatarColor: slot.querySelector('.slot-color').value || '#E53E3E',
      avatarImg:   null,
      commentText: t,
      likesCount:  slot.querySelector('.slot-likes').value.trim() || '0',
      verified: false, ytPinned: false, ytCreatorHeart: false,
      twitterReplyTo: '', igStoryRing: false,
      showReply: false, attachedImg: null,
    };
    html += `<div class="stack-divider"></div>${generator(slotData)}`;
  });

  previewContent.innerHTML = html;
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
 'twitterHandle', 'twitterReplyTo', 'twitterReplies', 'twitterRetweets', 'twitterViews',
 'threadsReplies', 'linkedinTitle',
 'redditSub', 'redditVotes', 'redditAwards', 'redditReplies',
].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener('input', liveUpdate);
});

['isVerified', 'fbReaction', 'waIsGroup', 'ytPinned', 'ytCreatorHeart', 'igStoryRing',
 'linkedinDegree', 'linkedinReaction', 'redditIsOp',
].forEach(id => {
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

const DOWNLOAD_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`;

downloadBtn.addEventListener('click', async () => {
  downloadBtn.disabled  = true;
  downloadBtn.innerHTML = '⏳ Verificando...';

  const allowed = await consumeUsage();
  if (!allowed) {
    showRegisterModal();
    downloadBtn.disabled  = false;
    downloadBtn.innerHTML = `${DOWNLOAD_ICON} Descargar PNG`;
    return;
  }

  downloadBtn.innerHTML = '⏳ Generando...';
  const ok = await downloadAsPng(getCaptureTarget(), `${currentPlatform}-comment`);
  showToast(ok ? '✅ Imagen descargada' : '❌ Error al descargar', ok ? 'success' : 'error');

  downloadBtn.disabled  = false;
  downloadBtn.innerHTML = `${DOWNLOAD_ICON} Descargar PNG`;
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
  twitter:   '#000000',
  threads:   '#FFFFFF',
  linkedin:  '#F3F2EF',
  reddit:    '#1A1A1B',
};

async function reDownloadFromHistory(item, btn) {
  const key = (item.platform === 'tiktok' && item.tiktokBubble) ? 'tiktokBubble' : item.platform;
  const generator = Generators[key];
  if (!generator) return;

  const bg = PLATFORM_BG[item.platform] || '#121212';
  const wrapper = document.createElement('div');
  wrapper.className = 'preview-card-outer';
  wrapper.dataset.platform = item.platform;
  wrapper.style.cssText = 'position:absolute;top:-9999px;left:0;width:400px;border-radius:14px;';
  const inner = document.createElement('div');
  inner.className = 'preview-card';
  inner.innerHTML = generator(item.formData);
  wrapper.appendChild(inner);
  document.body.appendChild(wrapper);

  // Esperar dos frames para que CSS aplique
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const computedBg = window.getComputedStyle(wrapper).backgroundColor;
    const isTransparent = !computedBg || computedBg === 'transparent' || computedBg === 'rgba(0, 0, 0, 0)';
    const canvas = await html2canvas(wrapper, {
      scale: 3, useCORS: true, allowTaint: true,
      backgroundColor: isTransparent ? null : computedBg,
      logging: false, removeContainer: true, imageTimeout: 20000,
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
  const labels = { tiktok:'TikTok', facebook:'Facebook', instagram:'Instagram', whatsapp:'WhatsApp', youtube:'YouTube', twitter:'Twitter', threads:'Threads', linkedin:'LinkedIn', reddit:'Reddit' };
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
   DARK MODE TOGGLE
   ============================================================ */
const darkModeEl = $('darkMode');
if (darkModeEl) darkModeEl.addEventListener('change', generatePreview);

/* ============================================================
   IMAGEN ADJUNTA (Reddit / Twitter)
   ============================================================ */
const attachedFile = $('attachedFile');
if (attachedFile) {
  attachedFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      attachedImg2 = ev.target.result;
      const preview = $('attachedPreview');
      if (preview) { preview.src = attachedImg2; preview.style.display = 'block'; }
      $('removeAttachedBtn')?.classList.remove('hidden');
      generatePreview();
    };
    reader.readAsDataURL(file);
  });
}
$('removeAttachedBtn')?.addEventListener('click', () => {
  attachedImg2 = null;
  if (attachedFile) attachedFile.value = '';
  const preview = $('attachedPreview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  $('removeAttachedBtn')?.classList.add('hidden');
  generatePreview();
});

/* ============================================================
   REPLY ANIDADA
   ============================================================ */
$('showReply')?.addEventListener('change', () => {
  $('replyFields')?.classList.toggle('hidden', !$('showReply').checked);
  generatePreview();
});

/* Reply avatar file */
const replyAvatarFile = $('replyAvatarFile');
if (replyAvatarFile) {
  replyAvatarFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { replyAvatarImg = ev.target.result; generatePreview(); };
    reader.readAsDataURL(file);
  });
}

/* Reply live fields */
['replyUsername', 'replyText', 'replyLikes'].forEach(id => {
  $(id)?.addEventListener('input', liveUpdate);
});
$('replyAvatarColor')?.addEventListener('input', liveUpdate);

/* ============================================================
   STACK DE COMENTARIOS
   ============================================================ */
const SLOT_COLORS = ['#E53E3E', '#D69E2E', '#38A169'];

$('addSlotBtn')?.addEventListener('click', () => {
  if (slotCount >= 3) return;
  slotCount++;
  const idx   = slotCount;
  const color = SLOT_COLORS[idx - 1];
  const slot  = document.createElement('div');
  slot.className   = 'extra-slot';
  slot.dataset.slot = idx;
  slot.innerHTML = `
    <div class="slot-header">
      <span class="slot-label">Comentario ${idx + 1}</span>
      <button class="slot-remove btn-ghost btn-sm" data-slot="${idx}">✕ Quitar</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Usuario</label>
        <input class="form-input slot-username" type="text" placeholder="usuario${idx + 1}" maxlength="40" />
      </div>
      <div class="form-group">
        <label class="form-label">Color</label>
        <input class="form-input form-color slot-color" type="color" value="${color}" />
      </div>
    </div>
    <div class="form-group">
      <textarea class="form-input form-textarea slot-text" placeholder="Texto del comentario..." rows="2" maxlength="400"></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Likes</label>
      <input class="form-input slot-likes" type="text" placeholder="0" maxlength="10" />
    </div>`;
  $('slotsContainer').appendChild(slot);

  /* Remove button */
  slot.querySelector('.slot-remove').addEventListener('click', () => {
    slot.remove();
    slotCount--;
    $('addSlotBtn').disabled = slotCount >= 3;
    generatePreview();
  });

  /* Live update for slot inputs */
  slot.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', liveUpdate);
  });

  $('addSlotBtn').disabled = slotCount >= 3;
  $('addSlotBtn').textContent = slotCount >= 3
    ? '＋ Máximo 4 comentarios'
    : `＋ Añadir comentario (${slotCount + 1}/4)`;
  generatePreview();
});

/* ============================================================
   USAGE TRACKING
   ============================================================ */
const AUTH_TOKEN_KEY = 'cc_auth_token';
const USAGE_KEY      = 'cc_usage';
const DAILY_LIMIT    = 8;

function getAuthToken()     { return localStorage.getItem(AUTH_TOKEN_KEY); }
function saveAuthToken(tok) { localStorage.setItem(AUTH_TOKEN_KEY, tok); }

function getLocalUsage() {
  try {
    const d     = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    return d.date === today ? d : { date: today, count: 0 };
  } catch { return { date: new Date().toISOString().slice(0, 10), count: 0 }; }
}

function setLocalUsage(count) {
  localStorage.setItem(USAGE_KEY, JSON.stringify({
    date: new Date().toISOString().slice(0, 10),
    count,
  }));
}

function updateUsageBadge({ authenticated, isOwner, isPremium, count, limit }) {
  const badge = $('usageBadge');
  if (!badge) return;
  if (isOwner) {
    badge.innerHTML = `<span class="usage-icon">👑</span><span class="usage-label">Modo Propietario — acceso ilimitado</span><button class="usage-logout" id="usageLogout">Salir</button>`;
    badge.className = 'usage-badge usage-owner';
    $('usageLogout')?.addEventListener('click', logoutSession);
  } else if (isPremium) {
    badge.innerHTML = `<span class="usage-icon">⭐</span><span class="usage-label">Premium — descargas ilimitadas</span><button class="usage-logout" id="usageLogout">Salir</button>`;
    badge.className = 'usage-badge usage-premium';
    $('usageLogout')?.addEventListener('click', logoutSession);
  } else if (authenticated) {
    badge.innerHTML = `<span class="usage-icon">✓</span><span class="usage-label">Cuenta activa — descargas ilimitadas</span><button class="usage-logout" id="usageLogout">Salir</button>`;
    badge.className = 'usage-badge usage-ok';
    $('usageLogout')?.addEventListener('click', logoutSession);
  } else {
    const remaining = Math.max(0, limit - count);
    const upgradeBtn = `<button class="usage-upgrade" id="usageUpgradeBtn">⭐ Premium $2.99/mes</button>`;
    badge.innerHTML = `<span class="usage-icon">⬇️</span><span class="usage-label">${remaining} de ${limit} descargas gratuitas restantes hoy</span>${upgradeBtn}`;
    badge.className = 'usage-badge' + (remaining === 0 ? ' usage-empty' : remaining === 1 ? ' usage-warning' : '');
    $('usageUpgradeBtn')?.addEventListener('click', showUpgradeModal);
  }
}

function logoutSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  const usage = getLocalUsage();
  updateUsageBadge({ authenticated: false, isOwner: false, count: usage.count, limit: DAILY_LIMIT });
  showToast('Sesión cerrada', 'success');
}

async function fetchAndShowUsage() {
  const token = getAuthToken();
  if (token) {
    try {
      const res  = await fetch('/api/usage', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success && data.authenticated) { updateUsageBadge(data); return; }
      localStorage.removeItem(AUTH_TOKEN_KEY); // token inválido
    } catch { /* fallo silencioso */ }
  }
  const usage = getLocalUsage();
  updateUsageBadge({ authenticated: false, count: usage.count, limit: DAILY_LIMIT });
}

/* Consume un uso — devuelve true si se permite la descarga */
async function consumeUsage() {
  const token = getAuthToken();

  if (token) {
    try {
      const res  = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      });
      const data = await res.json();
      if (data.success && data.authenticated) return true;
      localStorage.removeItem(AUTH_TOKEN_KEY); // token inválido — caer al flujo anónimo
    } catch { return true; } // si el backend falla, permitir (fail-open)
  }

  // Flujo anónimo: conteo en localStorage
  const usage = getLocalUsage();
  if (usage.count >= DAILY_LIMIT) return false;
  const newCount = usage.count + 1;
  setLocalUsage(newCount);
  updateUsageBadge({ authenticated: false, count: newCount, limit: DAILY_LIMIT });
  return true;
}

/* ============================================================
   PANEL PROPIETARIO — 5 clics en el logo
   ============================================================ */
(function () {
  const logo      = document.querySelector('.logo');
  const panel     = $('ownerPanel');
  const closeBtn  = $('ownerPanelClose');
  const form      = $('ownerForm');
  const pinInput  = $('ownerPin');
  const submitBtn = $('ownerSubmit');
  const success   = $('ownerSuccess');
  if (!logo || !panel) return;

  let clickCount = 0;
  let resetTimer;

  logo.addEventListener('click', e => {
    e.preventDefault();
    clearTimeout(resetTimer);
    clickCount++;
    if (clickCount >= 5) {
      clickCount = 0;
      panel.classList.remove('hidden');
      pinInput.value = '';
      success.classList.add('hidden');
      form.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Activar';
      setTimeout(() => pinInput.focus(), 50);
      return;
    }
    resetTimer = setTimeout(() => { clickCount = 0; }, 1800);
  });

  function closePanel() { panel.classList.add('hidden'); }
  closeBtn.addEventListener('click', closePanel);
  panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (!pin) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Verificando...';

    try {
      const res  = await fetch('/api/auth/owner-unlock', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        saveAuthToken(data.token);
        form.classList.add('hidden');
        success.classList.remove('hidden');
        updateUsageBadge({ authenticated: true });
        showToast('✅ Modo propietario activado', 'success');
        setTimeout(closePanel, 1800);
      } else {
        pinInput.value        = '';
        pinInput.focus();
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Activar';
        showToast('❌ PIN incorrecto', 'error');
      }
    } catch {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Activar';
      showToast('❌ Error de conexión', 'error');
    }
  });
})();

/* ============================================================
   MODAL DE REGISTRO
   ============================================================ */
function showRegisterModal() {
  $('registerModal').classList.remove('hidden');
  $('registerEmail').focus();
}

function hideRegisterModal() {
  $('registerModal').classList.add('hidden');
  $('registerSuccess').classList.add('hidden');
  $('registerEmail').value = '';
}

$('modalClose').addEventListener('click', hideRegisterModal);
$('registerModal').addEventListener('click', e => {
  if (e.target === $('registerModal')) hideRegisterModal();
});

$('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('registerEmail').value.trim();
  if (!email) return;

  const submitBtn = $('registerSubmit');
  submitBtn.disabled   = true;
  submitBtn.textContent = 'Registrando...';

  try {
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.success && data.token) {
      saveAuthToken(data.token);
      $('registerSuccess').classList.remove('hidden');
      $('registerForm').classList.add('hidden');
      updateUsageBadge({ authenticated: true });
      setTimeout(hideRegisterModal, 2500);
      showToast('✅ Registro exitoso — descargas ilimitadas activadas', 'success');
    } else {
      showToast('❌ ' + (data.error || 'Error al registrar'), 'error');
    }
  } catch {
    showToast('❌ Error de conexión', 'error');
  } finally {
    submitBtn.disabled   = false;
    submitBtn.textContent = 'Obtener acceso ilimitado — es gratis';
  }
});

/* ============================================================
   MODAL DE UPGRADE (PREMIUM)
   ============================================================ */
function showUpgradeModal() {
  $('upgradeModal').classList.remove('hidden');
  $('upgradeEmail').focus();
}
function hideUpgradeModal() {
  $('upgradeModal').classList.add('hidden');
  $('upgradeEmail').value = '';
}

$('upgradeModalClose').addEventListener('click', hideUpgradeModal);
$('upgradeModal').addEventListener('click', e => {
  if (e.target === $('upgradeModal')) hideUpgradeModal();
});

$('upgradeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('upgradeEmail').value.trim();
  if (!email) return;

  const btn = $('upgradeSubmit');
  btn.disabled   = true;
  btn.textContent = 'Redirigiendo...';

  try {
    const res  = await fetch('/api/payments/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success && data.url) {
      window.location.href = data.url;
    } else {
      showToast('❌ ' + (data.error || 'Error al iniciar pago'), 'error');
      btn.disabled   = false;
      btn.textContent = 'Ir al pago seguro →';
    }
  } catch {
    showToast('❌ Error de conexión', 'error');
    btn.disabled   = false;
    btn.textContent = 'Ir al pago seguro →';
  }
});

/* ============================================================
   MODAL RECUPERAR PREMIUM
   ============================================================ */
function showRecoverModal() {
  hideUpgradeModal();
  $('recoverModal').classList.remove('hidden');
  setTimeout(() => $('recoverEmail').focus(), 50);
}

function hideRecoverModal() {
  $('recoverModal').classList.add('hidden');
  $('recoverEmail').value = '';
  $('recoverSuccess').classList.add('hidden');
  $('recoverError').classList.add('hidden');
  $('recoverForm').classList.remove('hidden');
}

$('recoverModalClose').addEventListener('click', hideRecoverModal);
$('recoverModal').addEventListener('click', e => {
  if (e.target === $('recoverModal')) hideRecoverModal();
});

$('goRecoverLink')?.addEventListener('click', () => showRecoverModal());

$('recoverForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('recoverEmail').value.trim();
  if (!email) return;

  const btn = $('recoverSubmit');
  btn.disabled    = true;
  btn.textContent = 'Verificando...';
  $('recoverError').classList.add('hidden');

  try {
    const res  = await fetch('/api/payments/recover', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();

    if (data.success && data.sent) {
      $('recoverForm').classList.add('hidden');
      $('recoverSuccess').innerHTML =
        `📧 Te enviamos un link a <strong>${email}</strong>.<br/>` +
        `Revisá tu bandeja de entrada y hacé clic en el link para restaurar tu acceso.<br/>` +
        `<span style="font-size:0.8em;opacity:0.7;">Expira en 15 minutos.</span>`;
      $('recoverSuccess').classList.remove('hidden');
    } else {
      const errEl = $('recoverError');
      errEl.textContent = data.error || 'No encontramos una suscripción activa con ese email.';
      errEl.classList.remove('hidden');
      btn.disabled    = false;
      btn.textContent = 'Verificar y recuperar acceso →';
    }
  } catch {
    const errEl = $('recoverError');
    errEl.textContent = 'Error de conexión. Intenta de nuevo.';
    errEl.classList.remove('hidden');
    btn.disabled    = false;
    btn.textContent = 'Verificar y recuperar acceso →';
  }
});

/* ============================================================
   INIT — auto-genera al cargar la página
   ============================================================ */
function init() {
  updatePlatformFields();
  updateAvatarThumb();
  loadHistory();
  generatePreview();
  fetchAndShowUsage();
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
