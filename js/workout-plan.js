/* workout-plan.js: generate, edit and save the personalised split. */
(function (global) {
  'use strict';

  const { Store, App, GymData } = global;

  const $ = id => document.getElementById(id);
  let saved = null;   // last saved plan (from storage)
  let draft = null;   // working copy being edited on this page

  /* ---------- Generation ---------- */
  function setsFor(experience, goal, exerciseId) {
    const base = (GymData.EXPERIENCE_LEVELS[experience] || GymData.EXPERIENCE_LEVELS.beginner).sets;
    const endurance = goal === 'fat-loss' || goal === 'endurance';
    return Math.max(2, endurance ? base - 1 : base);
  }

  function resolveExerciseId(templateId) {
    return GymData.EXERCISE_ALIASES[templateId] || templateId;
  }

  function makePlanExercise(planExercise, goal, experience) {
    if (typeof planExercise === 'string') planExercise = { id: planExercise };
    const exerciseId = resolveExerciseId(planExercise.id);
    const isCardio = planExercise.durationMin != null;
    if (isCardio) {
      return {
        exerciseId: exerciseId,
        sets: 1,
        minDuration: planExercise.durationMin,
        maxDuration: GymData.exerciseById(exerciseId).maxDuration || planExercise.durationMin * 2,
        restSec: planExercise.intensity === 'intervals' ? 90 : 45
      };
    }
    const meta = GymData.exerciseById(exerciseId);
    const preset = GymData.GOAL_PRESETS[goal] || GymData.GOAL_PRESETS.hypertrophy;
    const isCompound = GymData.COMPOUND_IDS.has(exerciseId);
    return {
      exerciseId: exerciseId,
      sets: setsFor(experience, goal, exerciseId),
      repMin: isCardio ? planExercise.durationMin * 2 : (planExercise.repMin || preset.min),
      repMax: isCardio ? planExercise.durationMin * 3 : (planExercise.repMax || preset.max),
      restSec: planExercise.restSec || (isCompound ? preset.rest : Math.min(preset.rest, 75))
    };
  }

  function buildPlan(opts) {
    const template = GymData.GOAL_TEMPLATES[opts.goal];
    if (!template) return null;
    const weekdays = (opts.trainingDays || []).slice().sort((a, b) => a - b);
    const templatePicks = GymData.getGoalTrainingDays(template, weekdays.length) || weekdays.map((_, i) => i);
    const splits = templatePicks.map(idx => {
      const day = template.weeks[0][idx];
      return {
        id: Store.uid('split'),
        label: day.label,
        focus: day.focus || '',
        exercises: (day.exercises || []).map(pe => makePlanExercise(pe, opts.goal, opts.experience))
      };
    });
    return {
      createdAt: opts.createdAt,
      goal: opts.goal,
      experience: opts.experience,
      days: weekdays.length,
      trainingDays: weekdays,
      splits
    };
  }

  /* ---------- Form ---------- */
  function fillSelects() {
    $('goal').innerHTML = Object.keys(GymData.GOAL_PRESETS).map(k =>
      '<option value="' + k + '">' + App.esc(GymData.GOAL_PRESETS[k].label) + '</option>').join('');
    $('experience').innerHTML = Object.keys(GymData.EXPERIENCE_LEVELS).map(k =>
      '<option value="' + k + '">' + App.esc(GymData.EXPERIENCE_LEVELS[k].label) + '</option>').join('');
    $('dayChecks').innerHTML = GymData.WEEKDAYS.map((d, i) =>
      '<label class="check-pill"><input type="checkbox" name="trainingDay" value="' + i + '"><span>' + d + '</span></label>').join('');
  }

  function setCheckedDays(list) {
    document.querySelectorAll('input[name="trainingDay"]').forEach(cb => {
      cb.checked = list.includes(Number(cb.value));
    });
  }

  function checkedDays() {
    return Array.from(document.querySelectorAll('input[name="trainingDay"]:checked'))
      .map(cb => Number(cb.value))
      .sort((a, b) => a - b);
  }

  function updateDayHint() {
    const want = Number($('days').value);
    const have = checkedDays().length;
    const hint = $('dayHint');
    hint.textContent = have === want ? 'Selected ' + have + ' of ' + want + ' training days.' : 'Select exactly ' + want + ' days (currently ' + have + ').';
    hint.style.color = have === want ? 'var(--muted)' : 'var(--warn)';
  }

  function loadFormFromStorage() {
    const profile = Store.getProfile();
    $('goal').value = (saved && saved.goal) || profile.goal || 'hypertrophy';
    $('experience').value = (saved && saved.experience) || profile.experience || 'beginner';
    const days = saved ? saved.days : (profile.trainingDays.length >= 2 && profile.trainingDays.length <= 6 ? profile.trainingDays.length : 4);
    $('days').value = String(days);
    setCheckedDays(profile.trainingDays.length ? profile.trainingDays : GymData.DEFAULT_TRAINING_DAYS[days]);
    updateDayHint();
  }

  /* ---------- Editor ---------- */
  function exerciseOptions() {
    return GymData.CATEGORIES.map(cat => {
      const items = GymData.EXERCISES.filter(e => e.category === cat.id);
      return '<optgroup label="' + App.esc(cat.label) + '">' +
        items.map(e => '<option value="' + e.id + '">' + App.esc(e.name) + '</option>').join('') +
        '</optgroup>';
    }).join('');
  }

  function isDirty() {
    return JSON.stringify(draft) !== JSON.stringify(saved);
  }

  function renderEditor() {
    const editor = $('planEditor');
    if (!draft) {
      editor.innerHTML = '<div class="card">' + App.emptyState('clipboard-list', 'No plan yet',
        'Choose a goal, your training days and experience level above, then select Generate plan. You can edit every exercise before saving.') + '</div>';
      App.icons();
      return;
    }

    const trainingLabels = draft.trainingDays.map(i => GymData.WEEKDAYS[i]);
    editor.innerHTML =
      '<div class="card-header"><div><h3 class="card-title">Your split (editable)</h3>' +
      '<p class="card-sub">' + trainingLabels.join(' · ') + ' · ' + App.esc(GymData.GOAL_PRESETS[draft.goal].label) + '</p></div></div>' +
      '<div class="grid grid-2">' +
      draft.splits.map((split, si) => {
        return '<div class="card split-card" data-split="' + si + '">' +
          '<div class="card-header" style="margin-bottom:6px">' +
          '<div class="field" style="flex:1;min-width:180px"><input type="text" class="split-label-input" data-field="label" value="' + App.esc(split.label) + '" aria-label="Split name" maxlength="40" /></div>' +
          '<span class="badge badge-accent">' + App.esc(GymData.WEEKDAYS[draft.trainingDays[si % draft.trainingDays.length]]) + '</span>' +
          '</div>' +
          '<div class="plan-row plan-row-head"><span>Exercise</span><span>Sets</span><span>Min reps</span><span>Max reps</span><span>Rest (s)</span><span></span></div>' +
          split.exercises.map((pe, ei) => {
            const meta = GymData.exerciseById(pe.exerciseId);
            const isCardio = pe.minDuration != null;
            return '<div class="plan-row" data-ex="' + ei + '">' +
              '<div class="plan-name" title="' + App.esc(meta.name) + '">' + App.esc(meta.name) + '</div>' +
              '<label class="plan-field plan-sets"><span class="plan-tag">Sets</span><input type="number" min="1" max="10" data-field="sets" value="' + pe.sets + '" aria-label="Sets" /></label>' +
              (isCardio
                ? '<label class="plan-field plan-min"><span class="plan-tag">Min (min)</span><input type="number" min="1" max="120" data-field="minDuration" value="' + pe.minDuration + '" aria-label="Minimum minutes" /></label>' +
                  '<label class="plan-field plan-max"><span class="plan-tag">Max (min)</span><input type="number" min="1" max="120" data-field="maxDuration" value="' + pe.maxDuration + '" aria-label="Maximum minutes" /></label>'
                : '<label class="plan-field plan-min"><span class="plan-tag">Min reps</span><input type="number" min="1" max="100" data-field="repMin" value="' + pe.repMin + '" aria-label="Minimum reps" /></label>' +
                  '<label class="plan-field plan-max"><span class="plan-tag">Max reps</span><input type="number" min="1" max="100" data-field="repMax" value="' + pe.repMax + '" aria-label="Maximum reps" /></label>') +
              '<label class="plan-field plan-rest"><span class="plan-tag">Rest (s)</span><input type="number" min="0" max="600" step="15" data-field="restSec" value="' + pe.restSec + '" aria-label="Rest seconds" /></label>' +
              '<button class="icon-btn danger plan-remove" data-action="remove-ex" aria-label="Remove exercise"><i data-lucide="trash-2"></i></button>' +
              '</div>';
          }).join('') +
          '<div class="btn-row section-gap" style="margin-top:12px">' +
          '<select data-field="newExercise" aria-label="Add exercise" style="flex:1;min-width:180px">' + exerciseOptions() + '</select>' +
          '<button class="btn btn-sm" data-action="add-ex"><i data-lucide="plus"></i> Add</button>' +
          '</div></div>';
      }).join('') +
      '</div>';

    $('savedSummary').textContent = saved
      ? saved.splits.length + ' splits · ' + saved.days + ' days a week · ' + GymData.GOAL_PRESETS[saved.goal].label
      : 'No plan saved yet.';
    $('savePlanBtn').disabled = !isDirty();
    $('deletePlanBtn').disabled = !saved;
    $('draftStatus').className = 'notice ' + (isDirty() ? 'warn' : 'hidden');
    $('draftStatus').innerHTML = isDirty() ? '<i data-lucide="pencil"></i><span>You have unsaved changes.</span>' : '';
    App.icons();
  }

  function readNumber(el, min, max, fallback) {
    const n = App.toNumber(el.value);
    if (n === null) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  /* ---------- Events ---------- */
  function onGenerate(e) {
    e.preventDefault();
    const days = Number($('days').value);
    const trainingDays = checkedDays();
    if (trainingDays.length !== days) {
      App.toast('Select exactly ' + days + ' training days to match your plan.', 'danger');
      updateDayHint();
      return;
    }
    draft = buildPlan({
      goal: $('goal').value,
      experience: $('experience').value,
      days,
      trainingDays,
      createdAt: saved && saved.createdAt ? saved.createdAt : Store.todayISO()
    });
    renderEditor();
    App.toast('Plan generated. Review it, then save.', 'info');
  }

  function onSavePlan() {
    if (!draft) return;
    const plan = JSON.parse(JSON.stringify(draft));
    plan.createdAt = plan.createdAt || Store.todayISO();
    Store.savePlan(plan);
    Store.saveProfile({
      trainingDays: plan.trainingDays,
      goal: plan.goal,
      experience: plan.experience
    });
    saved = Store.getPlan();
    draft = JSON.parse(JSON.stringify(saved));
    App.toast('Plan saved. Your calendar and dashboard are updated.');
    App.refresh();
  }

  async function onDeletePlan() {
    const ok = await App.confirm({
      title: 'Delete saved plan?',
      message: 'Your saved split will be removed. Past workouts and measurements are kept.',
      confirmLabel: 'Delete plan',
      danger: true
    });
    if (!ok) return;
    Store.savePlan(null);
    saved = null;
    draft = null;
    App.toast('Plan deleted.', 'info');
    App.refresh();
  }

  function onDiscard() {
    draft = saved ? JSON.parse(JSON.stringify(saved)) : null;
    loadFormFromStorage();
    renderEditor();
    App.toast('Changes discarded.', 'info');
  }

  function onEditorChange(e) {
    const el = e.target;
    if (!draft) return;
    const card = el.closest('[data-split]');
    if (!card) return;
    const si = Number(card.dataset.split);
    const split = draft.splits[si];

    if (el.dataset.field === 'label') {
      split.label = el.value.trim().slice(0, 40) || split.label;
    } else if (el.dataset.field && el.dataset.field !== 'newExercise') {
      const row = el.closest('[data-ex]');
      const pe = split.exercises[Number(row.dataset.ex)];
      const isCardio = pe.minDuration != null;
      const limits = {
        sets: [1, 10, pe.sets],
        repMin: [1, 100, pe.repMin],
        repMax: [1, 100, pe.repMax],
        minDuration: [1, 120, isCardio ? pe.minDuration : pe.repMin],
        maxDuration: [1, 120, isCardio ? pe.maxDuration : pe.repMax],
        restSec: [0, 600, pe.restSec]
      }[el.dataset.field];
      if (!limits) return;
      pe[el.dataset.field] = readNumber(el, limits[0], limits[1], limits[2]);
      if (el.dataset.field === 'maxDuration' && pe.maxDuration < pe.minDuration) pe.maxDuration = pe.minDuration;
    }
    renderEditor();
  }

  function onEditorClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn || !draft) return;
    const card = btn.closest('[data-split]');
    const si = Number(card.dataset.split);
    const split = draft.splits[si];

    if (btn.dataset.action === 'remove-ex') {
      const ei = Number(btn.closest('[data-ex]').dataset.ex);
      split.exercises.splice(ei, 1);
      renderEditor();
    }
    if (btn.dataset.action === 'add-ex') {
      const id = card.querySelector('select[data-field="newExercise"]').value;
      if (split.exercises.some(pe => pe.exerciseId === id)) {
        App.toast('That exercise is already in this split.', 'info');
        return;
      }
      split.exercises.push(makePlanExercise(id, draft.goal, draft.experience));
      renderEditor();
    }
  }

  function bind() {
    $('planForm').addEventListener('submit', onGenerate);
    $('days').addEventListener('change', () => {
      setCheckedDays(GymData.DEFAULT_TRAINING_DAYS[Number($('days').value)]);
      updateDayHint();
    });
    $('dayChecks').addEventListener('change', updateDayHint);
    $('savePlanBtn').addEventListener('click', onSavePlan);
    $('deletePlanBtn').addEventListener('click', onDeletePlan);
    $('resetDraftBtn').addEventListener('click', onDiscard);
    $('planEditor').addEventListener('change', onEditorChange);
    $('planEditor').addEventListener('click', onEditorClick);
  }

  /* ---------- Init ---------- */
  fillSelects();
  saved = Store.getPlan();
  draft = saved ? JSON.parse(JSON.stringify(saved)) : null;
  loadFormFromStorage();
  bind();
  App.register(renderEditor);
})(window);
