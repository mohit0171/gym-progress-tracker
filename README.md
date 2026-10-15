# Gym Progress Tracker (multi-page)

A premium dark-charcoal fitness tracker built with HTML5, CSS3, vanilla JavaScript, Chart.js and Lucide icons. Every feature has its own page, and all pages share one localStorage data system. There is no backend, database or framework.

## Project structure

```
gym-progress-tracker/
├── index.html            Dashboard
├── workout-plan.html     Personalised workout plan (3 to 6 day splits)
├── workout-log.html      Start, log, edit, finish and cancel workouts + rest timer + day-wise plan week
├── exercises.html        Searchable exercise library
├── calendar.html         Monthly calendar (completed, planned, missed, rest)
├── progress.html         Body measurements, charts and progress photo gallery
├── reports.html          Monthly reports, comparisons, PRs, progress photos, backup and print
├── profile.html          Profile picture, goals, equipment, training days, data reset
├── offline.html          Offline fallback page
├── manifest.json         PWA manifest
├── service-worker.js     Offline-first app shell cache
├── css/
│   ├── style.css         Shared global styling (dark + light themes, print styles)
│   ├── responsive.css    Tablet and phone layouts, off-canvas mobile menu
│   ├── premium.css       Premium visual layer
│   ├── premium2.css      Premium visual layer (cards, avatars, pills)
│   └── premium3.css      Premium visual layer
├── js/
│   ├── storage.js        The only code that reads/writes localStorage (incl. photos & avatar)
│   ├── goal-templates.js Goal-based split templates
│   ├── data.js           Exercise library, split templates, goal presets
│   ├── app.js            Shared navigation, theme, modals, toasts, image picker, chart helpers
│   ├── dashboard.js      Dashboard statistics and charts
│   ├── workout-plan.js   Plan generation and editing
│   ├── workout-log.js    Workout logger, rest timer, progression hints, progress photos
│   ├── exercises.js      Exercise search and filters
│   ├── calendar.js       Monthly calendar
│   ├── progress.js       Body measurements, charts and progress photo gallery
│   ├── reports.js        Monthly reports (incl. photos), backup import/export
│   ├── profile.js        Profile picture, goals and data reset
│   └── pwa.js            Service worker registration, install/offline banners
├── icons/                PWA icons (192 and 512 px)
└── README.md
```

## Setup in VS Code with Live Server

1. Install **Visual Studio Code**.
2. Open VS Code, choose **File → Open Folder**, and select the `gym-progress-tracker` folder.
3. Install the **Live Server** extension by Ritwik Ranjan (Extensions panel, search "Live Server").
4. Open `index.html`, right-click it in the Explorer, and choose **Open with Live Server**. Your browser opens at `http://127.0.0.1:5500/index.html`.
5. Chart.js and Lucide load from public CDNs, so keep an internet connection for charts and icons.
6. The service worker only registers over `http(s)`, so use Live Server (or `python -m http.server`) rather than double-clicking the file. `file://` still works for the pages, but install/offline features need HTTP.

You can also double-click `index.html`. Live Server is recommended because it behaves like a real website.

## Progressive Web App (PWA)

- `manifest.json` names the app **Gym Progress Tracker** (`GymTracker` short name), uses `standalone` display, `./index.html` start URL, `#121315` theme/background, and 192 + 512 icons in `icons/`.
- `service-worker.js` precaches all 10 HTML entries (9 pages + offline), all 5 CSS files, all 13 JS files, the manifest and both icons (31 entries). Navigations are network-first with cache fallback, then `offline.html`. Static assets are cache-first with background refresh. CDN scripts (Chart.js, Lucide) are left to the network with a graceful message when missing.
- Every HTML page links the manifest, sets PWA meta tags/icons, and loads `js/pwa.js`, which registers the worker, shows an install banner when `beforeinstallprompt` fires, and shows an offline banner via `online`/`offline` events.
- `offline.html` is the fallback page and explains that saved data still works offline.
- Icons: `icons/icon-192.png` (192×192) and `icons/icon-512.png` (512×512, also used as maskable).
- Installability was verified: manifest parses, all 27 cached URLs exist on disk, all pages contain manifest + icons + `pwa.js`, and all URLs return 200 over a local HTTP server. Data persistence verified through the single `Store` round-trip.

### Deploy to HTTPS (required for install)

1. Push this folder to GitHub, then host with any static HTTPS host: **GitHub Pages**, **Netlify**, **Vercel**, or **Cloudflare Pages**.
2. Example (Netlify Drop): drag the `gym-progress-tracker` folder onto https://app.netlify.com/drop — you get an `https://...` URL instantly.
3. Example (GitHub Pages): push to a repo, then Settings → Pages → Deploy from branch → select branch + `/ (root)`.
4. After deploy, open the HTTPS URL in Chrome on Android, visit each page once (so the worker caches it), then Chrome menu → **Install app** / **Add to Home screen**.
5. Verify: DevTools → Application → Manifest (no errors), Service Workers (activated), and test airplane mode — cached pages load, `offline.html` appears for uncached ones.

### Install on Android

1. Open the deployed HTTPS URL in **Chrome**.
2. Tap ⋮ menu → **Install app** (or **Add to Home screen** if the prompt is not offered).
3. Launch **GymTracker** from the home screen — it opens standalone (no browser chrome) with safe-area support.
4. Offline: saved workouts, plans, measurements and all pages opened before still work. Charts need internet on first load because Chart.js comes from a CDN; the app shows "chart library could not load" instead of crashing.

## Data storage

- All data lives in the browser's `localStorage` under the key `gymProgressTracker.v1`.
- Every page uses the same key and the same data shape, so saving on one page appears everywhere else.
- Data stays in **this browser only**. It does not sync across devices. Use **Reports → Export backup** to move data to another device, then **Import backup** there.
- Clearing site data in the browser erases everything. Export a backup first if you need to keep it.
- Statistics are calculated from saved records only. New users see zero values and empty states, never sample data.

## Key behaviour

- **Workouts** logged on `workout-log.html` appear immediately on the calendar, dashboard and reports.
- **Progress photos** added after a workout (or on Body Progress / Reports) appear in the day-wise gallery, the monthly report and the plan-week cards; the whole library stays in one `photos` array inside the same localStorage key.
- **Profile picture** set on `profile.html` is stored with the profile record and rejected on load unless it is a valid image data URL.
- **Body weight** recorded on `progress.html` (or in Profile) updates the dashboard and charts.
- **Plan changes** on `workout-plan.html` update the calendar and dashboard. Plans are saved only when you select **Save plan**.
- **Progressive overload** compares your last completed session with the current target and suggests a small increase (about 2.5 kg) only when you hit the top of the rep range. Weights are never changed automatically.
- **Missed sessions** are only flagged on or after the day the plan was saved, so older dates are not marked as failures.

## Progress photos and profile picture

All images are handled by two shared helpers in `app.js` — `App.pickImage()` opens the OS photo/camera picker and `App.resizeImage()` downscales the result to a JPEG data URL (transparent PNGs are flattened onto white). Nothing is ever uploaded anywhere; images stay in localStorage with the rest of your data.

- **Day-wise plan week (Workout Log)**: above the editor, "This week's plan" shows your saved split one card per training day — weekday, date, split label, status badge (Logged / In progress / Planned / Missed / Rest) and the full exercise list with sets, rep ranges and rest. Each card has a **Start** button that opens a prefilled session for that exact date (**Continue** if one is already in progress, **Log again** if it was finished). Only one workout can run at a time.
- **Post-workout photo (Workout Log)**: finishing a workout offers "Add a progress photo?" for that day. Completed workouts also keep a **Progress photo** button in the editor footer so a photo can be added or retaken later.
- **Photo gallery (Body Progress)**: the "Progress photos" card adds a photo for any chosen date and shows the whole library day by day, newest first, with a Today badge. Tapping a thumbnail opens the full-size viewer with a delete option.
- **Monthly report (Reports)**: "Progress photos this month" shows every photo from the selected report month, grouped by day, and prints as clean bordered thumbnails that never split across pages.
- **Profile picture (Profile)**: change or remove the avatar shown in the profile card. It is stored as a 320 px JPEG; progress photos are stored at 720 px.

Photo limits: 6 per day (adding a 7th replaces the oldest for that day) and 80 in total (the oldest are dropped first). These caps keep the single localStorage record well under browser quota limits.

## Test checklist

**Navigation and layout**
- [ ] Every page shows the sidebar with all eight links, and the current page is highlighted.
- [ ] On a narrow window (under 900px), the menu button opens the drawer, and tapping outside closes it.
- [ ] The light/dark toggle changes the theme on every page and survives a refresh.

**Workout plan**
- [ ] Choosing 4 days and selecting exactly 4 weekdays enables Generate plan. Selecting a different count shows a warning.
- [ ] Editing sets, reps, rest and split names updates the Save button ("unsaved changes" appears).
- [ ] After Save plan, the calendar shows planned days, and the dashboard shows "Today's workout".
- [ ] Delete saved plan removes the plan but keeps past workouts.

**Workout log**
- [ ] Start from plan creates a session with the split's exercises.
- [ ] "This week's plan" lists one card per training day with the correct split, and Start opens a prefilled session for that exact date.
- [ ] Starting a day while another workout is active is blocked with a clear message.
- [ ] Entering weight and reps, then ticking Done, starts the rest timer with that exercise's rest period.
- [ ] Add exercise, Add set and remove set all work.
- [ ] Finish workout moves the session to Completed and shows it on the calendar and dashboard.
- [ ] Finishing a workout offers "Add a progress photo?"; choosing photo opens the picker and saving shows the day in the gallery.
- [ ] The Progress photo button on a completed workout adds a photo for that workout's date.
- [ ] Cancel workout asks for confirmation and removes the session.
- [ ] Edit on a past workout changes it, and Save changes persists the edit.
- [ ] A second workout cannot be started while one is in progress.

**Exercise library**
- [ ] Search matches names, muscles and equipment.
- [ ] Category chips and equipment filter combine correctly.
- [ ] Details shows instructions. Log opens the workout log with the exercise added.

**Calendar**
- [ ] Previous, next and Today navigate correctly.
- [ ] Clicking a date shows its sessions, scheduled split or rest status.
- [ ] Log workout for this day opens the workout log with that date pre-filled.

**Body progress**
- [ ] Saving an entry adds it to history, the trend chart and the changes table.
- [ ] Edit loads the entry into the form, and Update entry saves it.
- [ ] Delete asks for confirmation and removes the entry.
- [ ] The dashboard weight matches the latest entry.
- [ ] Adding a progress photo for any date shows it under that day in the gallery, newest day first.
- [ ] Tapping a thumbnail opens the full-size viewer; Delete photo asks for confirmation and removes it.
- [ ] Cancelling the photo picker saves nothing and shows no error.

**Reports and backup**
- [ ] Changing the month updates the summary, comparison and personal records.
- [ ] Progress photos this month lists only photos from the selected month, grouped by day; switching months re-filters them.
- [ ] Export backup downloads a JSON file.
- [ ] Import backup restores the data (including progress photos) and rejects files that are not backups.
- [ ] Print report produces a clean page without the sidebar, and photo thumbnails print with plain borders.

**Profile**
- [ ] Saving the profile persists after refresh.
- [ ] Changing the current weight updates the body progress history.
- [ ] Change photo opens the picker; the new picture shows in the avatar circle after a refresh.
- [ ] Remove photo asks for confirmation and falls back to the placeholder icon.
- [ ] Reset all data requires confirmation and returns every page to the empty state.

**Persistence**
- [ ] Data survives navigating between pages and refreshing the browser.
- [ ] A corrupted localStorage value does not crash the app. It falls back to an empty dataset.

## Notes on the build

- Built from the specification because no existing project files were supplied. If you have an earlier version, upload it and it can be merged file by file.
- Scripts are loaded with `defer` in dependency order: Chart.js and Lucide, then `storage.js`, `goal-templates.js` (plain script, must run before `data.js`), `data.js`, `app.js`, and finally the page script.
