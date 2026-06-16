/* CodePilote — Navigation & accessibilité d'en-tête */
import { byId } from '../core/dom.js';
import { Screens } from '../core/screens.js';
export function improveNavigation() {
  const logo = byId('header-logo');
  if (logo) {
    logo.setAttribute('role', 'button');
    logo.setAttribute('tabindex', '0');
    logo.setAttribute('aria-label', 'Retour à l\u2019accueil');
    logo.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') logo.click(); });
  }
  const hideEcurie = () => { const ecurie = byId('screen-ecurie'); if (ecurie) ecurie.style.display = 'none'; };
  ['btn-back-home-social','btn-back-home-ecurie','btn-back-home-lb','btn-back-home-game','btn-back-home-res','btn-back-home-tournoi','btn-duel-back'].forEach(id => {
    byId(id)?.addEventListener('click', hideEcurie, true);
  });
}
export function cleanLegacyPlaceholders() {
  const ids = ['ecurie-name-display','ecurie-division-name','ecurie-points-display','ecurie-code-display','final-score','r-correct','r-wrong'];
  ids.forEach(id => {
    const el = byId(id);
    if (!el) return;
    const sync = () => { const v = el.textContent.trim(); el.classList.toggle('is-placeholder', v === '---' || v === ''); };
    sync();
    new MutationObserver(sync).observe(el, { childList: true, characterData: true, subtree: true });
  });
}
