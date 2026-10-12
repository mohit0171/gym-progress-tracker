/* progress.js: record body measurements, view history and charts. */
(function (global) {
  'use strict';

  const { Store, App } = global;
  const $ = id => document.getElementById(id);

  const METRICS = [
    { key: 'weight', label: 'Body weight', unit: 'kg', input: 'mWeight' },
    { key: 'bodyFat', label: 'Body fat', unit: '%', input: 'mBodyFat' },
    { key: 'chest', label: 'Chest', unit: 'cm', input: 'mChest' },
    { key: 'waist', label: 'Waist', unit: 'cm', input: 'mWaist' },
    { key: 'arms', label: 'Arms', unit: 'cm', input: 'mArms' },
    { key: 'shoulders', label: 'Shoulders', unit: 'cm', input: 'mShoulders' },
    { key: 'thighs', label: 'Thighs', unit: 'cm', input: 'mThighs' },
    { key: 'calves', label: 'Calves', unit: 'cm', input: 'mCalves' }
  ];

  const FIELD_KEYS = METRICS.map(m => m.key);
  let editingId = null;

  function metricOf(key) { return METRICS.find(m => m.key === key); }

  function valuesOf(entries, key) {
    return entries.filter(e => typeof e[key] === 'number');
  }

  function deltaHtml(diff, unit, lowerIsBetter) {
    if (diff === null) return '<span class="delta-flat">—</span>';
    if (Math.abs(diff) < 0.05) return '<span class="delta-flat">No change</span>';
    const improved = lowerIsBetter ? diff < 0 : diff > 0;
    const cls = improved ? 'delta-up' : 'delta-down';
    return '<span class="' + cls + '">' + (diff > 0 ? '+' : '') + App.fmt(diff) + ' ' + unit + '</span>';
  }

  function resetForm() {
    editingId = null;
    $('measureForm').reset();
    $('mId').value = '';
    $('mDate').value = Store.todayISO();
    $('formTitle').textContent = 'Record measurements';
    $('mSave').innerHTML = '<i data-lucide="save"></i> Save entry';
    $('mCancel').classList.add('hidden');
    App.icons();
  }

  function fillForm(entry) {
    editingId = entry.id;
    $('mId').value = entry.id;
    $('mDate').value = entry.date;
    METRICS.forEach(m => {
      $(m.input).value = typeof entry[m.key] === 'number' ? entry[m.key] : '';
    });
    $('formTitle').textContent = 'Edit entry from ' + App.formatDate(entry.date);
    $('mSave').innerHTML = '<i data-lucide="save"></i> Update entry';
    $('mCancel').classList.remove('hidden');
    $('measureForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    App.icons();
  }

  function onSubmit(e) {
    e.preventDefault();
    const date = $('mDate').value;
    if (!Store.isISODate(date)) {
      App.toast('Please choose a valid date.', 'danger');
      return;
    }
    const record = { date };
    let filled = 0;
    METRICS.forEach(m => {
      const n = App.toNumber($(m.input).value);
      if (n !== null && n > 0) {
        record[m.key] = n;
        filled++;
      }
    });
    if (!filled) {
      App.toast('Enter at least one measurement before saving.', 'danger');
      return;
    }
    if (editingId) record.id = editingId;

    Store.saveMeasurement(record);
    App.syncProfileWeight();
    App.toast(editingId ? 'Entry updated.' : 'Measurement saved. Dashboard and charts are updated.');
    resetForm();
    App.refresh();
  }

  async function onDelete(id) {
    const ok = await App.confirm({
      title: 'Delete this entry?',
      message: 'This measurement will be removed from your history and charts.',
      confirmLabel: 'Delete',
      danger: true
    });
    if (!ok) return;
    Store.deleteMeasurement(id);
    App.syncProfileWeight();
    if (editingId === id) resetForm();
    App.toast('Entry deleted.', 'info');
    App.refresh();
  }

  function renderChanges(entries) {
    const body = $('changesBody');
    body.innerHTML = METRICS.map(m => {
      const vals = valuesOf(entries, m.key);
      if (!vals.length) {
        return '<tr><td>' + m.label + '</td><td colspan="3" class="muted">No data yet</td></tr>';
      }
      const first = vals[0][m.key];
      const last = vals[vals.length - 1][m.key];
      const diff = vals.length > 1 ? last - first : null;
      const lowerBetter = m.key !== 'chest' && m.key !== 'arms' && m.key !== 'shoulders' && m.key !== 'thighs' && m.key !== 'calves';
      return '<tr><td>' + m.label + '</td>' +
        '<td>' + App.fmt(first) + ' ' + m.unit + '</td>' +
        '<td>' + App.fmt(last) + ' ' + m.unit + '</td>' +
        '<td>' + deltaHtml(diff, m.unit, lowerBetter) + '</td></tr>';
    }).join('');
  }

  function renderHistory(entries) {
    const body = $('historyBody');
    if (!entries.length) {
      body.innerHTML = '<tr><td colspan="7">' + App.emptyState('ruler', 'No measurements yet',
        'Record your weight or a body measurement above to start building history.').replace(/<div class="empty-state">/, '<div class="empty-state" style="padding:12px">') + '</td></tr>';
      App.icons();
      return;
    }
    body.innerHTML = entries.slice().reverse().map(e => {
      const cell = k => (typeof e[k] === 'number' ? App.fmt(e[k]) : '—');
      return '<tr>' +
        '<td>' + App.esc(App.formatDate(e.date, { month: 'short', day: 'numeric', year: 'numeric' })) + '</td>' +
        '<td>' + cell('weight') + '</td>' +
        '<td>' + cell('bodyFat') + '</td>' +
        '<td>' + cell('chest') + '</td>' +
        '<td>' + cell('waist') + '</td>' +
        '<td>' + cell('arms') + '</td>' +
        '<td class="text-right">' +
        '<button class="icon-btn" data-edit="' + e.id + '" aria-label="Edit entry"><i data-lucide="pencil"></i></button> ' +
        '<button class="icon-btn danger" data-delete="' + e.id + '" aria-label="Delete entry"><i data-lucide="trash-2"></i></button>' +
        '</td></tr>';
    }).join('');
    App.icons();
  }

  function renderChart(entries) {
    const key = $('metricSelect').value || 'weight';
    const metric = metricOf(key);
    const vals = valuesOf(entries, key);
    App.drawChart('progressChartBox', 'progress', vals.length > 0, theme => ({
      type: 'line',
      data: {
        labels: vals.map(e => App.formatDate(e.date, { month: 'short', day: 'numeric' })),
        datasets: [{
          label: metric.label + ' (' + metric.unit + ')',
          data: vals.map(e => e[key]),
          borderColor: theme.accent,
          backgroundColor: theme.accentSoft,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: theme.accent
        }]
      },
      options: App.chartOptions(theme, false)
    }), App.emptyState('trending-up', 'No ' + metric.label.toLowerCase() + ' data yet',
      'Save an entry with this measurement to see the trend.'));
  }

  function fillMetricSelect() {
    const current = $('metricSelect').value || 'weight';
    $('metricSelect').innerHTML = METRICS.map(m =>
      '<option value="' + m.key + '">' + m.label + ' (' + m.unit + ')</option>').join('');
    $('metricSelect').value = current;
  }

  function bind() {
    $('measureForm').addEventListener('submit', onSubmit);
    $('mCancel').addEventListener('click', resetForm);
    $('metricSelect').addEventListener('change', () => App.refresh());
    $('historyBody').addEventListener('click', e => {
      const edit = e.target.closest('[data-edit]');
      const del = e.target.closest('[data-delete]');
      if (edit) {
        const entry = Store.getMeasurements().find(m => m.id === edit.dataset.edit);
        if (entry) fillForm(entry);
      }
      if (del) onDelete(del.dataset.delete);
    });
  }

  App.register(function renderProgress() {
    const entries = Store.getMeasurements();
    fillMetricSelect();
    renderChart(entries);
    renderChanges(entries);
    renderHistory(entries);
  });

  resetForm();
  bind();
})(window);
