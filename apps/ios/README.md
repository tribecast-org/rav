# tribeMail iOS (Tauri v2)

A thin Tauri v2 shell whose single window loads the **hosted** tribeMail web
client. App name `tribeMail`, bundle id `org.tribecast.tribemail`.

## Why hosted URL, not a bundled static export

The frontend *does* support `output: 'export'` (see `frontend/next.config.ts`),
but a bundled export served from `tauri://localhost` cannot talk to the backend
without changes on both sides:

- `frontend/src/lib/api.ts` calls a relative `/api` with `credentials: "same-origin"`.
- Session cookies are `SameSite=Strict` (`backend/src/routes/auth.rs`, `mfa.rs`),
  so the browser won't send them from a different origin.
- The WebSocket is opened at `window.location.host` (`frontend/src/hooks/useWebSocket.ts`).

Loading the hosted origin keeps the page and the API same-origin, so login,
CSRF, cookies and real-time all work unchanged — and every web feature
(including the Easy mode toggle) reaches the app with no separate build.

## Backend URL

Compiled in from `TRIBEMAIL_URL` (default `https://tribemail.app`):

```bash
TRIBEMAIL_URL=https://<preview-host> npx tauri ios dev
```

Navigation to any other origin (links inside emails, Fastmail help pages) opens
in Safari instead of inside the app. The hosted page gets no Tauri IPC access.

## Layout

| Path | What |
|---|---|
| `src-tauri/src/lib.rs` | Window + URL + external-link handling |
| `src-tauri/tauri.conf.json` | Name, bundle id, icons, iOS min version |
| `src-tauri/icons/` | Placeholder icon set (regenerate: `npm run icons`) |
| `icon-source/icon.png` | 1024×1024 placeholder source, no alpha |
| `dist/index.html` | Placeholder `frontendDist` (Tauri requires one) |
| `src-tauri/gen/apple/` | Xcode project — created by `tauri ios init` on a Mac with Xcode |

## Commands

```bash
npm ci
npx tauri ios init          # needs full Xcode + CocoaPods
npx tauri ios dev           # run in the iOS simulator
cd src-tauri && cargo test  # host unit tests
```
