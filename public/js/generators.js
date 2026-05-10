/* ============================================================
   CommentCraft — Platform HTML Generators
   ============================================================ */

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

/* SVG verified badge — renderiza igual en browser y html2canvas */
function verifiedSVG(bgColor, checkColor, size = 16) {
  return `<svg viewBox="0 0 20 20" width="${size}" height="${size}"
    style="flex-shrink:0;display:inline-block;vertical-align:middle;margin-left:3px;">
    <circle cx="10" cy="10" r="10" fill="${bgColor}"/>
    <polyline points="5.5,10.5 8.5,13.5 14.5,6.5"
      stroke="${checkColor}" stroke-width="2.2"
      stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

/* Avatar: foto o círculo coloreado con inicial */
function avatarEl(avatarImg, avatarColor, initial, cls) {
  if (avatarImg) {
    return `<div class="${cls}" style="background:${avatarColor};overflow:hidden;padding:0;flex-shrink:0;">` +
           `<img src="${avatarImg}" alt="avatar" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;" /></div>`;
  }
  return `<div class="${cls}" style="background:${avatarColor};flex-shrink:0;">${initial}</div>`;
}

/* ──────────────────────────────────────────────────────────── */

const Generators = {

  /* ── TikTok Comentario ────────────────────────────────── */
  tiktok({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, replyCount }) {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const user    = username ? `@${username}` : '@usuario';

    return `
<div class="tt-wrapper">
  <div class="tt-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'tt-avatar')}
    <div class="tt-body">
      <div class="tt-header">
        <span class="tt-username">${escHtml(user)}</span>
        ${verified ? verifiedSVG('#20D5EC', '#000', 15) : ''}
        <span class="tt-time">· ${escHtml(timestamp)}</span>
      </div>
      <p class="tt-text">${escHtml(commentText)}</p>
      <div class="tt-actions">
        <span class="tt-likes">❤️ ${escHtml(likesCount)}</span>
        <span class="tt-reply">Responder</span>
        ${replyCount ? `<span class="tt-replies">${escHtml(replyCount)} respuestas</span>` : ''}
      </div>
    </div>
    <div class="tt-heart-btn"><span class="tt-heart-icon">♡</span></div>
  </div>
</div>`;
  },

  /* ── TikTok Globo (burbuja) ───────────────────────────── */
  tiktokBubble({ username, avatarColor, avatarImg, commentText, timestamp, verified }) {
    const user    = username    || 'usuario';
    const comment = commentText || 'Escribe tu comentario...';

    let avatarHtml;
    if (avatarImg) {
      avatarHtml = `<div class="tt-reply-avatar" style="overflow:hidden;padding:0;background:${avatarColor};">
        <img src="${avatarImg}" alt="avatar" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;" />
      </div>`;
    } else {
      avatarHtml = `<div class="tt-reply-avatar tt-reply-avatar-default">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
          <circle cx="20" cy="20" r="20" fill="#C8C8C8"/>
          <circle cx="20" cy="15.5" r="7" fill="#8C8C8C"/>
          <ellipse cx="20" cy="34" rx="12.5" ry="9" fill="#8C8C8C"/>
        </svg>
      </div>`;
    }

    return `
<div class="tt-reply-scene">
  <div class="tt-reply-bubble">
    ${avatarHtml}
    <div class="tt-reply-text-col">
      <div class="tt-bubble-user-row">
        <span class="tt-bubble-username">@${escHtml(user)}</span>
        ${verified ? verifiedSVG('#20D5EC', '#000', 15) : ''}
      </div>
      <span class="tt-bubble-comment">${escHtml(comment)}</span>
      ${timestamp ? `<span class="tt-bubble-time">${escHtml(timestamp)}</span>` : ''}
    </div>
  </div>
</div>`;
  },

  /* ── Facebook ─────────────────────────────────────────── */
  facebook({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, fbReaction }) {
    const initial  = (username || 'U').charAt(0).toUpperCase();
    const reactions = {
      like:  ['👍', 'Me gusta'],
      love:  ['❤️', 'Me encanta'],
      haha:  ['😂', 'Me divierte'],
      wow:   ['😮', 'Me asombra'],
      sad:   ['😢', 'Me entristece'],
      angry: ['😡', 'Me enoja'],
    };
    const [reactionEmoji, reactionLabel] = reactions[fbReaction] || reactions.like;

    return `
<div class="fb-wrapper">
  <div class="fb-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'fb-avatar')}
    <div class="fb-bubble">
      <div class="fb-username">
        ${escHtml(username || 'Usuario')}
        ${verified ? verifiedSVG('#1877F2', '#fff', 15) : ''}
      </div>
      <p class="fb-text">${escHtml(commentText)}</p>
    </div>
  </div>
  <div class="fb-actions">
    <span class="fb-action-btn">${reactionEmoji} ${reactionLabel}</span>
    <span class="fb-dot">·</span>
    <span class="fb-action-btn">Responder</span>
    <span class="fb-dot">·</span>
    <span class="fb-time-small">${escHtml(timestamp)}</span>
    <div class="fb-reaction-summary">
      <span class="fb-reaction-icon">${reactionEmoji}</span>
      <span>${escHtml(likesCount)}</span>
    </div>
  </div>
</div>`;
  },

  /* ── Instagram ────────────────────────────────────────── */
  instagram({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, igReplies }) {
    const initial = (username || 'U').charAt(0).toUpperCase();

    return `
<div class="ig-wrapper">
  <div class="ig-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'ig-avatar')}
    <div class="ig-content">
      <p class="ig-comment-text">
        <span class="ig-username">${escHtml(username || 'usuario')}</span>${verified ? verifiedSVG('#0095F6', '#fff', 13) : ''}&nbsp;${escHtml(commentText)}
      </p>
      <div class="ig-meta">
        <span class="ig-time">${escHtml(timestamp)}</span>
        ${likesCount && likesCount !== '0' ? `<span class="ig-likes-count">${escHtml(likesCount)} Me gusta</span>` : ''}
        <span class="ig-reply-btn">Responder</span>
      </div>
    </div>
    <div class="ig-heart">♡</div>
  </div>
  ${igReplies ? `<p class="ig-see-replies">${escHtml(igReplies)}</p>` : ''}
</div>`;
  },

  /* ── WhatsApp ─────────────────────────────────────────── */
  whatsapp({ username, avatarColor, avatarImg, commentText, waTime, waStatus, waIsGroup, waGroupName, waDarkMode, waIsSent }) {
    const initial   = (username || 'U').charAt(0).toUpperCase();
    const groupInit = (waGroupName || 'G').charAt(0).toUpperCase();

    const tickMap = {
      sent:      '<span class="wa-ticks">✓</span>',
      delivered: '<span class="wa-ticks">✓✓</span>',
      read:      '<span class="wa-ticks read">✓✓</span>',
    };
    const ticks       = waIsSent ? (tickMap[waStatus] || tickMap.sent) : '';
    const darkClass   = waDarkMode ? 'dark' : '';
    const bubbleClass = waIsSent  ? 'sent' : 'received';
    const sideClass   = waIsSent  ? 'sent-side' : 'received-side';

    const groupHeader = waIsGroup ? `
      <div class="wa-group-header">
        ${avatarEl(avatarImg, avatarColor, groupInit, 'wa-group-avatar')}
        <span class="wa-group-name ${waDarkMode ? 'wa-dark' : ''}">${escHtml(waGroupName || 'Grupo')}</span>
      </div>` : '';

    const senderName = (waIsGroup && !waIsSent)
      ? `<span class="wa-sender-name">${escHtml(username || 'Usuario')}</span>`
      : '';

    return `
<div class="wa-wrapper ${darkClass}">
  ${groupHeader}
  <div class="wa-bubble-container ${sideClass}">
    <div class="wa-message ${bubbleClass} ${waDarkMode ? 'wa-dark' : ''}">
      ${senderName}
      <p class="wa-text">${escHtml(commentText)}</p>
      <div class="wa-meta">
        <span class="wa-time">${escHtml(waTime || '12:00')}</span>
        ${ticks}
      </div>
    </div>
  </div>
</div>`;
  },
};

window.Generators = Generators;
window.escHtml    = escHtml;
