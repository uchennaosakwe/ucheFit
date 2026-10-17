# UcheFit

My personal fitness app: a 4-day workout plan built around my door shifts, a Monday–Sunday Nigerian meal plan on a budget, a late-night eating fix, and a weight/waist progress tracker.

It's a web app that installs on your phone like a normal app, works offline, and is hosted free on GitHub Pages. Your data stays on your phone.

---

## 1. Put it on GitHub (about 10 minutes)

1. Sign in at **github.com** (create a free account if you don't have one).
2. Click **+** (top right) → **New repository**.
   - Name: `ucheFit` (or anything you like)
   - Set it to **Public** (free GitHub Pages needs public)
   - Click **Create repository**.
3. On the new repo page, click **uploading an existing file**.
4. Unzip `ucheFit.zip` on your computer, open the folder, select **all 10 files inside it** and drag it into the upload box.
5. Click **Commit changes**.
6. Go to **Settings** → **Pages** (left menu).
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)** → **Save**.
7. Wait 1–2 minutes and refresh. GitHub shows your link, something like
   `https://YOUR-USERNAME.github.io/ucheFit/`

## 2. Install it on your phone

**Android (Chrome):** open your link → tap the **⋮** menu → **Add to Home screen** / **Install app**.

**iPhone (Safari):** open your link → tap **Share** → **Add to Home Screen**.

It now opens full-screen with your logo, and works without internet.

## 3. First time you open it

Go to the **Me** tab and enter your height, weight, age, and whether you train at a gym or at home. The app works out your daily calories and protein and tells you how to adjust the meal plan to hit them.

---

## Changing the name or logo

- **Name:** change `APP_NAME` at the top of `data.js`, the `<title>` in `index.html`, and `name` / `short_name` in `manifest.json`.
- **Logo:** replace `icon-192.png` and `icon-512.png` with your own square PNGs (same file names, 192×192 and 512×512). Keep the important part of the design in the middle, because Android trims the corners.
- **Plan content** (workouts, meals, prices, shift days): all in `data.js`, written in plain English.

After any change, open `sw.js` and bump `VERSION` (e.g. `ucheFit-v1` → `ucheFit-v2`), then upload the changed files to GitHub. Close and reopen the app on your phone twice to get the update.

## Files

| File | What it is |
|---|---|
| `index.html` | App shell |
| `styles.css` | Look and feel |
| `data.js` | **Your plan** – schedule, workouts, meals, shopping list |
| `app.js` | App logic |
| `manifest.json` | Makes it installable (name, colours, icon) |
| `sw.js` | Offline support |
| `icon-192.png`, `icon-512.png`, `logo.svg` | Logo files |

Calorie and price figures are estimates.
