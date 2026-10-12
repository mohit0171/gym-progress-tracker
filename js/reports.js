/* reports.js: monthly statistics computed from saved records only. */
(function (global) {
  'use strict';

  const { Store, App, GymData } = global;
  const $ = id => document.getElementById(id);
  const today = Store.todayISO();

  function completedIn(data, start, end) {
    return data.sessions.filter(s => s.status === 'completed' && s.date >= start && s.date <= end);
  }

  // Heaviest recorded weight for an exercise across a set of sessions.
  function bestWeight(sessions, exerciseId) {
    let best = null;
    sessions.forEach(s => s.exercises.forEach(ex => {
      if (ex.exerciseId !== exerciseId) return;
      ex.sets.forEach(set => {
        if (!App.isRecorded(set) || typeof set.weight !== 'number' || set.weight <= 0) return;
        if (!best || set.weight > best.weight) best = { weight: set.weight, reps: set.reps, date: s.date };
      });
    }));
    return best;
  }

  function computeMonth(data, ym) {
    const range = App.monthRange(ym);
    const sessions = completedIn(data, range.start, range.end);
    const scheduleFrom = data.plan && data.plan.createdAt && data.plan.createdAt > range.start ? data.plan.createdAt : range.start;
    const scheduleTo = range.end < today ? range.end : today;
    const planned = App.countTrainingDays(scheduleFrom, scheduleTo, data.profile);

    const volume = sessions.reduce((t, s) => t + App.sessionVolume(s), 0);
    const sets = sessions.reduce((t, s) => t + App.sessionSetCount(s), 0);
    const reps = sessions.reduce((t, s) => t + s.exercises.reduce((r, ex) => r + ex.sets.filter(App.isRecorded).reduce((a, set) => a + set.reps, 0), 0), 0);
    const consistency = planned ? Math.min(100, Math.round((sessions.length / planned) * 100)) : null;

    const weights = Store.getMeasurements().filter(m => typeof m.weight === 'number');
    const before = weights.filter(m => m.date < range.start);
    const inMonth = weights.filter(m => m.date >= range.start && m.date <= range.end);
    const startW = before.length ? before[before.length - 1].weight : (inMonth.length ? inMonth[0].weight : null);
    const endW = inMonth.length ? inMonth[inMonth.length - 1].weight : null;
    const weightChange = startW !== null && endW !== null ? endW - startW : null;

    // Personal records: heaviest weight this month that beats everything logged before it.
    const priorSessions = data.sessions.filter(s => s.status === 'completed' && s.date < range.start);
    const ids = new Set();
    sessions.forEach(s => s.exercises.forEach(ex => ids.add(ex.exerciseId)));
    const prs = [];
    ids.forEach(id => {
      const monthBest = bestWeight(sessions, id);
      const priorBest = bestWeight(priorSessions, id);
      if (monthBest && priorBest && monthBest.weight > priorBest.weight) {
        prs.push({ id, weight: monthBest.weight, reps: monthBest.reps, date: monthBest.date, previous: priorBest.weight });
      }
    });
    prs.sort((a, b) => b.weight - a.weight);

    return { ym, range, sessions, planned, volume, sets, reps, consistency, weightChange, prs, startW, endW };
  }

  function deltaText(curr, prev, unit, digits) {
    if (curr === null || prev === null) return '<span class="delta-flat">—</span>';
    const diff = curr - prev;
    if (Math.abs(diff) < 0.05) return '<span class="delta-flat">No change</span>';
    const cls = diff > 0 ? 'delta-up' : 'delta-down';
    return '<span class="' + cls + '">' + (diff > 0 ? '+' : '') + App.fmt(diff, digits) + (unit ? ' ' + unit : '') + '</span>';
  }

  function renderSummary(m) {
    const cards = [
      App.statCard({
        icon: 'calendar-check',
        label: 'Completed workouts',
        value: m.sessions.length,
        sub: m.planned ? m.planned + ' scheduled' : 'No schedule set'
      }),
      App.statCard({
        icon: 'target',
        label: 'Consistency',
        value: m.consistency === null ? '—' : m.consistency + '%',
        sub: 'Completed vs scheduled days'
      }),
      App.statCard({
        icon: 'activity',
        label: 'Training volume',
        value: App.fmt(Math.round(m.volume), 0) + ' kg',
        sub: m.sets + ' sets · ' + m.reps + ' reps'
      }),
      App.statCard({
        icon: 'award',
        label: 'Personal records',
        value: m.prs.length,
        sub: m.weightChange === null ? 'Body weight change: no data' :
          'Body weight ' + (m.weightChange > 0 ? '+' : '') + App.fmt(m.weightChange) + ' kg'
      })
    ];
    $('summaryCards').innerHTML = cards.join('');
  }

  function renderComparison(curr, prev) {
    $('compareSub').textContent = App.monthLabel(curr.ym) + ' compared with ' + App.monthLabel(prev.ym);
    const rows = [
      ['Completed workouts', curr.sessions.length, prev.sessions.length, '', 0],
      ['Planned workouts', curr.planned, prev.planned, '', 0],
      ['Consistency', curr.consistency, prev.consistency, '%', 0],
      ['Training volume', Math.round(curr.volume), Math.round(prev.volume), 'kg', 0],
      ['Sets logged', curr.sets, prev.sets, '', 0],
      ['Personal records', curr.prs.length, prev.prs.length, '', 0],
      ['Body weight (end of month)', curr.endW, prev.endW, 'kg', 1]
    ];
    $('compareBody').innerHTML = rows.map(r => {
      const hasVals = r[1] !== null && r[2] !== null;
      return '<tr><td>' + r[0] + '</td>' +
        '<td>' + (r[1] === null ? '—' : App.fmt(r[1], r[4]) + (r[3] ? ' ' + r[3] : '')) + '</td>' +
        '<td>' + (r[2] === null ? '—' : App.fmt(r[2], r[4]) + (r[3] ? ' ' + r[3] : '')) + '</td>' +
        '<td>' + (hasVals ? deltaText(r[1], r[2], r[3], r[4]) : '<span class="delta-flat">—</span>') + '</td></tr>';
    }).join('');
  }

  function renderPRs(m) {
    const box = $('prList');
    if (!m.prs.length) {
      box.innerHTML = App.emptyState('award', 'No personal records this month',
        'A PR is recorded when you lift more weight on an exercise than you have ever logged before.');
      App.icons();
      return;
    }
    box.innerHTML = m.prs.map(pr => {
      const ex = GymData.exerciseById(pr.id);
      return '<div class="list-item"><div class="list-icon"><i data-lucide="award"></i></div>' +
        '<div class="list-main"><div class="list-title">' + App.esc(ex.name) + '</div>' +
        '<div class="list-sub">' + App.fmt(pr.weight) + ' kg × ' + pr.reps + ' · previous best ' + App.fmt(pr.previous) + ' kg · ' +
        App.esc(App.formatDate(pr.date, { month: 'short', day: 'numeric' })) + '</div></div></div>';
    }).join('');
    App.icons();
  }

  function renderBodyChanges(m) {
    const box = $('bodyChanges');
    const entries = Store.getMeasurements().filter(e => e.date >= m.range.start && e.date <= m.range.end);
    if (!entries.length) {
      box.innerHTML = App.emptyState('ruler', 'No measurements this month', 'Record measurements on the Body Progress page.');
      App.icons();
      return;
    }
    const keys = [['weight', 'Weight', 'kg'], ['bodyFat', 'Body fat', '%'], ['waist', 'Waist', 'cm'], ['chest', 'Chest', 'cm'], ['arms', 'Arms', 'cm']];
    box.innerHTML = '<table class="data-table"><thead><tr><th>Measure</th><th>First</th><th>Latest</th></tr></thead><tbody>' +
      keys.map(([k, label, unit]) => {
        const vals = entries.filter(e => typeof e[k] === 'number');
        if (!vals.length) return '';
        return '<tr><td>' + label + '</td><td>' + App.fmt(vals[0][k]) + ' ' + unit + '</td><td>' + App.fmt(vals[vals.length - 1][k]) + ' ' + unit + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function renderExerciseSelect(data) {
    const select = $('exerciseSelect');
    const current = select.value;
    const ids = new Set();
    data.sessions.filter(s => s.status === 'completed').forEach(s => s.exercises.forEach(ex => ids.add(ex.exerciseId)));
    if (!ids.size) {
      select.innerHTML = '<option value="">No history yet</option>';
      select.disabled = true;
      return;
    }
    select.disabled = false;
    select.innerHTML = Array.from(ids).map(id =>
      '<option value="' + id + '">' + App.esc(GymData.exerciseById(id).name) + '</option>').join('');
    select.value = ids.has(current) ? current : select.options[0].value;
  }

  function renderExerciseHistory(data) {
    const box = $('exerciseHistory');
    const id = $('exerciseSelect').value;
    if (!id) {
      box.innerHTML = App.emptyState('dumbbell', 'No exercise history', 'Complete a workout to see performance history here.');
      App.icons();
      return;
    }
    const rows = data.sessions
      .filter(s => s.status === 'completed' && s.exercises.some(e => e.exerciseId === id))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(s => {
        const ex = s.exercises.find(e => e.exerciseId === id);
        const recorded = ex.sets.filter(App.isRecorded);
        const best = recorded.reduce((a, b) => ((b.weight || 0) > (a.weight || 0) ? b : a), recorded[0] || null);
        const volume = recorded.reduce((t, set) => t + (set.weight || 0) * set.reps, 0);
        return '<tr><td>' + App.esc(App.formatDate(s.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</td>' +
          '<td>' + (best ? App.fmt(best.weight || 0) + ' kg × ' + best.reps : '—') + '</td>' +
          '<td>' + recorded.length + '</td>' +
          '<td>' + App.fmt(Math.round(volume), 0) + ' kg</td></tr>';
      }).join('');
    box.innerHTML = '<table class="data-table"><thead><tr><th>Date</th><th>Best set</th><th>Sets</th><th>Volume</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function onExport() {
    App.download('gym-progress-backup-' + today + '.json', Store.exportBackup(), 'application/json');
    App.toast('Backup downloaded.');
  }

  async function onImport(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const ok = await App.confirm({
      title: 'Import backup?',
      message: 'The backup replaces the data currently stored in this browser. Export a backup first if you want to keep it.',
      confirmLabel: 'Import and replace',
      danger: true
    });
    if (!ok) return;
    try {
      const text = await App.readFile(file);
      const result = Store.importBackup(text);
      App.toast(result.message, result.ok ? 'success' : 'danger');
      App.refresh();
    } catch (err) {
      App.toast('The file could not be read.', 'danger');
    }
  }

  function bind() {
    $('reportMonth').addEventListener('change', () => App.refresh());
    $('exerciseSelect').addEventListener('change', () => App.refresh());
    $('exportBtn').addEventListener('click', onExport);
    $('importBtn').addEventListener('click', () => $('importInput').click());
    $('importInput').addEventListener('change', onImport);
    $('printBtn').addEventListener('click', () => global.print());
  }

  $('reportMonth').value = $('reportMonth').value || today.slice(0, 7);

  App.register(function renderReports() {
    if (!$('reportMonth').value) $('reportMonth').value = today.slice(0, 7);
    const data = Store.load();
    const ym = $('reportMonth').value;
    const curr = computeMonth(data, ym);
    const prev = computeMonth(data, App.shiftMonth(ym, -1));
    renderSummary(curr);
    renderComparison(curr, prev);
    renderPRs(curr);
    renderBodyChanges(curr);
    renderExerciseSelect(data);
    renderExerciseHistory(data);
  });
  bind();
})(window);
