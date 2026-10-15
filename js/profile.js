/* profile.js: personal details, goals, equipment, training days and data reset. */
(function (global) {
  'use strict';

  const { Store, App, GymData } = global;
  const $ = id => document.getElementById(id);
  const today = Store.todayISO();

  function fillSelects() {
    $('pGoal').innerHTML = Object.keys(GymData.GOAL_PRESETS).map(k =>
      '<option value="' + k + '">' + App.esc(GymData.GOAL_PRESETS[k].label) + '</option>').join('');
    $('pExperience').innerHTML = Object.keys(GymData.EXPERIENCE_LEVELS).map(k =>
      '<option value="' + k + '">' + App.esc(GymData.EXPERIENCE_LEVELS[k].label) + '</option>').join('');
    $('equipmentChecks').innerHTML = GymData.EQUIPMENT_OPTIONS.map(eq =>
      '<label class="check-pill"><input type="checkbox" name="equipment" value="' + App.esc(eq) + '"><span>' + App.esc(eq) + '</span></label>').join('');
    $('dayChecks').innerHTML = GymData.WEEKDAYS.map((d, i) =>
      '<label class="check-pill"><input type="checkbox" name="trainingDay" value="' + i + '"><span>' + d + '</span></label>').join('');
  }

  function fillForm() {
    const p = Store.getProfile();
    $('pName').value = p.name || '';
    $('pAge').value = p.age ?? '';
    $('pHeight').value = p.height ?? '';
    $('pWeight').value = p.currentWeight ?? '';
    $('pTarget').value = p.targetWeight ?? '';
    $('pGoal').value = p.goal || 'hypertrophy';
    $('pExperience').value = p.experience || 'beginner';
    document.querySelectorAll('input[name="equipment"]').forEach(cb => {
      cb.checked = (p.equipment || []).includes(cb.value);
    });
    document.querySelectorAll('input[name="trainingDay"]').forEach(cb => {
      cb.checked = (p.trainingDays || []).includes(Number(cb.value));
    });
    updateDayNotice();
  }

  function checkedDays() {
    return Array.from(document.querySelectorAll('input[name="trainingDay"]:checked'))
      .map(cb => Number(cb.value))
      .sort((a, b) => a - b);
  }

  function updateDayNotice() {
    const days = checkedDays();
    const plan = Store.getPlan();
    const notice = $('dayNotice');
    if (plan && plan.splits.length !== days.length) {
      notice.style.color = 'var(--warn)';
      notice.textContent = 'Your saved plan has ' + plan.splits.length + ' splits. Regenerate it on Workout Plan to match ' + days.length + ' training days.';
    } else {
      notice.style.color = 'var(--muted)';
      notice.textContent = days.length + ' training day' + (days.length === 1 ? '' : 's') + ' per week. These days appear on your calendar.';
    }
  }

  /* ---------- Profile picture ---------- */
  function renderAvatar() {
    const p = Store.getProfile();
    const circle = $('avatarCircle');
    if (p.avatar) {
      circle.innerHTML = '<img src="' + p.avatar + '" alt="Profile photo" />';
    } else {
      circle.innerHTML = '<i data-lucide="user-round"></i>';
    }
    $('avatarName').textContent = p.avatar ? (p.name ? p.name + "'s photo" : 'Your photo') : 'Add a profile photo';
    $('avatarRemoveBtn').classList.toggle('hidden', !p.avatar);
    App.icons();
  }

  function onChangeAvatar() {
    App.pickImage({ maxSize: 320 }).then(dataUrl => {
      if (!dataUrl) return;                       // cancelled
      Store.saveAvatar(dataUrl);
      App.toast('Profile photo updated.');
      renderAvatar();
    });
  }

  function onRemoveAvatar() {
    App.confirm({
      title: 'Remove profile photo?',
      message: 'Your name and other details stay unchanged.',
      confirmLabel: 'Remove photo',
      danger: true
    }).then(ok => {
      if (!ok) return;
      Store.saveAvatar(null);
      App.toast('Profile photo removed.', 'info');
      renderAvatar();
    });
  }

  function upsertTodayWeight(weight) {
    const latest = App.latestWeight();
    if (latest && latest.weight === weight) return;
    const todayEntry = Store.getMeasurements().find(m => m.date === today && typeof m.weight === 'number');
    Store.saveMeasurement(todayEntry
      ? Object.assign({}, todayEntry, { weight })
      : { date: today, weight });
  }

  function onSubmit(e) {
    e.preventDefault();
    const weight = App.toNumber($('pWeight').value);
    const target = App.toNumber($('pTarget').value);
    if (weight !== null && (weight < 20 || weight > 400)) {
      App.toast('Current weight should be between 20 and 400 kg.', 'danger');
      return;
    }

    const profile = {
      name: $('pName').value.trim().slice(0, 40),
      age: App.toNumber($('pAge').value),
      height: App.toNumber($('pHeight').value),
      targetWeight: target,
      goal: $('pGoal').value,
      experience: $('pExperience').value,
      equipment: Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(cb => cb.value),
      trainingDays: checkedDays()
    };

    Store.saveProfile(profile);
    if (weight !== null) upsertTodayWeight(weight);
    App.syncProfileWeight();

    App.toast('Profile saved.');
    App.refresh();
  }

  function renderSummary() {
    const p = Store.getProfile();
    const latest = App.latestWeight();
    const current = latest ? latest.weight : p.currentWeight;
    const toGoal = current !== null && p.targetWeight !== null ? current - p.targetWeight : null;
    const bmi = current && p.height ? current / Math.pow(p.height / 100, 2) : null;
    const goalLabel = GymData.GOAL_PRESETS[p.goal] ? GymData.GOAL_PRESETS[p.goal].label : '—';
    const experience = GymData.EXPERIENCE_LEVELS[p.experience] ? GymData.EXPERIENCE_LEVELS[p.experience].label : '—';

    $('profileSummary').innerHTML =
      '<div class="kv">' +
      '<div class="kv-item"><div class="label">Current weight</div><div class="value">' + (current ? App.fmt(current) + ' kg' : '—') + '</div></div>' +
      '<div class="kv-item"><div class="label">To target</div><div class="value">' +
        (toGoal === null ? '—' : (toGoal > 0 ? App.fmt(toGoal) + ' kg to lose' : toGoal < 0 ? App.fmt(-toGoal) + ' kg to gain' : 'On target')) + '</div></div>' +
      '<div class="kv-item"><div class="label">BMI</div><div class="value">' + (bmi ? App.fmt(bmi) : '—') + '</div></div>' +
      '<div class="kv-item"><div class="label">Training days</div><div class="value">' + p.trainingDays.length + ' / week</div></div>' +
      '</div>' +
      '<div class="section-gap" style="margin-top:16px">' +
      '<p class="small muted" style="margin-bottom:4px">Goal</p><p>' + App.esc(goalLabel) + '</p>' +
      '<p class="small muted" style="margin-bottom:4px">Experience</p><p>' + App.esc(experience) + '</p>' +
      '<p class="small muted" style="margin-bottom:4px">Equipment</p><p>' + (p.equipment.length ? App.esc(p.equipment.join(', ')) : 'Not set') + '</p>' +
      '</div>';
  }

  async function onReset() {
    const ok = await App.confirm({
      title: 'Reset all data?',
      message: 'This permanently deletes all workouts, measurements, plans and profile details stored in this browser. This cannot be undone.',
      confirmLabel: 'Erase everything',
      danger: true
    });
    if (!ok) return;
    Store.resetAll();
    fillForm();
    App.toast('All data has been erased.', 'info');
    App.refresh();
  }

  function bind() {
    $('profileForm').addEventListener('submit', onSubmit);
    $('dayChecks').addEventListener('change', updateDayNotice);
    $('resetAllBtn').addEventListener('click', onReset);
    $('avatarChangeBtn').addEventListener('click', onChangeAvatar);
    $('avatarRemoveBtn').addEventListener('click', onRemoveAvatar);
  }

  fillSelects();
  fillForm();
  renderAvatar();
  bind();
  App.register(renderSummary);
})(window);
