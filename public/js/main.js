/* CodePilote — Point d'entrée */
import { refreshIcons } from './core/dom.js';
import { setupHome } from './features/home.js';
import { improveNavigation, cleanLegacyPlaceholders } from './features/navigation.js';
function initialize() {
  setupHome();
  cleanLegacyPlaceholders();
  improveNavigation();
  refreshIcons();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
  initialize();
}
