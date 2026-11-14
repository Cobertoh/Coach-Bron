# Coach Bron (PWA)

Basketball learning + development app. No build step: static files.

## Run
Needs https (or localhost) for accounts (WebCrypto), camera and the service worker.
- Local: `python3 -m http.server 8765` then open http://localhost:8765
- iPhone: host the folder on any https static host (Netlify Drop, GitHub Pages, Cloudflare Pages), open in Safari, Share > Add to Home Screen.

## Honest limitations
- Camera + MediaPipe pose analysis is NOT tested on a real device. Pose rules were tested on synthetic landmarks only. First analysis needs internet to fetch the MediaPipe runtime/model (then cached).
- Ball tracking is not implemented; it is reported as "not evaluated".
- Data is local to this browser (IndexedDB). No cross-device sync. Use Profile > Backup/Restore.
- No email: password recovery uses the one-time recovery code shown at signup. Lose both and the account can't be recovered.
- Content is a starter library (59 lessons, 29 drills, 35 terms, 15 players without stats/video, 13 plays). No video bundled.
- iOS may evict site data if the app is unused for weeks; keep backups.
