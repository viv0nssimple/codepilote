(() => {
  'use strict';

  // Les anciens scripts attendent encore certains boutons retirés du nouveau HTML.
  // On les recrée invisiblement pour empêcher les erreurs null.addEventListener.
  const compatibilityIds = new Set([
    'btn-home-social',
    'btn-home-ecurie',
    'btn-header-ecurie',
    'btn-leaderboard'
  ]);

  const nativeGetElementById = Document.prototype.getElementById;

  Document.prototype.getElementById = function patchedGetElementById(id) {
    const existing = nativeGetElementById.call(this, id);
    if (existing || !compatibilityIds.has(id)) return existing;

    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.hidden = true;
    button.tabIndex = -1;
    button.setAttribute('aria-hidden', 'true');
    button.dataset.compatibilityShim = 'true';

    const parent = document.body || document.documentElement;
    parent.appendChild(button);
    return button;
  };

  // Les sons restent désactivés par défaut et disposent d'un contrôle visible
  // dans la carte Jouer.
  window.codePiloteSoundEnabled = false;
  let soundImplementation = null;

  Object.defineProperty(window, 'playSound', {
    configurable: true,
    get() {
      return (...args) => {
        if (!window.codePiloteSoundEnabled || !soundImplementation) return;
        return soundImplementation(...args);
      };
    },
    set(callback) {
      soundImplementation = typeof callback === 'function' ? callback : null;
    }
  });

  window.addEventListener('error', event => {
    const message = String(event.message || '');
    if (message.includes('addEventListener') && message.includes('null')) {
      console.error(
        'CodePilote : un élément attendu par le script principal est absent.',
        event.error || event.message
      );
    }
  });
})();
