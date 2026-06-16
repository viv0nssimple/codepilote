/* CodePilote — Gestion du son */
let impl = null;
export const Sound = {
  get enabled() { return localStorage.getItem('cp-sound') !== 'off'; },
  toggle() { localStorage.setItem('cp-sound', this.enabled ? 'off' : 'on'); return this.enabled; },
  register(fn) { impl = typeof fn === 'function' ? fn : null; },
  play(...args) { if (!this.enabled || !impl) return; return impl(...args); }
};
Object.defineProperty(window, 'playSound', {
  configurable: true,
  get() { return (...args) => Sound.play(...args); },
  set(fn) { Sound.register(fn); }
});
