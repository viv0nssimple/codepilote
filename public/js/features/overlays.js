/* CodePilote — Overlays modaux avec focus trap */
import { byId } from '../core/dom.js';
export function createOverlay(id, title, description) {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.className = 'cp-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <section class="cp-panel" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <div class="cp-panel__top">
        <div>
          <p class="cp-eyebrow">CodePilote</p>
          <h2 id="${id}-title">${title}</h2>
          <p>${description}</p>
        </div>
        <button class="cp-panel__close" type="button" aria-label="Fermer">&times;</button>
      </div>
      <div class="cp-panel__content"></div>
    </section>`;
  let lastFocused = null;
  const close = () => {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cp-modal-open');
    lastFocused?.focus?.();
  };
  overlay.querySelector('.cp-panel__close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', e => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.body.appendChild(overlay);
  return {
    overlay,
    content: overlay.querySelector('.cp-panel__content'),
    open() {
      lastFocused = document.activeElement;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cp-modal-open');
      overlay.querySelector('.cp-panel__close').focus();
    },
    close
  };
}
