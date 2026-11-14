// Shared app context. Views read the signed-in user and navigate through this object.
export const ctx = {
  user: null,
  go: hash => { if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = hash; },
  rerender: () => window.dispatchEvent(new HashChangeEvent('hashchange')),
  cleanup: [],               // functions run when leaving the current view (timers, camera streams, etc.)
  hideNav: false,
};
export const onLeave = fn => ctx.cleanup.push(fn);
