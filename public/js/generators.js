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
    const user    = username || 'usuario';

    return `
<div class="tt-wrapper">
  <div class="tt-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'tt-avatar')}
    <div class="tt-body">
      <div class="tt-header">
        <span class="tt-username">${escHtml(user)}</span>
        ${verified ? verifiedSVG('#20D5EC', '#000', 14) : ''}
      </div>
      <p class="tt-text">${escHtml(commentText)}</p>
      <div class="tt-actions">
        ${timestamp ? `<span class="tt-time">${escHtml(timestamp)}</span>` : ''}
        <span class="tt-reply">Responder</span>
      </div>
    </div>
    <div class="tt-heart-btn">
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      ${likesCount ? `<span class="tt-heart-count">${escHtml(likesCount)}</span>` : ''}
    </div>
  </div>
  ${replyCount ? `
  <div class="tt-see-replies">
    <span class="tt-see-replies-dash">——</span>
    Ver ${escHtml(replyCount)} respuestas
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
  </div>` : ''}
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
  facebook({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, fbReaction, fbReplies }) {
    const initial = (username || 'U').charAt(0).toUpperCase();

    const reactionMap = {
      like:  { emoji: '👍', color: '#1877F2' },
      love:  { emoji: '❤️', color: '#F33E58' },
      haha:  { emoji: '😂', color: '#E8A400' },
      wow:   { emoji: '😮', color: '#E8A400' },
      sad:   { emoji: '😢', color: '#E8A400' },
      angry: { emoji: '😡', color: '#E9710F' },
    };
    const r = reactionMap[fbReaction] || reactionMap.like;

    const reactionBadge = (likesCount && likesCount !== '0') ? `
      <div class="fb-react-badge">
        <span class="fb-react-emoji">${r.emoji}</span>
        <span class="fb-react-count">${escHtml(likesCount)}</span>
      </div>` : '';

    return `
<div class="fb-wrapper">
  <div class="fb-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'fb-avatar')}
    <div class="fb-right">
      <div class="fb-name-row">
        <span class="fb-username">${escHtml(username || 'Usuario')}</span>
        ${verified ? verifiedSVG('#1877F2', '#fff', 14) : ''}
        <span class="fb-time-sep">·</span>
        <span class="fb-time">${escHtml(timestamp)}</span>
      </div>
      <p class="fb-text">${escHtml(commentText)}</p>
      <div class="fb-actions">
        <span class="fb-reply-btn">Responder</span>
        ${reactionBadge}
        <div class="fb-like-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#65676B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
        </div>
      </div>
      ${fbReplies ? `
      <div class="fb-see-replies">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#65676B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 12,15 18,9"/></svg>
        Ver ${escHtml(fbReplies)} respuesta${fbReplies !== '1' ? 's' : ''}
      </div>` : ''}
    </div>
  </div>
</div>`;
  },

  /* ── Instagram ────────────────────────────────────────── */
  instagram({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, igReplies, igStoryRing }) {
    const initial = (username || 'U').charAt(0).toUpperCase();

    const avatarHtml = igStoryRing
      ? `<div class="ig-story-ring">${avatarEl(avatarImg, avatarColor, initial, 'ig-avatar')}</div>`
      : avatarEl(avatarImg, avatarColor, initial, 'ig-avatar');

    return `
<div class="ig-wrapper">
  <div class="ig-comment">
    ${avatarHtml}
    <div class="ig-body">
      <div class="ig-user-row">
        <span class="ig-username">${escHtml(username || 'usuario')}</span>
        ${verified ? verifiedSVG('#0095F6', '#fff', 13) : ''}
        <span class="ig-time">${escHtml(timestamp)}</span>
      </div>
      <p class="ig-text">${escHtml(commentText)}</p>
      <div class="ig-actions">
        <span class="ig-reply-btn">Responder</span>
      </div>
    </div>
    <div class="ig-heart-col">
      <div class="ig-heart"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#262626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
      ${likesCount && likesCount !== '0' ? `<span class="ig-like-count">${escHtml(likesCount)}</span>` : ''}
    </div>
  </div>
  ${igReplies ? `<div class="ig-see-replies">${escHtml(igReplies)}</div>` : ''}
</div>`;
  },

  /* ── WhatsApp ─────────────────────────────────────────── */
  whatsapp({ username, avatarColor, avatarImg, commentText, waTime, waStatus, waIsGroup, waGroupName, waDarkMode, waIsSent }) {
    const initial   = (username || 'U').charAt(0).toUpperCase();
    const groupInit = (waGroupName || 'G').charAt(0).toUpperCase();

    const tickMap = {
      sent:      `<span class="wa-tick-svg"><svg viewBox="0 0 12 9" width="15" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#92A3AD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
      delivered: `<span class="wa-tick-svg"><svg viewBox="0 0 17 9" width="19" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#92A3AD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,4.5 9,7.5 16,1" stroke="#92A3AD" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
      read:      `<span class="wa-tick-svg"><svg viewBox="0 0 17 9" width="19" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#53BDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,4.5 9,7.5 16,1" stroke="#53BDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
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
        ${escHtml(ytReplies)}
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#0F0F0F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
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
        <span class="yt-dot">·</span>
        <span class="yt-time">${escHtml(timestamp)}</span>
        <span class="yt-more-btn">⋮</span>
      </div>
      <p class="yt-text">${escHtml(commentText)}</p>
      <div class="yt-actions">
        <div class="yt-like-group">
          <button class="yt-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
          </button>
          ${likesCount && likesCount !== '0' ? `<span class="yt-like-count">${escHtml(likesCount)}</span>` : ''}
          <button class="yt-action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3z"/><path d="M17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"/></svg>
          </button>
        </div>
        <button class="yt-action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#606060" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </button>
        ${creatorHeart}
      </div>
    </div>
  </div>
  ${seeReplies}
</div>`;
  },
};

window.Generators = Generators;
window.escHtml    = escHtml;
