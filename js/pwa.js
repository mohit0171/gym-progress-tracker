/* pwa.js: service worker registration, install prompt, offline banner. */
(function (global) {
  'use strict';

  let deferredPrompt = null;

  function isStandalone() {
    return global.matchMedia && (global.matchMedia('(display-mode: standalone)').matches || global.matchMedia('(display-mode: fullscreen)').matches) ||
      (global.navigator && global.navigator.standalone === true);
  }

  function ensureBanner() {
    let bar = document.getElementById('pwaStatusBar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'pwaStatusBar';
    bar.className = 'pwa-bar hidden';
    bar.setAttribute('role', 'status');
    document.body.prepend(bar);
    return bar;
  }

  function renderOnlineState() {
    const bar = ensureBanner();
    if (!global.navigator.onLine) {
      bar.classList.remove('hidden');
      bar.innerHTML = '<i data-lucide="wifi-off"></i><span>You are offline. Saved workouts and plans still work. Charts and icons need internet on first load.</span>';
      document.body.classList.add('is-offline');
    } else {
      document.body.classList.remove('is-offline');
      // Keep install hint if it was an install hint; otherwise hide.
      if (bar.dataset.kind !== 'install') bar.classList.add('hidden');
      else bar.classList.remove('hidden');
    }
    if (global.App) global.App.icons();
  }

  function showInstallBar() {
    // Don't nag when already installed.
    if (isStandalone()) return;
    const bar = ensureBanner();
    bar.dataset.kind = 'install';
    bar.classList.remove('hidden');
    bar.innerHTML = '<i data-lucide="download"></i>' +
      '<span><strong>Install Gym Progress Tracker</strong> for full-screen, offline use.</span>' +
      '<span class="pwa-bar-actions">' +
      '<button class="btn btn-sm btn-primary" id="pwaInstallBtn">Install</button>' +
      '<button class="icon-btn" id="pwaDismissBtn" aria-label="Dismiss install hint"><i data-lucide="x"></i></button>' +
      '</span>';
    if (global.App) global.App.icons();
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaDismissBtn');
    if (dismissBtn) dismissBtn.addEventListener('click', () => {
      bar.classList.add('hidden');
      bar.dataset.kind = '';
    });
    if (installBtn) installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        // No browser prompt available (e.g. desktop Chrome without criteria, iOS Safari):
        // show manual instructions.
        if (global.App) global.App.toast('Use browser menu > Add to Home screen / Install app to install.', 'info');
        else alert('Use browser menu > Add to Home screen / Install app to install.');
        return;
      }
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ }
      deferredPrompt = null;
      bar.classList.add('hidden');
      bar.dataset.kind = '';
    });
  }

  function registerSW() {
    if (!('serviceWorker' in global.navigator)) return;
    // SW requires http(s); file:// will fail — skip quietly.
    if (!/^https?:$/.test(global.location.protocol)) return;
    global.addEventListener('load', () => {
      global.navigator.serviceWorker.register('service-worker.js', { scope: './' })
        .then(reg => {
          // Nudge update checks on navigation.
          if (reg.update) reg.update().catch(() => {});
        })
        .catch(err => console.warn('Service worker registration failed:', err));
    });
    // Reload once when a new SW takes over, so pages get fresh assets.
    let reloaded = false;
    if (global.navigator.serviceWorker) {
      global.navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        global.location.reload();
      });
    }
  }

  global.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBar();
  });

  global.addEventListener('online', renderOnlineState);
  global.addEventListener('offline', renderOnlineState);

  // Show install hint shortly after load for eligible browsers that never fire the event
  // (e.g. desktop). Only if not standalone and prompt not already shown.
  global.addEventListener('load', () => {
    renderOnlineState();
    setTimeout(() => {
      const bar = document.getElementById('pwaStatusBar');
      if (!isStandalone() && deferredPrompt && (!bar || bar.classList.contains('hidden'))) showInstallBar();
    }, 2500);
  });
  document.addEventListener('DOMContentLoaded', renderOnlineState);

  global.PWA = {
    getInstallPrompt: () => deferredPrompt,
    isStandalone,
    resyncOnlineState: renderOnlineState
  };

  registerSW();
})(window);
