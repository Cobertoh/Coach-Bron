# Coach Bron (PWA)

Basketball learning + development app. No build step: static files.

## Run
Needs https (or localhost) for accounts (WebCrypto), camera and the service worker.
- Local: `python3 -m http.server 8765` then open http://localhost:8765
- iPhone: host the folder on any https static host (Netlify Drop, GitHub Pages, Cloudflare Pages), open in Safari, Share > Add to Home Screen.

## Cloud accounts (sign in on any device)
Accounts and data sync through a Cloudflare Pages Function (`functions/api/[[route]].js`) backed by a Cloudflare D1 database.
One-time setup in the Cloudflare dashboard:
1. The Pages project must be connected to this GitHub repo (Functions are not deployed by drag-and-drop uploads).
2. Storage & Databases → D1 → Create database (any name, e.g. `coach-bron`).
3. Pages project → Settings → Bindings → Add → D1 database: variable name `DB`, pick the database. Save.
4. Deployments → Retry/redeploy the latest deployment. Tables are created automatically on first use.
Check it at `https://<your-site>/api/health`: it should show `{"ok":true,"db":true}`.
Without the database the app falls back to device-only accounts and says so on the sign-in screen.
Accounts made on a device before cloud setup are moved to the cloud (with their data) the first time you sign in.

## Visuals
Every lesson step, common mistake (wrong vs right), drill step, glossary term and player skill has an animated illustration:
- `js/figure.js`: animated player figure (IK poses, ball flight, rim, on-body labels such as joint angles).
- `js/scene.js`: top-down court animations for reads, spacing, systems and terms.
- `js/picto.js`: pictograms and infographics (timeline, shot clock, scoreboard, pace bar).
- Content mapping lives in `js/visuals/map.js`; clips in `js/visuals/clips.js`; court scenes in `js/visuals/scenes.js`.
Each lesson also has a "Watch it" player that plays all steps in order. These are illustrations, not real footage.

## Honest limitations
- Camera + MediaPipe pose analysis is NOT tested on a real device. Pose rules were tested on synthetic landmarks only. First analysis needs internet to fetch the MediaPipe runtime/model (then cached).
- Ball tracking is not implemented; it is reported as "not evaluated".
- With cloud accounts set up, data syncs per record (last change wins). Without them, data stays in one browser; use Profile > Backup/Restore.
- No email: password recovery uses the one-time recovery code shown at signup. Lose both and the account can't be recovered.
- Videos are never uploaded; only analysis results sync.
- Content is a starter library (59 lessons, 29 drills, 35 terms, 15 players without stats/video, 13 plays). No video bundled.
- iOS may evict site data if the app is unused for weeks; keep backups.
