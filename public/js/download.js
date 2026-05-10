/* ============================================================
   CommentCraft — Download / Copy
   ============================================================ */

async function captureAsCanvas(el) {
  /* backgroundColor: null → el fondo viene del CSS del elemento capturado.
     Para previewOuter (card): su CSS tiene el color de plataforma → se captura.
     Para previewContent en modo burbuja: no tiene fondo → transparente.       */
  return html2canvas(el, {
    scale:           3,        // 3× resolución — calidad máxima
    useCORS:         true,
    allowTaint:      true,
    backgroundColor: null,
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

window.downloadAsPng   = downloadAsPng;
window.copyToClipboard = copyToClipboard;
