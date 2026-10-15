/* storage.js: the single place where the app reads and writes localStorage.
   Every page uses the same key and the same data shape. */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'gymProgressTracker.v1';
  const BACKUP_APP_ID = 'gym-progress-tracker';
  const MAX_PHOTOS = 80;   // progress photos are capped so localStorage never fills up

  function defaultData() {
    return {
      version: 1,
      settings: { theme: 'dark' },
      profile: {
        name: '',
        age: null,
        height: null,
        currentWeight: null,
        targetWeight: null,
        goal: 'hypertrophy',
        experience: 'beginner',
        equipment: [],
        trainingDays: [],
        avatar: null       // data URL of the profile picture, or null
      },
      plan: null,        // { createdAt, goal, experience, days, trainingDays, splits[] }
      sessions: [],      // workout sessions (active | completed)
      measurements: [],  // body measurement records
      photos: []         // daily progress photos { id, date, dataUrl, createdAt }
    };
  }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function isISODate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Makes sure whatever is in storage has the shape the app expects.
  function sanitize(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const out = defaultData();

    if (raw.settings && typeof raw.settings === 'object') {
      out.settings = Object.assign({}, out.settings, raw.settings);
    }
    if (raw.profile && typeof raw.profile === 'object') {
      out.profile = Object.assign({}, out.profile, raw.profile);
    }
    if (!Array.isArray(out.profile.equipment)) out.profile.equipment = [];
    if (!Array.isArray(out.profile.trainingDays)) out.profile.trainingDays = [];
    if (typeof out.profile.avatar !== 'string' || out.profile.avatar.slice(0, 11) !== 'data:image/') out.profile.avatar = null;
    out.profile.trainingDays = out.profile.trainingDays
      .filter(d => Number.isInteger(d) && d >= 0 && d <= 6)
      .sort((a, b) => a - b);

    if (raw.plan && typeof raw.plan === 'object' && Array.isArray(raw.plan.splits)) {
      out.plan = raw.plan;
    }
    if (Array.isArray(raw.sessions)) {
      out.sessions = raw.sessions.filter(s => s && isISODate(s.date) && Array.isArray(s.exercises));
    }
    if (Array.isArray(raw.measurements)) {
      out.measurements = raw.measurements.filter(m => m && isISODate(m.date));
    }
    if (Array.isArray(raw.photos)) {
      out.photos = raw.photos
        .filter(p => p && isISODate(p.date) && typeof p.dataUrl === 'string' && p.dataUrl.slice(0, 11) === 'data:image/')
        .slice(0, MAX_PHOTOS);
    }
    return out;
  }

  function load() {
    try {
      const text = global.localStorage.getItem(STORAGE_KEY);
      if (!text) return defaultData();
      return sanitize(JSON.parse(text)) || defaultData();
    } catch (err) {
      console.warn('Saved data could not be read. Starting with an empty dataset.', err);
      return defaultData();
    }
  }

  function persist(data) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Data could not be saved (storage full or blocked).', err);
      return false;
    }
  }

  function mutate(fn) {
    const data = load();
    const result = fn(data);
    persist(data);
    return result;
  }

  /* ---------- Sessions ---------- */
  function getSessions() { return load().sessions; }

  function saveSession(session) {
    return mutate(d => {
      if (!session.id) session.id = uid('ses');
      session.updatedAt = new Date().toISOString();
      const i = d.sessions.findIndex(s => s.id === session.id);
      if (i >= 0) d.sessions[i] = session; else d.sessions.push(session);
      return session;
    });
  }

  function deleteSession(id) {
    return mutate(d => { d.sessions = d.sessions.filter(s => s.id !== id); });
  }

  /* ---------- Measurements ---------- */
  function getMeasurements() {
    return load().measurements.slice().sort((a, b) => a.date.localeCompare(b.date));
  }

  function saveMeasurement(record) {
    return mutate(d => {
      if (!record.id) record.id = uid('meas');
      const i = d.measurements.findIndex(m => m.id === record.id);
      if (i >= 0) d.measurements[i] = record; else d.measurements.push(record);
      return record;
    });
  }

  function deleteMeasurement(id) {
    return mutate(d => { d.measurements = d.measurements.filter(m => m.id !== id); });
  }

  /* ---------- Progress photos ---------- */
  function getPhotos() {
    return load().photos.slice().sort((a, b) => (b.date + (b.createdAt || '')).localeCompare(a.date + (a.createdAt || '')));
  }

  function photosForDate(iso) {
    return getPhotos().filter(p => p.date === iso);
  }

  // Saves (or updates) a photo. When the day already holds 6 photos
  // the oldest one for that day is replaced, so a fresh picture never fails.
  function savePhoto(record) {
    return mutate(d => {
      if (!record.id) record.id = uid('pho');
      record.createdAt = record.createdAt || new Date().toISOString();
      const sameDay = d.photos.filter(p => p.date === record.date);
      const i = d.photos.findIndex(p => p.id === record.id);
      if (i >= 0) {
        d.photos[i] = record;
      } else {
        if (sameDay.length >= 6) {
          const oldest = sameDay.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))[0];
          d.photos = d.photos.filter(p => p.id !== oldest.id);
        }
        d.photos.push(record);
      }
      // Hard cap so the browser storage never overflows with images.
      if (d.photos.length > MAX_PHOTOS) {
        d.photos.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        d.photos = d.photos.slice(0, MAX_PHOTOS);
      }
      return record;
    });
  }

  function deletePhoto(id) {
    return mutate(d => { d.photos = d.photos.filter(p => p.id !== id); });
  }

  /* ---------- Avatar ---------- */
  function getAvatar() { return load().profile.avatar || null; }

  function saveAvatar(dataUrl) {
    return mutate(d => {
      d.profile.avatar = (typeof dataUrl === 'string' && dataUrl.slice(0, 11) === 'data:image/') ? dataUrl : null;
      return d.profile.avatar;
    });
  }

  /* ---------- Profile, plan, settings ---------- */
  function getProfile() { return load().profile; }

  function saveProfile(patch) {
    return mutate(d => {
      d.profile = Object.assign({}, d.profile, patch);
      return d.profile;
    });
  }

  function getPlan() { return load().plan; }

  function savePlan(plan) {
    return mutate(d => {
      if (plan && !plan.createdAt) plan.createdAt = todayISO();
      d.plan = plan || null;
      return d.plan;
    });
  }

  function getSettings() { return load().settings; }

  function saveSettings(patch) {
    return mutate(d => {
      d.settings = Object.assign({}, d.settings, patch);
      return d.settings;
    });
  }

  /* ---------- Backup & restore ---------- */
  function exportBackup() {
    return JSON.stringify({
      app: BACKUP_APP_ID,
      exportedAt: new Date().toISOString(),
      data: load()
    }, null, 2);
  }

  function importBackup(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      return { ok: false, message: 'That file is not valid JSON.' };
    }
    const payload = parsed && parsed.app === BACKUP_APP_ID && parsed.data ? parsed.data : parsed;
    const clean = sanitize(payload);
    const looksRight = payload && (Array.isArray(payload.sessions) || Array.isArray(payload.measurements) || payload.profile);
    if (!clean || !looksRight) {
      return { ok: false, message: 'This file does not look like a Gym Progress Tracker backup.' };
    }
    persist(clean);
    return {
      ok: true,
      message: 'Imported ' + clean.sessions.length + ' workouts and ' + clean.measurements.length + ' measurements.'
    };
  }

  function resetAll() {
    try { global.localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  }

  global.Store = {
    STORAGE_KEY,
    load,
    uid,
    todayISO,
    isISODate,
    getSessions,
    saveSession,
    deleteSession,
    getMeasurements,
    saveMeasurement,
    deleteMeasurement,
    getPhotos,
    photosForDate,
    savePhoto,
    deletePhoto,
    getAvatar,
    saveAvatar,
    getProfile,
    saveProfile,
    getPlan,
    savePlan,
    getSettings,
    saveSettings,
    exportBackup,
    importBackup,
    resetAll
  };
})(window);
