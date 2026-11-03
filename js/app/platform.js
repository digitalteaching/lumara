// Gerät erkennen (Design 11): iPad und iPhone haben für Home-Bildschirm-Apps einen eigenen
// Speicher, und Safari löscht Website-Daten nach 7 Tagen ohne Besuch. Deshalb dort „erst installieren“.

// iPadOS meldet sich als Mac, verrät sich aber durch Berührungspunkte.
export function isAppleMobile({ userAgent = '', maxTouchPoints = 0 } = {}) {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

export function isStandalone({ navigatorStandalone, displayModeStandalone }) {
  return navigatorStandalone === true || displayModeStandalone === true;
}

// Im Browser. Auf localhost lässt sich mit ?ipad ein iPad in Safari nachstellen.
export function readPlatform() {
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  const fakeIpad = local && new URLSearchParams(location.search).has('ipad');
  let displayModeStandalone = false;
  try {
    displayModeStandalone = matchMedia('(display-mode: standalone)').matches;
  } catch {
    // ältere Browser
  }
  return {
    appleMobile: fakeIpad || isAppleMobile({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints }),
    standalone: !fakeIpad && isStandalone({ navigatorStandalone: navigator.standalone, displayModeStandalone }),
  };
}

// Den Browser um dauerhaften Speicher bitten (Design 11.2). Ablehnung ist kein Fehler.
export async function requestPersist() {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // nichts zu tun
  }
}
