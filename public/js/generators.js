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
  return `<span style="display:inline-flex;align-items:center;flex-shrink:0;vertical-align:middle;line-height:1;">
    <svg viewBox="0 0 20 20" width="${size}" height="${size}" style="display:block;vertical-align:middle;">
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
    return `<div class="${cls}" style="background:${avatarColor};overflow:hidden;padding:0;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">` +
           `<img src="${avatarImg}" alt="avatar" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;" onerror="this.style.display='none';" /></div>`;
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
  instagram({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, igReplies, igStoryRing, darkMode }) {
    const initial = (username || 'U').charAt(0).toUpperCase();

    const avatarHtml = igStoryRing
      ? `<div class="ig-story-ring">${avatarEl(avatarImg, avatarColor, initial, 'ig-avatar')}</div>`
      : avatarEl(avatarImg, avatarColor, initial, 'ig-avatar');

    return `
<div class="ig-wrapper${darkMode ? ' ig-dark' : ''}">
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
  whatsapp({ username, avatarColor, avatarImg, commentText, waTime, waIsGroup, waType }) {
    const initial  = (username || 'U').charAt(0).toUpperCase();
    const isSent   = waType !== 'received';
    const sideClass   = isSent ? 'sent-side' : 'received-side';
    const bubbleClass = isSent ? 'sent' : 'received';

    const tickMap = {
      sent:      `<span class="wa-tick-svg"><svg viewBox="0 0 12 9" width="15" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#92A3AD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
      delivered: `<span class="wa-tick-svg"><svg viewBox="0 0 17 9" width="19" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#92A3AD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,4.5 9,7.5 16,1" stroke="#92A3AD" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
      read:      `<span class="wa-tick-svg"><svg viewBox="0 0 17 9" width="19" height="11" fill="none"><polyline points="1,4.5 4,7.5 11,1" stroke="#53BDEB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,4.5 9,7.5 16,1" stroke="#53BDEB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`,
    };
    const ticks = isSent ? (tickMap[waType] || '') : '';

    const receiverAvatar = (waIsGroup && !isSent)
      ? avatarEl(avatarImg, avatarColor, initial, 'wa-recv-avatar')
      : '';
    const senderName = (waIsGroup && !isSent)
      ? `<span class="wa-sender-name">${escHtml(username || 'Usuario')}</span>`
      : '';

    return `
<div class="wa-wrapper">
  <div class="wa-bubble-container ${sideClass}">
    ${receiverAvatar}
    <div class="wa-message ${bubbleClass}">
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
  youtube({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, ytPinned, ytCreatorHeart, ytReplies, darkMode }) {
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
<div class="yt-wrapper${darkMode ? ' yt-dark' : ''}">
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

  /* ── Twitter / X ─────────────────────────────────────── */
  twitter({ username, twitterHandle, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, twitterReplies, twitterRetweets, twitterViews, twitterReplyTo, attachedImg }) {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const handle  = twitterHandle || username.replace(/\s+/g, '').toLowerCase();

    const verifiedBadge = verified
      ? `<span style="display:inline-flex;align-items:center;flex-shrink:0;margin-left:2px;"><svg viewBox="0 0 22 22" width="18" height="18" style="display:block;"><path fill="#1D9BF0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg></span>`
      : '';

    const replyToHtml = twitterReplyTo
      ? `<p class="tw-reply-to">Respondiendo a <span class="tw-reply-handle">@${escHtml(twitterReplyTo)}</span></p>`
      : '';

    return `
<div class="tw-wrapper">
  <div class="tw-left">${avatarEl(avatarImg, avatarColor, initial, 'tw-avatar')}</div>
  <div class="tw-body">
    <div class="tw-user-row">
      <span class="tw-name">${escHtml(username || 'Usuario')}</span>${verifiedBadge}
      <span class="tw-handle">@${escHtml(handle)}</span>
      <span class="tw-sep">·</span>
      <span class="tw-time">${escHtml(timestamp)}</span>
      <span class="tw-more">···</span>
    </div>
    ${replyToHtml}
    <p class="tw-text">${escHtml(commentText)}</p>
    ${attachedImg ? `<div class="comment-attached-img" style="border-radius:14px;"><img src="${attachedImg}" alt="adjunto" style="border-radius:14px;" /></div>` : ''}
    <div class="tw-actions">
      <span class="tw-action tw-act-reply">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        ${twitterReplies ? `<span>${escHtml(twitterReplies)}</span>` : ''}
      </span>
      <span class="tw-action tw-act-rt">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
        ${twitterRetweets ? `<span>${escHtml(twitterRetweets)}</span>` : ''}
      </span>
      <span class="tw-action tw-act-like">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        ${likesCount && likesCount !== '0' ? `<span>${escHtml(likesCount)}</span>` : ''}
      </span>
      <span class="tw-action tw-act-views">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/></svg>
        ${twitterViews ? `<span>${escHtml(twitterViews)}</span>` : ''}
      </span>
    </div>
  </div>
</div>`;
  },

  /* ── Threads ──────────────────────────────────────────── */
  threads({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, threadsReplies }) {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const verifiedBadge = verified
      ? `<span style="display:inline-flex;align-items:center;flex-shrink:0;margin-left:2px;"><svg viewBox="0 0 16 16" width="14" height="14" style="display:block;"><circle cx="8" cy="8" r="8" fill="#000"/><polyline points="4,8 7,11 12,5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></span>`
      : '';
    return `
<div class="th-wrapper">
  <div class="th-comment">
    <div class="th-left">${avatarEl(avatarImg, avatarColor, initial, 'th-avatar')}</div>
    <div class="th-body">
      <div class="th-user-row">
        <span class="th-username">${escHtml(username || 'usuario')}</span>${verifiedBadge}
        <span class="th-time">${escHtml(timestamp)}</span>
        <span class="th-more">···</span>
      </div>
      <p class="th-text">${escHtml(commentText)}</p>
      <div class="th-actions">
        <span class="th-action">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </span>
        <span class="th-action">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </span>
        <span class="th-action">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
        </span>
        <span class="th-action">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
        </span>
      </div>
      ${likesCount && likesCount !== '0' ? `<p class="th-like-count">${escHtml(likesCount)} Me gusta</p>` : ''}
      ${threadsReplies ? `<p class="th-replies-count">${escHtml(threadsReplies)}</p>` : ''}
    </div>
  </div>
</div>`;
  },

  /* ── LinkedIn ─────────────────────────────────────────── */
  linkedin({ username, avatarColor, avatarImg, commentText, likesCount, verified, timestamp, linkedinTitle, linkedinDegree, linkedinReaction, darkMode }) {
    const initial = (username || 'U').charAt(0).toUpperCase();
    const reactionMap = {
      like:       { emoji: '👍', label: 'Me gusta' },
      celebrate:  { emoji: '🎉', label: 'Celebrar' },
      support:    { emoji: '💚', label: 'Apoyo' },
      love:       { emoji: '❤️', label: 'Me encanta' },
      insightful: { emoji: '💡', label: 'Interesante' },
      curious:    { emoji: '🤔', label: 'Curioso' },
    };
    const reaction = reactionMap[linkedinReaction] || reactionMap.like;
    return `
<div class="li-wrapper${darkMode ? ' li-dark' : ''}">
  <div class="li-comment">
    ${avatarEl(avatarImg, avatarColor, initial, 'li-avatar')}
    <div class="li-right">
      <div class="li-bubble">
        <div class="li-name-row">
          <span class="li-name">${escHtml(username || 'Usuario')}</span>
          ${verified ? verifiedSVG('#0A66C2', '#fff', 13) : ''}
          ${linkedinDegree ? `<span class="li-degree">${escHtml(linkedinDegree)}</span>` : ''}
        </div>
        ${linkedinTitle ? `<p class="li-title">${escHtml(linkedinTitle)}</p>` : ''}
        <p class="li-text">${escHtml(commentText)}</p>
      </div>
      <div class="li-footer">
        <span class="li-time">${escHtml(timestamp)}</span>
        <span class="li-react-btn">${reaction.emoji} ${reaction.label}</span>
        <span class="li-sep">·</span>
        <span class="li-reply-btn">Responder</span>
      </div>
      ${likesCount && likesCount !== '0' ? `<div class="li-reactions"><span>👍</span><span class="li-react-count">${escHtml(likesCount)}</span></div>` : ''}
    </div>
  </div>
</div>`;
  },

  /* ── Reddit ──────────────────────────────────────────── */
  reddit({ username, avatarColor, commentText, timestamp, redditSub, redditVotes, redditAwards, redditReplies, redditIsOp, attachedImg }) {
    const user = username || 'usuario';
    const sub  = redditSub  || 'AskReddit';

    /* Awards row */
    let awardsHtml = '';
    const numAwards = parseInt(redditAwards, 10) || 0;
    if (numAwards > 0) {
      const types = [
        { cls: 'rd-award-gold',   label: '🏅', name: 'Oro' },
        { cls: 'rd-award-silver', label: '🥈', name: 'Plata' },
        { cls: 'rd-award-bronze', label: '🥉', name: 'Bronce' },
      ];
      const shown = [];
      for (let i = 0; i < Math.min(numAwards, 3); i++) {
        const t = types[i];
        shown.push(`<span class="rd-award">
          <span class="rd-award-icon ${t.cls}">${t.label}</span>
        </span>`);
      }
      if (numAwards > 3) {
        shown.push(`<span class="rd-award" style="color:#818384;font-size:0.75rem;">+${numAwards - 3}</span>`);
      }
      awardsHtml = `<div class="rd-awards">${shown.join('')}</div>`;
    }

    const opBadge = redditIsOp ? `<span class="rd-op-badge">OP</span>` : '';

    const repliesAction = redditReplies
      ? `<span class="rd-action">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
           ${escHtml(redditReplies)} respuestas
         </span>`
      : `<span class="rd-action">
           <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
           Responder
         </span>`;

    return `
<div class="rd-wrapper">
  <div class="rd-header">
    <span class="rd-sub">r/${escHtml(sub)}</span>
    <span class="rd-sub-sep">·</span>
    <span class="rd-user">u/${escHtml(user)}</span>
    <span class="rd-sub-sep">·</span>
    <span class="rd-time">${escHtml(timestamp)}</span>
  </div>
  <div class="rd-comment">
    <div class="rd-vote">
      <span class="rd-vote-up">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 4l8 8H4z"/></svg>
      </span>
      <span class="rd-vote-count">${escHtml(redditVotes || '•')}</span>
      <span class="rd-vote-down">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 20l-8-8h16z"/></svg>
      </span>
    </div>
    <div class="rd-body">
      <div class="rd-user-row">
        <span class="rd-username">u/${escHtml(user)}</span>
        ${opBadge}
        <span class="rd-timestamp">${escHtml(timestamp)}</span>
      </div>
      <p class="rd-text">${escHtml(commentText)}</p>
      ${attachedImg ? `<div class="comment-attached-img"><img src="${attachedImg}" alt="adjunto" /></div>` : ''}
      ${awardsHtml}
      <div class="rd-actions">
        ${repliesAction}
        <span class="rd-action">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Compartir
        </span>
        <span class="rd-action">···</span>
      </div>
    </div>
  </div>
</div>`;
  },

};

window.Generators = Generators;
window.escHtml    = escHtml;
