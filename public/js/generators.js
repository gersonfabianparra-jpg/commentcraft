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

/* SVG verified badge — span inline-flex evita clipping en html2canvas */
function verifiedSVG(bgColor, checkColor, size = 16) {
  return `<span style="display:inline-flex;align-items:center;flex-shrink:0;margin-left:3px;">
    <svg viewBox="0 0 20 20" width="${size}" height="${size}" style="display:block;">
      <circle cx="10" cy="10" r="10" fill="${bgColor}"/>
      <polyline points="5.5,10.5 8.5,13.5 14.5,6.5"
        stroke="${checkColor}" stroke-width="2.2"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </span>`;
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
    const initial = (username || 'U').charAt(0).toUpperCase();

    const reactionMap = {
      like:  { emoji: '👍', label: 'Me gusta',      color: '#1877F2', bg: '#e7f0fd' },
      love:  { emoji: '❤️', label: 'Me encanta',    color: '#F33E58', bg: '#fdedf0' },
      haha:  { emoji: '😂', label: 'Me divierte',   color: '#E8A400', bg: '#fdf5e0' },
      wow:   { emoji: '😮', label: 'Me asombra',    color: '#E8A400', bg: '#fdf5e0' },
      sad:   { emoji: '😢', label: 'Me entristece', color: '#E8A400', bg: '#fdf5e0' },
      angry: { emoji: '😡', label: 'Me enoja',      color: '#E9710F', bg: '#fdeee3' },
    };
    const r = reactionMap[fbReaction] || reactionMap.like;

    const reactionBadge = (likesCount && likesCount !== '0') ? `
      <div class="fb-react-badge">
        <span class="fb-react-circle" style="background:${r.color};">${r.emoji}</span>
        <span class="fb-react-count">${escHtml(likesCount)}</span>
      </div>` : '';

    return `
<div class="fb-wrapper">
  <div class="fb-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'fb-avatar')}
    <div class="fb-right">
      <div class="fb-bubble">
        <span class="fb-username">${escHtml(username || 'Usuario')}${verified ? verifiedSVG('#1877F2', '#fff', 14) : ''}</span>
        <p class="fb-text">${escHtml(commentText)}</p>
      </div>
      <div class="fb-actions">
        <span class="fb-action" style="color:${r.color};">${r.label}</span>
        <span class="fb-sep">·</span>
        <span class="fb-action">Responder</span>
        <span class="fb-sep">·</span>
        <span class="fb-time">${escHtml(timestamp)}</span>
        ${reactionBadge}
      </div>
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

  /* ── YouTube ──────────────────────────────────────────── */
  youtube({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, ytPinned, ytCreatorHeart, ytReplies }) {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const user    = username || 'usuario';

    const pinnedBadge = ytPinned ? `
      <div class="yt-pinned">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#606060"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
        Comentario destacado
      </div>` : '';

    const creatorHeart = ytCreatorHeart ? `
      <span class="yt-creator-heart" title="Al creador le gusta este comentario">❤</span>` : '';

    const seeReplies = ytReplies ? `
      <div class="yt-see-replies">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#065FD4"><path d="M20 11H7.83l2.88-2.88L9.3 6.7 4.59 11.41c-.39.39-.39 1.02 0 1.41L9.3 17.3l1.41-1.41L7.83 13H20v-2z"/></svg>
        ${escHtml(ytReplies)}
      </div>` : '';

    return `
<div class="yt-wrapper">
  ${pinnedBadge}
  <div class="yt-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'yt-avatar')}
    <div class="yt-body">
      <div class="yt-header">
        <span class="yt-username">@${escHtml(user)}</span>
        ${verified ? verifiedSVG('#AAAAAA', '#fff', 14) : ''}
        <span class="yt-time">${escHtml(timestamp)}</span>
      </div>
      <p class="yt-text">${escHtml(commentText)}</p>
      <div class="yt-actions">
        <div class="yt-like-group">
          <button class="yt-action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
          </button>
          ${likesCount && likesCount !== '0' ? `<span class="yt-like-count">${escHtml(likesCount)}</span>` : ''}
          <button class="yt-action-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
          </button>
        </div>
        <button class="yt-reply-btn">Responder</button>
        ${creatorHeart}
      </div>
      ${seeReplies}
    </div>
  </div>
</div>`;
  },
};

window.Generators = Generators;
window.escHtml    = escHtml;
