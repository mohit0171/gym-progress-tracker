/* app.js: shared navigation, theme, UI helpers, chart helpers and workout logic
   used by more than one page. */
(function (global) {
  'use strict';

  const Store = global.Store;
  const App = {};
  const renderers = [];
  const charts = {};

  App.NAV = [
    { page: 'index', href: 'index.html', label: 'Dashboard', icon: 'layout-dashboard' },
    { page: 'workout-plan', href: 'workout-plan.html', label: 'Workout Plan', icon: 'clipboard-list' },
    { page: 'workout-log', href: 'workout-log.html', label: 'Workout Log', icon: 'notebook-pen' },
    { page: 'exercises', href: 'exercises.html', label: 'Exercise Library', icon: 'book-open' },
    { page: 'calendar', href: 'calendar.html', label: 'Calendar', icon: 'calendar-days' },
    { page: 'progress', href: 'progress.html', label: 'Body Progress', icon: 'trending-up' },
    { page: 'reports', href: 'reports.html', label: 'Monthly Reports', icon: 'file-text' },
    { page: 'profile', href: 'profile.html', label: 'Profile & Goals', icon: 'user-round' }
  ];

  /* ---------- Formatting & dates ---------- */
  App.esc = function (value) {
    return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  App.pad2 = function (n) { return String(n).padStart(2, '0'); };

  App.toNumber = function (value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  App.fmt = function (n, digits) {
    if (n === null || n === undefined || !Number.isFinite(n)) return '—';
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits === undefined ? 1 : digits });
  };

  App.parseISO = function (iso) {
    const p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  };

  App.toISO = function (d) {
    return d.getFullYear() + '-' + App.pad2(d.getMonth() + 1) + '-' + App.pad2(d.getDate());
  };

  App.addDays = function (iso, n) {
    const d = App.parseISO(iso);
    d.setDate(d.getDate() + n);
    return App.toISO(d);
  };

  App.weekdayIndex = function (iso) {
    return (App.parseISO(iso).getDay() + 6) % 7; // Monday = 0
  };

  App.formatDate = function (iso, opts) {
    return App.parseISO(iso).toLocaleDateString(undefined, opts || { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  App.monthRange = function (ym) {
    const p = ym.split('-').map(Number);
    const last = new Date(p[0], p[1], 0).getDate();
    return { start: ym + '-01', end: ym + '-' + App.pad2(last) };
  };

  App.shiftMonth = function (ym, delta) {
    const p = ym.split('-').map(Number);
    const d = new Date(p[0], p[1] - 1 + delta, 1);
    return d.getFullYear() + '-' + App.pad2(d.getMonth() + 1);
  };

  App.monthLabel = function (ym) {
    const p = ym.split('-').map(Number);
    return new Date(p[0], p[1] - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  App.shortMonth = function (ym) {
    const p = ym.split('-').map(Number);
    return new Date(p[0], p[1] - 1, 1).toLocaleDateString(undefined, { month: 'short' });
  };

  /* ---------- Schedule & workout logic ---------- */
  App.isTrainingDay = function (iso, profile) {
    return (profile.trainingDays || []).includes(App.weekdayIndex(iso));
  };

  // Counts scheduled training days between two ISO dates (inclusive).
  App.countTrainingDays = function (startISO, endISO, profile) {
    if (!profile.trainingDays || !profile.trainingDays.length || startISO > endISO) return 0;
    let count = 0;
    let cur = startISO;
    while (cur <= endISO) {
      if (App.isTrainingDay(cur, profile)) count++;
      cur = App.addDays(cur, 1);
    }
    return count;
  };

  // The plan split scheduled for a given date, or null.
  App.plannedSplit = function (iso, data) {
    const idx = data.profile.trainingDays.indexOf(App.weekdayIndex(iso));
    if (idx < 0 || !data.plan || !data.plan.splits || !data.plan.splits.length) return null;
    return data.plan.splits[idx % data.plan.splits.length];
  };

  // completed | active | planned | missed | rest
  App.dayStatus = function (iso, data, today) {
    const daySessions = data.sessions.filter(s => s.date === iso);
    if (daySessions.some(s => s.status === 'completed')) return 'completed';
    if (daySessions.some(s => s.status === 'active')) return 'active';
    if (!App.isTrainingDay(iso, data.profile)) return 'rest';
    if (iso >= today) return 'planned';
    const planStart = data.plan && data.plan.createdAt;
    return planStart && iso >= planStart ? 'missed' : 'rest';
  };

  App.isRecorded = function (set) {
    return typeof set.reps === 'number' && set.reps > 0;
  };

  App.sessionVolume = function (session) {
    let total = 0;
    session.exercises.forEach(ex => ex.sets.forEach(set => {
      if (App.isRecorded(set) && typeof set.weight === 'number') total += set.weight * set.reps;
    }));
    return total;
  };

  App.sessionSetCount = function (session) {
    return session.exercises.reduce((t, ex) => t + ex.sets.filter(App.isRecorded).length, 0);
  };

  App.streak = function (completedSessions, today) {
    const days = new Set(completedSessions.map(s => s.date));
    let cursor = days.has(today) ? today : App.addDays(today, -1);
    let count = 0;
    while (days.has(cursor)) {
      count++;
      cursor = App.addDays(cursor, -1);
    }
    return count;
  };

  App.latestWeight = function () {
    const entries = Store.getMeasurements().filter(m => typeof m.weight === 'number');
    return entries.length ? entries[entries.length - 1] : null;
  };

  // Keeps profile.currentWeight in step with the newest weight entry.
  App.syncProfileWeight = function () {
    const latest = App.latestWeight();
    Store.saveProfile({ currentWeight: latest ? latest.weight : null });
  };

  // Progressive overload hint based on the last completed session. Never changes weights itself.
  App.suggestion = function (exerciseId, repMax, data, excludeSessionId) {
    if (exerciseId === undefined) return { type: 'none', text: '' };
    const past = data.sessions
      .filter(s => s.status === 'completed' && s.id !== excludeSessionId && s.exercises.some(e => e.exerciseId === exerciseId))
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.endedAt || '').localeCompare(String(a.endedAt || '')));
    if (!past.length) {
      return { type: 'none', text: 'No previous data yet. Pick a weight you can control for every set.' };
    }
    const ex = past[0].exercises.find(e => e.exerciseId === exerciseId);
    const recorded = ex.sets.filter(App.isRecorded);
    if (!recorded.length) {
      return { type: 'none', text: 'Your last session had no recorded sets for this exercise.' };
    }
    const topWeight = Math.max(...recorded.map(s => (typeof s.weight === 'number' ? s.weight : 0)));
    if (topWeight === 0) {
      return { type: 'hold', text: 'Bodyweight exercise. Progress by adding reps or a harder variation.' };
    }
    const topSets = recorded.filter(s => s.weight === topWeight);
    const minReps = Math.min(...topSets.map(s => s.reps));
    if (minReps >= repMax) {
      return { type: 'increase', text: 'You hit ' + repMax + '+ reps at ' + App.fmt(topWeight) + ' kg last time. Consider a small increase (about 2.5 kg) if your form stays solid.' };
    }
    return { type: 'hold', text: 'Last time: ' + App.fmt(topWeight) + ' kg for ' + minReps + ' reps. Aim to beat that rep count before adding weight.' };
  };

  /* ---------- Shell: sidebar, topbar, theme ---------- */
  App.renderShell = function () {
    const page = document.body.dataset.page;
    const title = document.body.dataset.title || '';
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');

    if (sidebar) {
      sidebar.innerHTML =
        '<div class="brand"><div class="brand-mark"><i data-lucide="dumbbell"></i></div><span class="brand-text">GymProgress</span>' +
        '<button class="icon-btn sidebar-collapse-btn" id="collapseBtn" aria-label="Collapse sidebar"><i data-lucide="chevrons-left"></i></button></div>' +
        '<nav class="nav" aria-label="Main navigation">' +
        App.NAV.map(item => {
          const active = item.page === page;
          return '<a class="nav-link' + (active ? ' active' : '') + '" href="' + item.href + '"' +
            (active ? ' aria-current="page"' : '') + ' title="' + App.esc(item.label) + '"><i data-lucide="' + item.icon + '"></i><span class="nav-label">' + item.label + '</span></a>';
        }).join('') +
        '</nav>' +
        '<p class="sidebar-foot">Your data is saved only in this browser. It does not sync across devices.</p>';
    }

    if (topbar) {
      topbar.innerHTML =
        '<div class="topbar-left">' +
        '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation"><i data-lucide="menu"></i></button>' +
        '<h1 class="page-title">' + App.esc(title) + '</h1>' +
        '</div>' +
        '<div class="topbar-right"><button class="icon-btn" id="themeBtn" aria-label="Toggle light or dark mode"></button></div>';
    }

    // Mobile bottom navigation (Dashboard, Workouts, Progress, Profile + More menu)
    if (!document.querySelector('.bottom-nav')) {
      const tabs = [
        { page: 'index', href: 'index.html', label: 'Home', icon: 'layout-dashboard' },
        { page: 'workout-log', href: 'workout-log.html', label: 'Workouts', icon: 'notebook-pen' },
        { page: 'progress', href: 'progress.html', label: 'Progress', icon: 'trending-up' },
        { page: 'profile', href: 'profile.html', label: 'Profile', icon: 'user-round' }
      ];
      const nav = document.createElement('nav');
      nav.className = 'bottom-nav';
      nav.setAttribute('aria-label', 'Mobile navigation');
      nav.innerHTML = tabs.map(t =>
        '<a href="' + t.href + '" class="' + (t.page === page ? 'active' : '') + '"' +
        (t.page === page ? ' aria-current="page"' : '') + '><i data-lucide="' + t.icon + '"></i><span>' + t.label + '</span></a>'
      ).join('') +
        '<button type="button" id="moreNavBtn" aria-label="More pages"><i data-lucide="menu"></i><span>More</span></button>';
      document.body.appendChild(nav);
      const moreBtn = nav.querySelector('#moreNavBtn');
      if (moreBtn) moreBtn.addEventListener('click', () => {
        const sb = document.getElementById('sidebar');
        const bd = document.getElementById('sidebarBackdrop');
        if (sb) sb.classList.add('open');
        if (bd) bd.classList.add('open');
      });
    }
  };

  App.bindShell = function () {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const menuBtn = document.getElementById('menuBtn');
    const themeBtn = document.getElementById('themeBtn');

    function closeMenu() {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }

    if (menuBtn) menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('open');
    });
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    if (themeBtn) themeBtn.addEventListener('click', App.toggleTheme);
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn) collapseBtn.addEventListener('click', () => {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      try { global.localStorage.setItem('gpt.sidebarCollapsed', collapsed ? '1' : '0'); } catch (e) { /* ignore */ }
      collapseBtn.innerHTML = '<i data-lucide="' + (collapsed ? 'chevrons-right' : 'chevrons-left') + '"></i>';
      App.icons();
    });
    try {
      if (global.localStorage.getItem('gpt.sidebarCollapsed') === '1') document.body.classList.add('sidebar-collapsed');
    } catch (e) { /* ignore */ }
  };

  App.applyTheme = function () {
    const theme = Store.getSettings().theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F3F5F2' : '#0B0D0C');
    const btn = document.getElementById('themeBtn');
    if (btn) {
      btn.innerHTML = '<i data-lucide="' + (theme === 'dark' ? 'sun' : 'moon') + '"></i>';
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      App.icons();
    }
  };

  App.toggleTheme = function () {
    const current = Store.getSettings().theme === 'light' ? 'light' : 'dark';
    Store.saveSettings({ theme: current === 'dark' ? 'light' : 'dark' });
    App.applyTheme();
    App.refresh();
  };

  /* ---------- Rendering lifecycle ---------- */
  App.icons = function () {
    if (global.lucide && typeof global.lucide.createIcons === 'function') {
      global.lucide.createIcons();
    }
  };

  // Registers a page render function. It runs now and again on every refresh.
  App.register = function (fn) {
    renderers.push(fn);
    try {
      fn();
    } catch (err) {
      console.error('Render failed', err);
      App.toast('Something went wrong while displaying this page.', 'danger');
    }
    App.icons();
  };

  App.refresh = function () {
    renderers.forEach(fn => {
      try { fn(); } catch (err) { console.error('Render failed', err); }
    });
    App.icons();
  };

  /* ---------- UI helpers ---------- */
  App.emptyState = function (icon, title, text, actionHtml) {
    return '<div class="empty-state">' +
      '<div class="empty-icon"><i data-lucide="' + icon + '"></i></div>' +
      '<h4>' + App.esc(title) + '</h4>' +
      '<p class="muted">' + App.esc(text) + '</p>' +
      (actionHtml || '') +
      '</div>';
  };

  App.statCard = function (opts) {
    return '<div class="card stat-card fade-in">' +
      '<div class="stat-icon"><i data-lucide="' + opts.icon + '"></i></div>' +
      '<div class="stat-body">' +
      '<div class="stat-label">' + App.esc(opts.label) + '</div>' +
      '<div class="stat-value">' + opts.value + '</div>' +
      '<div class="stat-sub">' + App.esc(opts.sub || '') + '</div>' +
      '</div></div>';
  };

  App.toast = function (message, type) {
    let wrap = document.getElementById('toastContainer');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toastContainer';
      wrap.className = 'toast-container';
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'success');
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  };

  App.modal = function (opts) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML =
      '<div class="modal' + (opts.wide ? ' modal-wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + App.esc(opts.title) + '">' +
      '<div class="modal-header"><h3>' + App.esc(opts.title) + '</h3>' +
      '<button class="icon-btn" data-close aria-label="Close"><i data-lucide="x"></i></button></div>' +
      '<div class="modal-body">' + (opts.html || '') + '</div>' +
      '<div class="modal-actions"></div></div>';
    document.body.appendChild(backdrop);

    function onKey(e) { if (e.key === 'Escape') close(); }
    function close() {
      if (!backdrop.isConnected) return;
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      if (opts.onDismiss) opts.onDismiss();
    }

    document.addEventListener('keydown', onKey);
    const actionsEl = backdrop.querySelector('.modal-actions');
    (opts.actions || []).forEach(a => {
      const b = document.createElement('button');
      b.className = 'btn ' + (a.className || '');
      b.textContent = a.label;
      b.addEventListener('click', () => (a.onClick ? a.onClick(close) : close()));
      actionsEl.appendChild(b);
    });
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop || e.target.closest('[data-close]')) close();
    });

    App.icons();
    if (opts.onOpen) opts.onOpen(backdrop.querySelector('.modal-body'), close);
    return { close, el: backdrop };
  };

  App.confirm = function (opts) {
    return new Promise(resolve => {
      App.modal({
        title: opts.title || 'Are you sure?',
        html: '<p class="muted">' + App.esc(opts.message || '') + '</p>',
        onDismiss: () => resolve(false),
        actions: [
          { label: 'Cancel', className: 'btn-ghost', onClick: close => { resolve(false); close(); } },
          { label: opts.confirmLabel || 'Confirm', className: opts.danger ? 'btn-danger-solid' : 'btn-primary', onClick: close => { resolve(true); close(); } }
        ]
      });
    });
  };

  App.download = function (filename, content, type) {
    const blob = new Blob([content], { type: type || 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  App.readFile = function (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  /* ---------- Charts (Chart.js) ---------- */
  App.chartTheme = function () {
    const cs = getComputedStyle(document.documentElement);
    const get = v => cs.getPropertyValue(v).trim();
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return {
      text: get('--muted'),
      grid: get('--border'),
      accent: get('--accent'),
      accentSoft: dark ? 'rgba(183, 243, 107, 0.16)' : 'rgba(78, 122, 30, 0.16)',
      second: get('--chart-2') || get('--info'),
      third: get('--chart-3') || get('--warn'),
      info: get('--info'),
      tooltipBg: dark ? 'rgba(15,18,16,0.96)' : 'rgba(255,255,255,0.97)',
      tooltipBorder: dark ? 'rgba(183,243,107,0.24)' : 'rgba(78,122,30,0.24)',
      tooltipTitle: dark ? '#FFFFFF' : '#111512',
      tooltipBody: dark ? '#D7DCD7' : '#5C665D'
    };
  };

  App.chartOptions = function (theme, beginAtZero) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 550, easing: 'easeOutQuart' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: theme.text, boxWidth: 12, boxHeight: 12, usePointStyle: true, font: { size: 12, weight: 600 } } },
        tooltip: {
          backgroundColor: theme.tooltipBg || 'rgba(15,18,16,0.96)',
          borderColor: theme.tooltipBorder || 'rgba(183,243,107,0.24)',
          borderWidth: 1,
          titleColor: theme.tooltipTitle || '#fff',
          bodyColor: theme.tooltipBody || '#D7DCD7',
          padding: 12,
          cornerRadius: 12,
          displayColors: true
        }
      },
      scales: {
        x: { ticks: { color: theme.text, font: { size: 11 } }, grid: { color: 'transparent' } },
        y: { ticks: { color: theme.text, font: { size: 11 }, maxTicksLimit: 6 }, grid: { color: theme.grid }, beginAtZero: !!beginAtZero, border: { display: false } }
      }
    };
  };

  // Draws a chart into a container, or shows an empty state when there is no data.
  App.drawChart = function (containerId, key, hasData, buildConfig, emptyHtml) {
    const box = document.getElementById(containerId);
    if (!box) return;
    if (charts[key]) {
      charts[key].destroy();
      delete charts[key];
    }
    if (!hasData) {
      box.innerHTML = emptyHtml;
      box.classList.remove('is-loading');
      App.icons();
      return;
    }
    if (!global.Chart) {
      box.innerHTML = '<p class="muted">The chart library could not load. Check your internet connection and refresh.</p>';
      return;
    }
    // Brief skeleton shimmer only while chart canvas is prepared.
    box.classList.add('is-loading');
    box.innerHTML = '<div class="skel" style="height:100%;min-height:200px" aria-hidden="true"></div><canvas aria-label="Chart" style="display:none"></canvas>';
    const canvas = box.querySelector('canvas');
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!box.isConnected) return;
        const skel = box.querySelector('.skel');
        if (skel) skel.remove();
        canvas.style.display = '';
        try {
          charts[key] = new global.Chart(canvas, buildConfig(App.chartTheme()));
        } catch (err) {
          box.innerHTML = '<p class="muted">Chart could not be drawn.</p>';
        }
        box.classList.remove('is-loading');
      }, 140);
    });
  };

  /* ---------- Startup ---------- */
  App.init = function () {
    App.applyTheme();
    App.renderShell();
    App.bindShell();
    App.applyTheme();
    App.icons();

    // Keeps other open tabs in sync with the shared data.
    global.addEventListener('storage', e => {
      if (e.key === Store.STORAGE_KEY) App.refresh();
    });
  };

  global.App = App;
  App.init();
})(window);
