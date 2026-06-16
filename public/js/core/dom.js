/* CodePilote — Helpers DOM */
export const byId = id => document.getElementById(id);
export function createIcon(name, size = 20) {
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', name);
  icon.setAttribute('width', String(size));
  icon.setAttribute('height', String(size));
  return icon;
}
export function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
