/* CodePilote — Logique de l'écran d'accueil */
import { byId, createIcon, refreshIcons } from '../core/dom.js';
import { Sound } from '../core/sound.js';
export function setupHome() {
  const home = byId('screen-home');
  if (!home) return;
  const reviseCard = byId('card-reviser');
  const playCard = byId('card-jouer-container');
  const progressCard = byId('btn-home-progress');
  const profileCard = byId('btn-home-profile');
  const expanded = byId('jouer-expanded');
  const grid = playCard?.parentElement;
  if (grid) grid.classList.add('cp-bento-grid');
  if (reviseCard && !reviseCard.querySelector('.cp-activity-meta')) {
    const meta = document.createElement('div');
    meta.className = 'cp-activity-meta';
    meta.append(createIcon('sparkles', 16));
    meta.append('Objectif du jour');
    reviseCard.querySelector('div')?.prepend(meta);
  }
  const reco = byId('bento-recommendation');
  if (reco) {
    const obs = new MutationObserver(() => {
      if (!reco.classList.contains('skeleton') && reco.textContent.trim().length < 25) {
        reco.textContent = 'Quelques minutes suffisent pour consolider tes acquis aujourd\u2019hui.';
      }
    });
    obs.observe(reco, { childList: true, characterData: true, subtree: true });
  }
  if (playCard && expanded) {
    playCard.setAttribute('role', 'button');
    playCard.setAttribute('tabindex', '0');
    playCard.setAttribute('aria-expanded', 'false');
    playCard.setAttribute('aria-controls', 'jouer-expanded');
    const toggle = () => {
      const willOpen = !playCard.classList.contains('is-expanded');
      playCard.classList.toggle('is-expanded', willOpen);
      playCard.setAttribute('aria-expanded', String(willOpen));
      expanded.style.display = willOpen ? 'grid' : 'none';
      [progressCard, profileCard, reviseCard].forEach(c => c?.classList.toggle('cp-muted-card', willOpen));
      refreshIcons();
    };
    playCard.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      toggle();
    }, true);
    playCard.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle();
    });
    if (!expanded.querySelector('.cp-sound-toggle')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cp-sound-toggle';
      const render = () => {
        btn.setAttribute('aria-pressed', String(Sound.enabled));
        btn.textContent = Sound.enabled ? '\u{1F50A} Son activé' : '\u{1F507} Son coupé';
      };
      render();
      btn.addEventListener('click', () => { Sound.toggle(); render(); });
      expanded.appendChild(btn);
    }
  }
}
