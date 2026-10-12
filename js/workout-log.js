/* workout-log.js: start, edit, finish and cancel workouts. Uses the shared
   Store, so saved workouts appear on the calendar, dashboard and reports. */
(function (global) {
  'use strict';

  const { Store, App, GymData } = global;
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);

  let selectedId = null;   // session currently open in the editor
  const timer = { total: 90, remaining: 90, handle: null };

  /* ---------- Helpers ---------- */
  function findSession(data, id) {
    return data.sessions.find(s => s.id === id) || null;
  }

  function newExerciseEntry(exerciseId, plannedEntry) {
    const meta = GymData.exerciseById(exerciseId);
    const setCount = plannedEntry ? plannedEntry.sets : 3;
    return {
      id: Store.uid('ex'),
      exerciseId,
      name: meta.name,
      category: meta.category,
      repMin: plannedEntry ? plannedEntry.repMin : 8,
      repMax: plannedEntry ? plannedEntry.repMax : 12,
      restSec: plannedEntry ? plannedEntry.restSec : 90,
      sets: Array.from({ length: setCount }, () => ({ id: Store.uid('set'), weight: null, reps: null, done: false }))
    };
  }

  function createSession(opts) {
    const session = {
      date: opts.date,
      title: opts.title || 'Workout',
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationSec: null,
      splitLabel: opts.splitLabel || '',
      notes: '',
      exercises: opts.exercises || []
    };
    return Store.saveSession(session);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function beep() {
    try {
      const Ctx = global.AudioContext || global.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.05;
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) { /* sound is optional */ }
  }

  /* ---------- Rest timer ---------- */
  function renderTimer() {
    const el = $('timerDisplay');
    el.textContent = formatTime(timer.remaining);
    el.classList.toggle('done', timer.remaining === 0 && timer.total > 0);
    const running = !!timer.handle;
    $('timerToggle').innerHTML = running
      ? '<i data-lucide="pause"></i> <span>Pause</span>'
      : '<i data-lucide="play"></i> <span>' + (timer.remaining === 0 ? 'Restart' : 'Start') + '</span>';
    App.icons();
  }

  function setTimerTotal(sec) {
    stopTimer();
    timer.total = sec;
    timer.remaining = sec;
    renderTimer();
  }

  function startTimer() {
    if (timer.handle) return;
    if (timer.remaining === 0) timer.remaining = timer.total;
    timer.handle = setInterval(() => {
      timer.remaining = Math.max(0, timer.remaining - 1);
      if (timer.remaining === 0) {
        stopTimer();
        beep();
        App.toast('Rest complete. Start your next set.', 'info');
      }
      renderTimer();
    }, 1000);
    renderTimer();
  }

  function stopTimer() {
    if (timer.handle) clearInterval(timer.handle);
    timer.handle = null;
  }

  /* ---------- Start card ---------- */
  function renderStartCard(data) {
    const date = $('startDate').value || Store.todayISO();
    const active = data.sessions.find(s => s.status === 'active');
    const split = App.plannedSplit(date, data);
    const notice = $('startNotice');

    $('startFromPlan').disabled = !!active || !split;
    $('startFromPlan').querySelector('span').textContent = split ? 'Start ' + split.label : 'Start from plan';
    $('startEmpty').disabled = !!active;

    if (active) {
      notice.className = 'notice warn';
      notice.innerHTML = '<i data-lucide="timer"></i><span>A workout is already in progress (' +
        App.esc(active.title) + '). Finish or cancel it before starting another.</span>';
    } else if (!split) {
      notice.className = 'notice info';
      notice.innerHTML = '<i data-lucide="info"></i><span>No plan is scheduled for this weekday. Start an empty workout, or create a plan to get suggested exercises.</span>';
    } else {
      notice.className = 'notice hidden';
      notice.innerHTML = '';
    }
    App.icons();
  }

  function startFromPlan() {
    const data = Store.load();
    const date = $('startDate').value || Store.todayISO();
    const split = App.plannedSplit(date, data);
    if (!split) return;
    const session = createSession({
      date,
      title: $('startTitle').value.trim() || split.label,
      splitLabel: split.label,
      exercises: split.exercises.map(pe => newExerciseEntry(pe.exerciseId, pe))
    });
    selectedId = session.id;
    App.toast('Workout started with ' + split.label + '.');
    App.refresh();
  }

  function startEmpty() {
    const date = $('startDate').value || Store.todayISO();
    const session = createSession({ date, title: $('startTitle').value.trim() || 'Workout' });
    selectedId = session.id;
    App.toast('Empty workout started. Add exercises below.');
    App.refresh();
  }

  /* ---------- Editor ---------- */
  function renderEditor(data) {
    const box = $('editor');
    const session = selectedId ? findSession(data, selectedId) : null;

    if (!session) {
      box.innerHTML = App.emptyState('notebook-pen', 'No workout open',
        'Start a workout above, or select Edit on a past workout to change it.');
      App.icons();
      return;
    }

    const isActive = session.status === 'active';
    const planEntries = (App.plannedSplit(session.date, data) || { exercises: [] }).exercises;
    const volume = Math.round(App.sessionVolume(session));
    const setsDone = App.sessionSetCount(session);

    const headerHtml =
      '<div class="card-header">' +
      '<div><h3 class="card-title">' + (isActive ? 'Current workout' : 'Editing past workout') + '</h3>' +
      '<p class="card-sub">' + (isActive ? 'Changes save automatically as you type.' : 'Edits save when you select Save changes.') + '</p></div>' +
      '<span class="badge ' + (isActive ? 'badge-warn' : 'badge-accent') + '">' + (isActive ? 'In progress' : 'Completed') + '</span>' +
      '</div>';

    const detailsHtml =
      '<div class="form-grid">' +
      '<div class="field"><label for="sessionTitle">Title</label><input type="text" id="sessionTitle" maxlength="60" value="' + App.esc(session.title) + '" /></div>' +
      '<div class="field"><label for="sessionDate">Date</label><input type="date" id="sessionDate" value="' + session.date + '" /></div>' +
      '</div>' +
      '<div class="session-meta"><span>Sets recorded: <strong>' + setsDone + '</strong></span>' +
      '<span>Volume: <strong>' + App.fmt(volume, 0) + ' kg</strong></span>' +
      (session.splitLabel ? '<span>Split: <strong>' + App.esc(session.splitLabel) + '</strong></span>' : '') + '</div>' +
      '<div class="field section-gap"><label for="sessionNotes">Notes</label><textarea id="sessionNotes" maxlength="500" placeholder="How did it feel? Sleep, energy, form cues...">' + App.esc(session.notes || '') + '</textarea></div>';

    const exercisesHtml = session.exercises.length
      ? session.exercises.map(ex => exerciseBlockHtml(ex, planEntries, session, data)).join('')
      : App.emptyState('dumbbell', 'No exercises yet', 'Add an exercise below to begin logging sets.');

    const addHtml =
      '<div class="btn-row section-gap">' +
      '<select id="addExerciseSelect" style="flex:1;min-width:220px" aria-label="Choose exercise to add">' + exerciseOptions() + '</select>' +
      '<button class="btn" data-action="add-exercise"><i data-lucide="plus"></i> Add exercise</button>' +
      '</div>';

    const footerHtml = isActive
      ? '<div class="btn-row section-gap" style="justify-content:flex-end">' +
        '<button class="btn btn-danger" data-action="cancel-session"><i data-lucide="x"></i> Cancel workout</button>' +
        '<button class="btn btn-primary" data-action="finish-session"><i data-lucide="circle-check"></i> Finish workout</button>' +
        '</div>'
      : '<div class="btn-row section-gap" style="justify-content:flex-end">' +
        '<button class="btn btn-danger" data-action="delete-session"><i data-lucide="trash-2"></i> Delete workout</button>' +
        '<button class="btn btn-primary" data-action="save-session"><i data-lucide="save"></i> Save changes</button>' +
        '</div>';

    box.innerHTML = headerHtml + detailsHtml + '<div class="section-gap">' + exercisesHtml + '</div>' + addHtml + footerHtml;
    App.icons();
  }

  function exerciseOptions() {
    return GymData.CATEGORIES.map(cat =>
      '<optgroup label="' + App.esc(cat.label) + '">' +
      GymData.EXERCISES.filter(e => e.category === cat.id)
        .map(e => '<option value="' + e.id + '">' + App.esc(e.name) + '</option>').join('') +
      '</optgroup>').join('');
  }

  function exerciseBlockHtml(ex, planEntries, session, data) {
    const planned = planEntries.find(p => p.exerciseId === ex.exerciseId);
    const hint = App.suggestion(ex.exerciseId, ex.repMax, data, session.id);
    const setRows = ex.sets.map((set, i) =>
      '<div class="set-row" data-set="' + set.id + '">' +
      '<span class="set-index">' + (i + 1) + '</span>' +
      '<input type="number" inputmode="decimal" min="0" step="0.5" data-field="weight" aria-label="Weight in kg for set ' + (i + 1) + '" value="' + (set.weight === null ? '' : set.weight) + '" placeholder="kg" />' +
      '<input type="number" inputmode="numeric" min="0" step="1" data-field="reps" aria-label="Reps for set ' + (i + 1) + '" value="' + (set.reps === null ? '' : set.reps) + '" placeholder="reps" />' +
      '<label class="center" style="display:flex;justify-content:center"><input type="checkbox" data-field="done" aria-label="Set ' + (i + 1) + ' done" ' + (set.done ? 'checked' : '') + ' /></label>' +
      '<button class="icon-btn danger" data-action="remove-set" aria-label="Remove set ' + (i + 1) + '" style="width:36px;height:36px"><i data-lucide="x"></i></button>' +
      '</div>').join('');

    return '<div class="exercise-block" data-ex="' + ex.id + '">' +
      '<div class="exercise-head"><div style="min-width:0">' +
      '<h4>' + App.esc(ex.name) + '</h4>' +
      '<p class="card-sub">' + App.esc(ex.category) + ' · target ' + ex.repMin + '–' + ex.repMax + ' reps · rest ' + ex.restSec + 's' +
      (planned ? ' · from plan' : '') + '</p>' +
      '</div>' +
      '<button class="icon-btn danger" data-action="remove-exercise" aria-label="Remove ' + App.esc(ex.name) + '"><i data-lucide="trash-2"></i></button>' +
      '</div>' +
      '<div class="suggestion ' + hint.type + '"><i data-lucide="' + (hint.type === 'increase' ? 'trending-up' : hint.type === 'hold' ? 'target' : 'info') + '"></i><span>' + App.esc(hint.text) + '</span></div>' +
      '<div class="set-table">' +
      '<div class="set-head"><span></span><span>Weight (kg)</span><span>Reps</span><span class="center">Done</span><span></span></div>' +
      setRows +
      '</div>' +
      '<button class="btn btn-sm" data-action="add-set"><i data-lucide="plus"></i> Add set</button>' +
      '</div>';
  }

  /* ---------- History ---------- */
  function renderHistory(data) {
    const box = $('history');
    const past = data.sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date) || String(b.endedAt || '').localeCompare(String(a.endedAt || '')))
      .slice(0, 20);

    if (!past.length) {
      box.innerHTML = App.emptyState('history', 'No completed workouts yet', 'Finished workouts will be listed here so you can edit them later.');
      App.icons();
      return;
    }

    box.innerHTML = '<div class="list">' + past.map(s =>
      '<div class="list-item">' +
      '<div class="list-icon"><i data-lucide="notebook-pen"></i></div>' +
      '<div class="list-main"><div class="list-title">' + App.esc(s.title) + '</div>' +
      '<div class="list-sub">' + App.esc(App.formatDate(s.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })) +
      ' · ' + App.sessionSetCount(s) + ' sets · ' + App.fmt(Math.round(App.sessionVolume(s)), 0) + ' kg' +
      (s.durationSec ? ' · ' + Math.round(s.durationSec / 60) + ' min' : '') + '</div></div>' +
      '<button class="btn btn-sm" data-edit="' + s.id + '"><i data-lucide="pencil"></i> Edit</button>' +
      '</div>').join('') + '</div>';
    App.icons();
  }

  /* ---------- Editor actions ---------- */
  function currentSession() {
    return selectedId ? findSession(Store.load(), selectedId) : null;
  }

  function persist(session) {
    Store.saveSession(session);
  }

  function onEditorChange(e) {
    const el = e.target;
    const session = currentSession();
    if (!session) return;

    if (el.id === 'sessionTitle') { session.title = el.value.trim() || 'Workout'; persist(session); return; }
    if (el.id === 'sessionDate') {
      if (Store.isISODate(el.value)) { session.date = el.value; persist(session); App.refresh(); }
      return;
    }
    if (el.id === 'sessionNotes') { session.notes = el.value.slice(0, 500); persist(session); return; }

    const field = el.dataset.field;
    if (!field) return;
    const exBlock = el.closest('[data-ex]');
    const setRow = el.closest('[data-set]');
    const ex = session.exercises.find(x => x.id === exBlock.dataset.ex);
    const set = ex && ex.sets.find(s => s.id === setRow.dataset.set);
    if (!set) return;

    if (field === 'weight') set.weight = App.toNumber(el.value) === null ? null : Math.max(0, App.toNumber(el.value));
    if (field === 'reps') set.reps = App.toNumber(el.value) === null ? null : Math.max(0, Math.round(App.toNumber(el.value)));
    if (field === 'done') {
      set.done = el.checked;
      if (el.checked) setTimerTotal(ex.restSec || 90), startTimer();
    }
    persist(session);
    if (field === 'done') App.refresh();
  }

  function onEditorClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const session = currentSession();
    if (!session) return;

    if (action === 'add-exercise') {
      const id = $('addExerciseSelect').value;
      const planned = (App.plannedSplit(session.date, Store.load()) || { exercises: [] }).exercises.find(p => p.exerciseId === id);
      session.exercises.push(newExerciseEntry(id, planned));
      persist(session);
      App.refresh();
      return;
    }

    if (action === 'remove-exercise') {
      const exId = btn.closest('[data-ex]').dataset.ex;
      App.confirm({ title: 'Remove exercise?', message: 'Its sets from this workout will be removed.', confirmLabel: 'Remove', danger: true })
        .then(ok => {
          if (!ok) return;
          session.exercises = session.exercises.filter(x => x.id !== exId);
          persist(session);
          App.refresh();
        });
      return;
    }

    const exId = btn.closest('[data-ex]') && btn.closest('[data-ex]').dataset.ex;
    const ex = exId && session.exercises.find(x => x.id === exId);

    if (action === 'add-set' && ex) {
      const last = ex.sets[ex.sets.length - 1];
      ex.sets.push({ id: Store.uid('set'), weight: last ? last.weight : null, reps: last ? last.reps : null, done: false });
      persist(session);
      App.refresh();
      return;
    }

    if (action === 'remove-set' && ex) {
      const setId = btn.closest('[data-set]').dataset.set;
      ex.sets = ex.sets.filter(s => s.id !== setId);
      persist(session);
      App.refresh();
      return;
    }

    if (action === 'finish-session') {
      const endedAt = new Date();
      session.status = 'completed';
      session.endedAt = endedAt.toISOString();
      session.durationSec = session.startedAt
        ? Math.max(0, Math.round((endedAt - new Date(session.startedAt)) / 1000))
        : null;
      persist(session);
      stopTimer();
      App.toast('Workout completed. It now appears on your calendar and dashboard.');
      selectedId = null;
      App.refresh();
      return;
    }

    if (action === 'cancel-session') {
      App.confirm({ title: 'Cancel this workout?', message: 'Everything logged in this session will be discarded.', confirmLabel: 'Cancel workout', danger: true })
        .then(ok => {
          if (!ok) return;
          Store.deleteSession(session.id);
          stopTimer();
          selectedId = null;
          App.toast('Workout cancelled.', 'info');
          App.refresh();
        });
      return;
    }

    if (action === 'save-session') {
      persist(session);
      App.toast('Changes saved.');
      App.refresh();
      return;
    }

    if (action === 'delete-session') {
      App.confirm({ title: 'Delete this workout?', message: 'This removes the workout permanently from this browser.', confirmLabel: 'Delete', danger: true })
        .then(ok => {
          if (!ok) return;
          Store.deleteSession(session.id);
          selectedId = null;
          App.toast('Workout deleted.', 'info');
          App.refresh();
        });
    }
  }

  function onHistoryClick(e) {
    const btn = e.target.closest('[data-edit]');
    if (!btn) return;
    selectedId = btn.dataset.edit;
    App.refresh();
    $('editorCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- Init ---------- */
  function initFromUrl() {
    const data = Store.load();
    const editId = params.get('edit');
    const exerciseId = params.get('exercise');
    const dateParam = params.get('date');

    if (dateParam && Store.isISODate(dateParam)) $('startDate').value = dateParam;
    else $('startDate').value = Store.todayISO();

    const active = data.sessions.find(s => s.status === 'active');
    if (editId && findSession(data, editId)) selectedId = editId;
    else if (active) selectedId = active.id;

    if (exerciseId && GymData.EXERCISE_BY_ID[exerciseId]) {
      let target = selectedId ? findSession(Store.load(), selectedId) : null;
      if (!target || target.status !== 'active') {
        target = createSession({ date: Store.todayISO(), title: 'Workout' });
      }
      const planned = (App.plannedSplit(target.date, Store.load()) || { exercises: [] }).exercises.find(p => p.exerciseId === exerciseId);
      target.exercises.push(newExerciseEntry(exerciseId, planned));
      Store.saveSession(target);
      selectedId = target.id;
      App.toast(GymData.exerciseById(exerciseId).name + ' added to your workout.');
    }

    if (params.toString()) history.replaceState(null, '', location.pathname);
  }

  function bind() {
    $('startDate').addEventListener('change', () => App.refresh());
    $('startFromPlan').addEventListener('click', startFromPlan);
    $('startEmpty').addEventListener('click', startEmpty);
    $('editor').addEventListener('change', onEditorChange);
    $('editor').addEventListener('click', onEditorClick);
    $('history').addEventListener('click', onHistoryClick);

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => setTimerTotal(Number(btn.dataset.preset)));
    });
    $('timerToggle').addEventListener('click', () => {
      if (timer.handle) stopTimer(); else startTimer();
      renderTimer();
    });
    $('timerReset').addEventListener('click', () => setTimerTotal(timer.total));
  }

  initFromUrl();
  bind();
  renderTimer();
  App.register(function renderWorkoutLog() {
    const data = Store.load();
    renderStartCard(data);
    renderEditor(data);
    renderHistory(data);
  });
})(window);
