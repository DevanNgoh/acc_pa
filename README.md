# Accountability Partner

Three pieces:
- `www/` the app (hosted free on GitHub Pages, and also wrapped as a phone app with Capacitor)
- `backend/` the chat proxy that keeps your Anthropic key off the phone (hosted on Vercel; GitHub Pages can't run server code)
- `.github/workflows/pages.yml` publishes `www/` to GitHub Pages every time you push to `main`

## 1. Host the app on GitHub Pages
1. Create a GitHub repo and push this whole folder to the `main` branch.
2. In the repo: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Push (or run the workflow from the **Actions** tab). Your app appears at
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`.
4. Open that link on your phone:
   - Android (Chrome): **Install app** in the top bar.
   - iPhone (Safari): **Install app** shows the Share > Add to Home Screen steps.

## 2. Turn on chat (backend on Vercel)
1. Import the same repo in Vercel and set **Root Directory** to `backend`.
2. Add environment variable `ANTHROPIC_API_KEY` (never put the key in the repo).
3. Optional: `ALLOWED_ORIGINS` = `https://YOUR-USERNAME.github.io,capacitor://localhost,https://localhost`
4. Copy the deployed URL into `API_URL` near the top of the script in `www/index.html`
   (it ends in `/api/chat`), then push.

## 3. Reminders
Tap **Set reminders** in the app. Two reminders: a daily check-in (default 9:00) and an end-of-day reflection (default 21:00).
- **Installed phone app (Capacitor):** real scheduled notifications that arrive even when the app is closed.
- **Browser/home-screen install:** notifications show while the app is open or recently used. If you miss one, a banner
  appears the next time you open the app. Reliable reminders with the app fully closed need either the Capacitor build
  or a push server, because GitHub Pages is static.

## 4. App-store builds (optional)
```
npm install
npx cap add ios        # Mac + Xcode
npx cap add android    # Android Studio
npx cap sync
npx cap open ios       # or android
```
Run `npx cap sync` after changing anything in `www/`.
