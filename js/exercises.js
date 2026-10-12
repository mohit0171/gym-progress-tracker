/* exercises.js: searchable, filterable exercise library. */
(function (global) {
  'use strict';

  const { App, GymData } = global;
  const $ = id => document.getElementById(id);

  const CATEGORY_ICON = {
    chest: 'shield', back: 'git-branch', shoulders: 'move-up', biceps: 'dumbbell',
    triceps: 'dumbbell', legs: 'footprints', abs: 'circle-dot', cardio: 'heart-pulse'
  };

  const state = { query: '', category: 'all', equipment: 'all' };

  function equipmentList() {
    const set = new Set();
    GymData.EXERCISES.forEach(e => e.equipment.split(/,| or /).forEach(part => {
      const clean = part.trim();
      if (clean) set.add(clean);
    }));
    return Array.from(set).sort();
  }

  function renderFilters() {
    $('categoryChips').innerHTML =
      '<button class="chip' + (state.category === 'all' ? ' active' : '') + '" data-cat="all">All</button>' +
      GymData.CATEGORIES.map(c =>
        '<button class="chip' + (state.category === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' + App.esc(c.label) + '</button>'
      ).join('');

    const equipSelect = $('equipmentFilter');
    const current = equipSelect.value || 'all';
    equipSelect.innerHTML = '<option value="all">Any equipment</option>' +
      equipmentList().map(eq => '<option value="' + App.esc(eq) + '">' + App.esc(eq) + '</option>').join('');
    equipSelect.value = equipmentList().includes(current) ? current : 'all';
    state.equipment = equipSelect.value;
  }

  function matches(e) {
    if (state.category !== 'all' && e.category !== state.category) return false;
    if (state.equipment !== 'all' && !e.equipment.includes(state.equipment)) return false;
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    return [e.name, e.muscles, e.equipment, e.category, e.instructions].join(' ').toLowerCase().includes(q);
  }

  function renderGrid() {
    const list = GymData.EXERCISES.filter(matches);
    $('resultCount').textContent = list.length + ' exercise' + (list.length === 1 ? '' : 's') + ' found';

    if (!list.length) {
      $('exerciseGrid').innerHTML = '<div class="card" style="grid-column:1/-1">' + App.emptyState('search-x',
        'No exercises match', 'Try a different search term or clear the filters.',
        '<button class="btn btn-sm" id="clearFilters">Clear filters</button>') + '</div>';
      App.icons();
      return;
    }

    $('exerciseGrid').innerHTML = list.map(e =>
      '<article class="card exercise-card fade-in">' +
      '<div class="btn-row" style="justify-content:space-between;flex-wrap:nowrap">' +
      '<div class="exercise-icon"><i data-lucide="' + (CATEGORY_ICON[e.category] || 'dumbbell') + '"></i></div>' +
      '<span class="badge">' + App.esc(e.category) + '</span></div>' +
      '<h4>' + App.esc(e.name) + '</h4>' +
      '<div class="meta"><strong>Equipment:</strong> ' + App.esc(e.equipment) + '</div>' +
      '<div class="meta"><strong>Targets:</strong> ' + App.esc(e.muscles) + '</div>' +
      '<div class="actions">' +
      '<button class="btn btn-sm" data-detail="' + e.id + '"><i data-lucide="info"></i> Details</button>' +
      '<a class="btn btn-sm btn-primary" href="workout-log.html?exercise=' + e.id + '"><i data-lucide="plus"></i> Log</a>' +
      '</div></article>'
    ).join('');
    App.icons();
  }

  function openDetail(id) {
    const e = GymData.exerciseById(id);
    App.modal({
      title: e.name,
      html:
        '<div class="kv" style="margin-bottom:16px">' +
        '<div class="kv-item"><div class="label">Category</div><div class="value" style="text-transform:capitalize;font-size:16px">' + App.esc(e.category) + '</div></div>' +
        '<div class="kv-item"><div class="label">Equipment</div><div class="value" style="font-size:16px">' + App.esc(e.equipment) + '</div></div>' +
        '</div>' +
        '<h4>Target muscles</h4><p class="muted">' + App.esc(e.muscles) + '</p>' +
        '<h4 style="margin-top:14px">How to perform</h4><p class="muted">' + App.esc(e.instructions) + '</p>',
      actions: [
        { label: 'Close', className: 'btn-ghost' },
        { label: 'Log this exercise', className: 'btn-primary', onClick: close => { window.location.href = 'workout-log.html?exercise=' + e.id; close(); } }
      ]
    });
  }

  function bind() {
    $('exerciseSearch').addEventListener('input', e => {
      state.query = e.target.value.trim();
      renderGrid();
    });
    $('equipmentFilter').addEventListener('change', e => {
      state.equipment = e.target.value;
      renderGrid();
    });
    $('categoryChips').addEventListener('click', e => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.category = btn.dataset.cat;
      renderFilters();
      renderGrid();
    });
    $('exerciseGrid').addEventListener('click', e => {
      const detail = e.target.closest('[data-detail]');
      if (detail) { openDetail(detail.dataset.detail); return; }
      if (e.target.closest('#clearFilters')) {
        state.query = '';
        state.category = 'all';
        state.equipment = 'all';
        $('exerciseSearch').value = '';
        renderFilters();
        renderGrid();
      }
    });
  }

  App.register(function renderExercises() {
    renderFilters();
    renderGrid();
  });
  bind();
})(window);
