// Sicherungsdatei weitergeben (Design 11.3): auf Tablet und Handy über das Teilen-Menü
// (In Dateien sichern, AirDrop), am PC als Download. (Claude) Am Mac kann das Teilen-Menü keine
// Datei ablegen, deshalb gibt es dort immer den Download.

export async function shareOrDownload(fileName, text) {
  const file = new File([text], fileName, { type: 'text/plain' });
  const coarse = matchMedia('(pointer: coarse)').matches;
  let canShare = false;
  try {
    canShare = coarse && !!navigator.canShare?.({ files: [file] });
  } catch {
    canShare = false;
  }
  if (canShare) {
    try {
      await navigator.share({ files: [file], title: 'Lumara-Spielstand' });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
      // sonst: Download versuchen
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
