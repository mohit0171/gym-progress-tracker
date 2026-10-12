/* dashboard.js: statistics, today's workout, recent activity and charts. */
(function (global) {
  'use strict';

  const { Store, App, GymData } = global;

  function greeting(name) {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return name ? part + ', ' + name : part;
  }

  function renderStats(data, today) {
    const monthPrefix = today.slice(0, 7);
    const monthStart = monthPrefix + '-01';
    const completed = data.sessions.filter(s => s.status === 'completed');
    const monthCompleted = completed.filter(s => s.date.startsWith(monthPrefix));

    const planStart = data.plan && data.plan.createdAt;
    const scheduleFrom = planStart && planStart > monthStart ? planStart : monthStart;
    const scheduled = App.countTrainingDays(scheduleFrom, today, data.profile);

    const volume = monthCompleted.reduce((t, s) => t + App.sessionVolume(s), 0);
    const weights = Store.getMeasurements().filter(m => typeof m.weight === 'number');
    const latest = weights.length ? weights[weights.length - 1] : null;
    const first = weights.length ? weights[0] : null;
    const currentWeight = latest ? latest.weight : data.profile.currentWeight;
    const change = latest && first && latest !== first ? latest.weight - first.weight : null;
    const streak = App.streak(completed, today);

    const cards = [
      App.statCard({
        icon: 'calendar-check',
        label: 'Workouts this month',
        value: monthCompleted.length,
        sub: scheduled ? scheduled + ' scheduled so far' : 'Set training days in Profile'
      }),
      App.statCard({
        icon: 'scale',
        label: 'Current weight',
        value: currentWeight !== null && currentWeight !== undefined ? App.fmt(currentWeight) + ' kg' : '—',
        sub: change !== null ? (change > 0 ? '+' : '') + App.fmt(change) + ' kg since first entry' : 'Add entries in Body Progress'
      }),
      App.statCard({
        icon: 'flame',
        label: 'Workout streak',
        value: streak + (streak === 1 ? ' day' : ' days'),
        sub: streak ? 'Consecutive days trained' : 'Complete a workout to start'
      }),
      App.statCard({
        icon: 'activity',
        label: 'Training volume',
        value: App.fmt(Math.round(volume), 0) + ' kg',
        sub: 'Weight × reps this month'
      })
    ];
    document.getElementById('statCards').innerHTML = cards.join('');
  }

  function renderToday(data, today) {
    const box = document.getElementById('todayCard');
    const split = App.plannedSplit(today, data);
    const doneToday = data.sessions.find(s => s.date === today && s.status === 'completed');
    const activeSession = data.sessions.find(s => s.status === 'active');
    const isTrainDay = App.isTrainingDay(today, data.profile);

    let body = '';
    let cta;

    if (doneToday) {
      body += '<div class="notice success"><i data-lucide="circle-check"></i><span>Today\'s workout is complete: <strong>' +
        App.esc(doneToday.title) + '</strong>.</span></div>';
      cta = '<a class="btn" href="workout-log.html?edit=' + doneToday.id + '"><i data-lucide="pencil"></i> Review workout</a>';
    } else if (activeSession && activeSession.date === today) {
      body += '<div class="notice info"><i data-lucide="timer"></i><span>You have a workout in progress.</span></div>';
      cta = '<a class="btn btn-primary" href="workout-log.html"><i data-lucide="play"></i> Continue workout</a>';
    } else if (split) {
      body += '<p class="muted small" style="margin-bottom:10px">Scheduled: ' + App.esc(split.label || '') + '</p>';
      body += '<div class="list">' + split.exercises.map(pe => {
        const meta = GymData.exerciseById(pe.exerciseId);
        return '<div class="list-item"><div class="list-icon"><i data-lucide="dumbbell"></i></div><div class="list-main">' +
          '<div class="list-title">' + App.esc(meta.name) + '</div>' +
          '<div class="list-sub">' + pe.sets + ' sets × ' + pe.repMin + '–' + pe.repMax + ' reps · ' + pe.restSec + 's rest</div>' +
          '</div></div>';
      }).join('') + '</div>';
      cta = '<a class="btn btn-primary" href="workout-log.html?date=' + today + '"><i data-lucide="play"></i> Start workout</a>';
    } else if (isTrainDay) {
      body += App.emptyState('clipboard-list', 'No plan yet', 'Today is a training day, but no split is saved yet.',
        '<a class="btn btn-sm" href="workout-plan.html">Create a plan</a>');
      cta = '<a class="btn" href="workout-log.html?date=' + today + '"><i data-lucide="plus"></i> Log a session anyway</a>';
    } else {
      body += App.emptyState('moon-star', 'Rest day', 'Recovery is part of progress. Enjoy your day off.');
      cta = '<a class="btn" href="workout-log.html?date=' + today + '"><i data-lucide="plus"></i> Log an extra session</a>';
    }

    box.innerHTML =
      '<div class="card-header"><div><h3 class="card-title">Today\'s workout</h3>' +
      '<p class="card-sub">' + App.formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' }) + '</p></div></div>' +
      body + '<div class="btn-row section-gap">' + cta + '</div>';
  }

  function renderRecent(data) {
    const items = [];
    data.sessions.filter(s => s.status === 'completed').forEach(s => {
      items.push({
        date: s.date,
        icon: 'notebook-pen',
        title: s.title || 'Workout',
        sub: App.sessionSetCount(s) + ' sets · ' + App.fmt(Math.round(App.sessionVolume(s)), 0) + ' kg volume'
      });
    });
    Store.getMeasurements().forEach(m => {
      const parts = [];
      if (typeof m.weight === 'number') parts.push(App.fmt(m.weight) + ' kg');
      if (typeof m.waist === 'number') parts.push('waist ' + App.fmt(m.waist) + ' cm');
      if (parts.length) items.push({ date: m.date, icon: 'trending-up', title: 'Body measurement', sub: parts.join(' · ') });
    });

    const list = document.getElementById('recentList');
    if (!items.length) {
      list.innerHTML = App.emptyState('history', 'No activity yet', 'Completed workouts and measurements will appear here.',
        '<a class="btn btn-sm" href="workout-log.html">Log your first workout</a>');
      return;
    }
    items.sort((a, b) => b.date.localeCompare(a.date));
    list.innerHTML = items.slice(0, 6).map(i =>
      '<div class="list-item"><div class="list-icon"><i data-lucide="' + i.icon + '"></i></div>' +
      '<div class="list-main"><div class="list-title">' + App.esc(i.title) + '</div>' +
      '<div class="list-sub">' + App.esc(App.formatDate(i.date, { month: 'short', day: 'numeric', year: 'numeric' })) + ' · ' + App.esc(i.sub) + '</div></div></div>'
    ).join('');
  }

  function renderCharts(data, today) {
    const weights = Store.getMeasurements().filter(m => typeof m.weight === 'number');
    App.drawChart('weightChartBox', 'weight', weights.length > 0, theme => ({
      type: 'line',
      data: {
        labels: weights.map(m => App.formatDate(m.date, { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Weight (kg)',
          data: weights.map(m => m.weight),
          borderColor: theme.accent,
          backgroundColor: theme.accentSoft,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: theme.accent
        }]
      },
      options: App.chartOptions(theme, false)
    }), App.emptyState('scale', 'No weight data yet', 'Record your weight in Body Progress to see your trend here.',
      '<a class="btn btn-sm" href="progress.html">Record weight</a>'));

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const ym = App.toISO(new Date(now.getFullYear(), now.getMonth() - i, 1)).slice(0, 7);
      const vol = data.sessions
        .filter(s => s.status === 'completed' && s.date.startsWith(ym))
        .reduce((t, s) => t + App.sessionVolume(s), 0);
      months.push({ ym, vol: Math.round(vol) });
    }
    const hasVolume = months.some(m => m.vol > 0);
    App.drawChart('volumeChartBox', 'volume', hasVolume, theme => ({
      type: 'bar',
      data: {
        labels: months.map(m => App.shortMonth(m.ym)),
        datasets: [{
          label: 'Volume (kg)',
          data: months.map(m => m.vol),
          backgroundColor: theme.accent,
          borderRadius: 8,
          maxBarThickness: 42
        }]
      },
      options: App.chartOptions(theme, true)
    }), App.emptyState('chart-column', 'No training volume yet', 'Completed workouts with weights and reps will chart here.',
      '<a class="btn btn-sm" href="workout-log.html">Log a workout</a>'));
  }

  App.register(function renderDashboard() {
    const data = Store.load();
    const today = Store.todayISO();
    const name = data.profile.name;
    document.getElementById('greeting').textContent = greeting(name) + (name ? '' : '!');
    renderStats(data, today);
    renderToday(data, today);
    renderRecent(data);
    renderCharts(data, today);
  });
})(window);
