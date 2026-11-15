# weGogym

A personal performance tracker for strength training. It tracks workouts, personal records, body measurements, and progress photos, and includes a nutrition calculator that sets daily calorie and macro targets. It runs as an installable, offline-capable Progressive Web App (PWA) with light and dark themes.

## Features

- **Dashboard**: a summary of recent activity, including a Weekly Training Volume chart (total tonnage lifted per day over the last 7 days) with a switchable volume unit.
- **Quick Session**: log a workout quickly.
- **Personal records (PRs)**: track best lifts and show them as PR cards.
- **Body progress**: record measurements and view the change since the first entry (delta and percentage), charted over time.
- **Progress photos**: store photos alongside your progress.
- **Nutrition targets**: calculates BMR (Mifflin-St Jeor), TDEE, a goal-based calorie target, and protein, fat, and carb targets from your profile.
- **Printable reports**: a report area with KPIs, PR cards, and photos that can be printed.
- **Profile and settings**: age, sex, height, weight, activity level, and fitness goal, plus theme and unit preferences.
- **Offline support**: the app shell is cached by a service worker, so the app opens without a network connection.
- **Installable**: a web app manifest lets you add the app to your home screen. Browsers that support direct install show an "Install App" button; others use the browser menu.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Main page and layout. Loads the stylesheets and scripts. |
| `app.js` | Application logic: tabs, dashboard, workouts, PRs, measurements, photos, reports, theme, and charts (Chart.js). |
| `nutrition.js` | Nutrition calculation engine. Exports `calculateNutrition` and related helpers, or sets `window.wegogymNutrition` in the browser. |
| `styles.css` | Custom styles, including theme overrides and toast notifications. |
| `styles.tailwind.css` | Compiled Tailwind CSS, generated from the Tailwind config. |
| `tailwind-config.js` | Tailwind configuration: fonts, the static color palette, and theme-aware colors driven by CSS variables. |
| `service-worker.js` | Offline caching. The cache name (`CACHE_NAME`) must be bumped whenever shell files change. |
| `manifest.webmanifest` | PWA manifest: name, icons, theme, and display mode. |
| `package.json` | Dev dependency on `tailwindcss` 3.4.17 and the `build:css` script. |

## Getting started

### Run locally

The service worker only works over `https://` or `localhost`, so serve the folder with a static server instead of opening `index.html` directly:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Build the Tailwind CSS

```bash
npm install
npm run build:css
```

The build script reads `tailwind.input.css` and writes `styles.tailwind.css`. Make sure `tailwind.input.css` is in the project root. It was not included in the uploaded files, so the build will fail until it is added.

### Deploy

Serve all files from the same folder over HTTPS. The service worker and the install prompt both require HTTPS in production.

## Updating the app

1. Make your changes.
2. Bump `CACHE_NAME` in `service-worker.js` (for example, `wegogym-shell-v9` to `wegogym-shell-v10`). This makes browsers fetch the updated files instead of serving the cached copies.
3. Upload the changed files and do a hard reload.

If a shell file is added or renamed, update the `SHELL` list in `service-worker.js` as well.

## Nutrition calculation

`nutrition.js` works in this order:

1. **BMR** with the Mifflin-St Jeor equation (+5 for male, -161 for female).
2. **TDEE** = BMR × an activity multiplier (sedentary 1.2 up to extremely active 1.9).
3. **Calorie target** = TDEE adjusted by the goal: muscle building +7%, strength +3%, maintenance and endurance 0%, fat loss -15%.
4. **Protein** = body weight × a goal-based factor (g/kg). The custom factor is used only if it falls inside the goal's range.
5. **Fat** = body weight × a factor clamped to 0.6 to 1.0 g/kg.
6. **Carbs** fill the remaining calories (4 kcal/g). If carbs drop below 50 g, the calculator lowers fat first, then protein toward its goal minimum. If it still can't fit, it keeps the calorie target, enforces the 50 g carb floor, and returns a warning.

Warnings are returned for macros that don't match the target, carb floors that exceed the target, and calorie targets below safe floors (1200 kcal for female, 1500 kcal for male). Profile values outside plausible ranges return an error instead of a target.

The output is for general guidance and is not medical advice.

## Browser support

Modern Chrome, Edge, Firefox, Safari, and their mobile versions. Direct install from the page is available only in browsers that support the `beforeinstallprompt` event, such as Chromium-based browsers on Android and desktop. On iOS, use "Add to Home Screen" from the Share menu.

## Known issues

- `package.json` expects `tailwind.input.css`, which is not in the repository yet.
- `index.html` loads `styles.css` and the compiled Tailwind file. Any custom style changes need to go into `styles.css` to take effect.
- The service worker caches the shell files with a stale-while-revalidate strategy, so users may see the previous version on their first reload after an update.

## License

Private project. All rights reserved.