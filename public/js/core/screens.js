/* CodePilote — Routeur d'écrans */
import { byId } from './dom.js';
export const Screens = {
  list: ['screen-auth','screen-onboarding','screen-home','screen-game','screen-leaderboard','screen-lobby','screen-duel','screen-duel-results','screen-tournament','screen-social','screen-ecurie'],
  hideAll() { this.list.forEach(id => { const el = byId(id); if (el) el.style.display = 'none'; }); },
  show(screenId, { animate = true } = {}) {
    this.hideAll();
    const el = byId(screenId);
    if (!el) return;
    el.style.display = 'block';
    if (animate) el.style.animation = 'screenEnter .45s cubic-bezier(.2,.8,.2,1)';
    document.body.classList.remove('cp-modal-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.dispatchEvent(new CustomEvent('cp:screen', { detail: screenId }));
  }
};
