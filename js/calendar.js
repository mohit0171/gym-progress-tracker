/* calendar.js: monthly calendar (completed, planned, missed, rest, active). */
(function (global) {
  'use strict';
  const { Store, App } = global;
  const $ = id => document.getElementById(id);
  let viewYear, viewMonth, selectedDate = null;
  const STATUS_META = {
    completed: { label: 'Completed' },
    planned: { label: 'Planned' },
    missed: { label: 'Missed' },
    active: { label: 'In progress' },
    rest: { label: 'Rest day' }
  };
  function statusDot(status) {
    const style = (status === 'planned')
      ? 'border:1px dashed var(--info);background:transparent'
      : status === 'completed' ? 'background:var(--accent)'
      : status === 'missed' ? 'background:var(--danger)'
      : status === 'active' ? 'background:var(--warn)'
      : 'background:var(--surface-2)';
    return '<span class="cal-dot" title="' + (STATUS_META[status]||{}).label + '" style="' + style + '"></span>';
  }
  function titleFor() {
    return new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  function startOfGrid() {
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(viewYear, viewMonth, 1 - offset);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  function renderGrid(data, today) {
    const grid = $('calGrid');
    $('calTitle').textContent = titleFor();
    const start = startOfGrid();
    let html = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = App.toISO(d);
      const status = App.dayStatus(iso, data, today);
      const inMonth = d.getMonth() === viewMonth;
      const split = App.plannedSplit(iso, data);
      const tip = ((STATUS_META[status]||{}).label || status) + (split ? ' - ' + split.label : '');
      html += '<button class="cal-day' + (inMonth ? '' : ' dim') + (iso === today ? ' today' : '') +
        (iso === selectedDate ? ' selected' : '') + '" data-date="' + iso + '"' +
        ' aria-label="' + App.esc(App.formatDate(iso) + ' - ' + tip) + '" title="' + App.esc(tip) + '">' +
        '<span class="cal-num">' + d.getDate() + '</span>' +
        '<span class="cal-marks">' + statusDot(status) + '</span>' +
        (split && inMonth ? '<span class="cal-tag">' + App.esc(split.label) + '</span>' : '') + '</button>';
    }
    grid.innerHTML = html;
  }
  function renderDetails(data) {
    const box = $('dayDetails');
    const iso = selectedDate;
    if (!iso) {
      box.innerHTML = '<div class="card-header"><div><h3 class="card-title">Day details</h3>' +
        '<p class="card-sub">Select a date to see sessions.</p></div></div>' +
        App.emptyState('calendar-days', 'No date selected', 'Tap any day to see details.');
      App.icons();
      return;
    }
    const today = Store.todayISO();
    const status = App.dayStatus(iso, data, today);
    const meta = STATUS_META[status] || STATUS_META.rest;
    const split = App.plannedSplit(iso, data);
    const sessions = data.sessions.filter(s => s.date === iso);
    const trainDay = App.isTrainingDay(iso, data.profile);
    let html = '<div class="card-header"><div><h3 class="card-title">' +
      App.esc(App.formatDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })) + '</h3>' +
      '<p class="card-sub"><span class="badge">' + meta.label + '</span> ' +
      (trainDay ? 'Training day' : 'Rest day') + (split ? ' - ' + App.esc(split.label) : '') + '</p></div></div>';
    html += '<div class="detail-block">';
    if (split) {
      html += '<h4>Scheduled: ' + App.esc(split.label) + '</h4>';
      html += split.exercises.map(pe => {
        const nm = global.GymData ? global.GymData.exerciseById(pe.exerciseId).name : pe.exerciseId;
        return '<div class="detail-exercise"><span>' + App.esc(nm) + '</span>' +
          '<span class="muted">' + pe.sets + ' x ' + pe.repMin + '-' + pe.repMax + '</span></div>';
      }).join('');
    } else if (trainDay) {
      html += '<p class="muted">Training day with no saved split. Generate a plan first.</p>';
    } else {
      html += '<p class="muted">Rest day. No training scheduled.</p>';
    }
    html += '</div><div class="detail-block"><h4>Sessions (' + sessions.length + ')</h4>';
    if (!sessions.length) {
      html += '<p class="muted">No sessions logged for this date.</p>';
    } else {
      html += sessions.map(s => '<div class="detail-exercise"><span><strong>' + App.esc(s.title || 'Workout') + '</strong> ' +
        '<span class="badge">' + App.esc(s.status) + '</span><br><span class="muted small">' +
        s.exercises.length + ' exercises - ' + App.fmt(Math.round(App.sessionVolume(s)), 0) + ' kg</span></span>' +
        '<span><a class="btn btn-sm" href="workout-log.html?edit=' + s.id + '">Open</a></span></div>').join('');
    }
    html += '</div><div class="btn-row section-gap"><a class="btn btn-primary" href="workout-log.html?date=' + iso + '">' +
      '<i data-lucide="plus"></i> Log workout for this day</a></div>';
    box.innerHTML = html;
    App.icons();
  }
  function shift(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    App.refresh();
  }
  function bind() {
    $('calPrev').addEventListener('click', () => shift(-1));
    $('calNext').addEventListener('click', () => shift(1));
    $('calToday').addEventListener('click', () => {
      const t = new Date();
      viewYear = t.getFullYear();
      viewMonth = t.getMonth();
      selectedDate = Store.todayISO();
      App.refresh();
    });
    $('calGrid').addEventListener('click', e => {
      const btn = e.target.closest('[data-date]');
      if (!btn) return;
      selectedDate = btn.dataset.date;
      App.refresh();
    });
  }
  function initDate() {
    const t = new Date();
    viewYear = t.getFullYear();
    viewMonth = t.getMonth();
    selectedDate = Store.todayISO();
  }
  initDate();
  bind();
  App.register(function renderCalendar() {
    const data = Store.load();
    renderGrid(data, Store.todayISO());
    renderDetails(data);
  });
})(window);
