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
    const weekStart = App.addDays(today, -((App.parseISO(today).getDay() + 6) % 7));
    const weekSessions = completed.filter(s => s.date >= weekStart && s.date <= today);
    const weekVolume = weekSessions.reduce((t, s) => t + App.sessionVolume(s), 0);
    const streak = App.streak(completed, today);

    const cards = [
      App.statCard({
        icon: 'calendar-check',
        label: 'Workouts completed',
        value: monthCompleted.length,
        sub: scheduled ? scheduled + ' scheduled so far this month' : 'Set training days in Profile'
      }),
      App.statCard({
        icon: 'flame',
        label: 'Current streak',
        value: streak + (streak === 1 ? ' day' : ' days'),
        sub: streak ? 'Consecutive days trained' : 'Complete a workout to start'
      }),
      App.statCard({
        icon: 'activity',
        label: 'Total volume',
        value: App.fmt(Math.round(volume), 0) + ' kg',
        sub: 'Weight × reps this month'
      }),
      App.statCard({
        icon: 'zap',
        label: 'Weekly activity',
        value: weekSessions.length + (weekSessions.length === 1 ? ' workout' : ' workouts'),
        sub: App.fmt(Math.round(weekVolume), 0) + ' kg lifted this week'
      })
    ];
    document.getElementById('statCards').innerHTML = cards.join('');
  }

  function renderHero(data, today) {
    const dateEl = document.getElementById('todayDate');
    if (dateEl) dateEl.textContent = App.parseISO(today).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    const completed = data.sessions.filter(s => s.status === 'completed');
    const streak = App.streak(completed, today);
    const profile = data.profile || {};
    const nameEl = document.getElementById('profileName');
    const metaEl = document.getElementById('profileMeta');
    const avatarEl = document.getElementById('avatarInitial');
    const pillEl = document.getElementById('streakPill');
    if (nameEl) nameEl.textContent = profile.name ? profile.name : 'Athlete';
    if (avatarEl) avatarEl.textContent = (profile.name ? profile.name : 'G').trim().charAt(0).toUpperCase() || 'G';
    if (metaEl) {
      const goal = global.GymData && global.GymData.GOAL_PRESETS[profile.goal] ? global.GymData.GOAL_PRESETS[profile.goal].label : '';
      metaEl.textContent = goal || (profile.name ? 'Keep pushing forward' : 'Set up your profile');
    }
    if (pillEl) {
      pillEl.innerHTML = '<i data-lucide="flame"></i> <span>' + streak + ' day' + (streak === 1 ? '' : 's') + '</span>';
    }
    const heroSub = document.getElementById('heroSub');
    if (heroSub) {
      const monthCount = completed.filter(s => s.date.slice(0, 7) === today.slice(0, 7)).length;
      heroSub.textContent = monthCount
        ? monthCount + (monthCount === 1 ? ' workout' : ' workouts') + ' logged this month. Consistency builds strength.'
        : 'No workouts logged yet this month. Start your first session to build momentum.';
    }
    // Weekly bars Mon-Sun from actual completed sessions
    const barsEl = document.getElementById('weekBars');
    const countEl = document.getElementById('weekCount');
    if (barsEl) {
      const monday = App.addDays(today, -((App.parseISO(today).getDay() + 6) % 7));
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      let weekTotal = 0;
      let maxVol = 0;
      const vols = [];
      for (let i = 0; i < 7; i++) {
        const iso = App.addDays(monday, i);
        const vol = completed.filter(s => s.date === iso).reduce((t, s) => t + App.sessionVolume(s), 0);
        vols.push({ iso, vol });
        if (vol > 0) weekTotal++;
        if (vol > maxVol) maxVol = vol;
      }
      barsEl.innerHTML = vols.map((d, i) =>
        '<div class="week-bar' + (d.vol > 0 ? ' on' : '') + '" title="' + App.esc(App.formatDate(d.iso, { weekday: 'short', month: 'short', day: 'numeric' })) + (d.vol > 0 ? ' — ' + App.fmt(Math.round(d.vol), 0) + ' kg' : ' — rest') + '">' +
        '<i style="height:' + (d.vol > 0 && maxVol > 0 ? Math.max(22, Math.round((d.vol / maxVol) * 72)) : 8) + 'px"></i><span>' + days[i] + '</span></div>'
      ).join('');
      if (countEl) countEl.textContent = weekTotal + (weekTotal === 1 ? ' workout' : ' workouts');
    }
    // Monthly heatmap: real workout days only
    const heatEl = document.getElementById('monthHeat');
    if (heatEl) {
      const ym = today.slice(0, 7);
      const range = App.monthRange(ym);
      const byDate = {};
      completed.filter(s => s.date >= range.start && s.date <= range.end).forEach(s => {
        byDate[s.date] = (byDate[s.date] || 0) + App.sessionVolume(s);
      });
      const vols = Object.values(byDate);
      const max = vols.length ? Math.max(...vols) : 0;
      // Monday-first grid with leading blanks
      const firstWeekday = (App.parseISO(range.start).getDay() + 6) % 7;
      const lastDay = Number(range.end.slice(8, 10));
      let html = '';
      for (let b = 0; b < firstWeekday; b++) html += '<div class="heat-cell" style="visibility:hidden" aria-hidden="true"></div>';
      for (let d = 1; d <= lastDay; d++) {
        const iso = ym + '-' + String(d).padStart(2, '0');
        const vol = byDate[iso] || 0;
        let cls = '';
        if (vol > 0 && max > 0) {
          const r = vol / max;
          cls = r > 0.75 ? ' l4' : r > 0.5 ? ' l3' : r > 0.25 ? ' l2' : ' l1';
        }
        html += '<div class="heat-cell' + cls + (iso === today ? ' today' : '') + '" title="' + App.esc(App.formatDate(iso, { month: 'short', day: 'numeric' })) + (vol > 0 ? ' — ' + App.fmt(Math.round(vol), 0) + ' kg' : ' — no workout') + '">' + d + '</div>';
      }
      heatEl.innerHTML = html || App.emptyState('calendar-days', 'No workouts this month', 'Log a workout and it will light up here.');
    }
    App.icons();
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
        const isCardio = pe.minDuration != null;
        return '<div class="list-item"><div class="list-icon"><i data-lucide="' + (isCardio ? 'activity' : 'dumbbell') + '"></i></div><div class="list-main">' +
          '<div class="list-title">' + App.esc(meta.name) + '</div>' +
          '<div class="list-sub">' + pe.sets + ' sets × ' + (isCardio ? pe.minDuration + '–' + pe.maxDuration + ' min' : pe.repMin + '–' + pe.repMax + ' reps') + ' · ' + pe.restSec + 's rest</div>' +
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
    renderHero(data, today);
    renderStats(data, today);
    renderToday(data, today);
    renderRecent(data);
    renderCharts(data, today);
  });
})(window);
