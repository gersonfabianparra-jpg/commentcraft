/* ============================================================
   CommentCraft — Download / Copy
   ============================================================ */

const _PLATFORM_BG = {
  tiktok:    '#121212',
  facebook:  '#FFFFFF',
  instagram: '#FFFFFF',
  whatsapp:  '#E5DDD5',
  youtube:   '#FFFFFF',
  twitter:   '#000000',
  threads:   '#FFFFFF',
  linkedin:  '#F3F2EF',
  reddit:    '#1A1A1B',
};

async function captureAsCanvas(el) {
  /* Prioridad: 1) inline style (dark mode) 2) mapa por plataforma 3) transparente */
  const inlineBg   = el.style.background || el.style.backgroundColor || '';
  const platform   = el.dataset?.platform;
  const backgroundColor = inlineBg || _PLATFORM_BG[platform] || '#121212';

  return html2canvas(el, {
    scale:           3,
    useCORS:         true,
    allowTaint:      true,
    backgroundColor,
    logging:         false,
    removeContainer: true,
    imageTimeout:    20000,
  });
}

async function downloadAsPng(el, filename = 'mockpost') {
  const outerCard = document.getElementById('previewOuter');

  /* Animación de captura antes de generar el PNG */
  if (outerCard) {
    outerCard.classList.add('capturing');
    await new Promise(r => setTimeout(r, 720));
  }

  try {
    const canvas = await captureAsCanvas(el);
    if (outerCard) outerCard.classList.remove('capturing');
    const a    = document.createElement('a');
    a.download = `${filename}-${Date.now()}.png`;
    a.href     = canvas.toDataURL('image/png');
    a.click();
    return true;
  } catch (err) {
    if (outerCard) outerCard.classList.remove('capturing');
    console.error('Download error:', err);
    return false;
  }
}

async function copyToClipboard(el) {
  try {
    const canvas = await captureAsCanvas(el);
    const blob   = await new Promise(r => canvas.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (err) {
    console.error('Clipboard error:', err);
    return false;
  }
}

async function shareImage(el, platform = 'mockpost') {
  const outerCard = document.getElementById('previewOuter');
  if (outerCard) {
    outerCard.classList.add('capturing');
    await new Promise(r => setTimeout(r, 720));
  }
  try {
    const canvas = await captureAsCanvas(el);
    if (outerCard) outerCard.classList.remove('capturing');
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], `${platform}-mockpost.png`, { type: 'image/png' });
    await navigator.share({ files: [file], title: 'MockPost' });
    return 'shared';
  } catch (err) {
    if (outerCard) outerCard.classList.remove('capturing');
    if (err.name === 'AbortError') return 'aborted';
    console.error('Share error:', err);
    return false;
  }
}

window.downloadAsPng   = downloadAsPng;
window.copyToClipboard = copyToClipboard;
window.shareImage      = shareImage;
