# ELU Live — English Level Up

ELU Live is an animated festival-style student dashboard and teacher tracker for a private four-student B1 English challenge. The repository has a zero-dependency Node development/build workflow plus a PowerShell server fallback for the supplied Windows environment.

## Included

- responsive student dashboard with an animated CSS/SVG festival stage and no background media;
- eight-week roadmap and eight distinct supplied game assets;
- four neutral student profiles: Алёна, Анастасия, Егор, Кирилл;
- true zero-state seed: 0 XP, 0 streak, 0 progress, no assets, Week 1 active, Weeks 2–8 locked;
- transaction-based XP totals, automatic zero-aware ranking, Crew Power, mission progress, events, feed, collections, and profiles;
- Admin Tracker, Quick Update, 4×8 Matrix, Lesson Mode, reason-required XP, streak controls, asset granting, two note types, mission management, per-student History, Audit Log, Preview as Student, and real Undo;
- real JPG/PNG/WebP photo upload with validation, zoom/reposition crop, 512 px WebP optimization, replacement, and removal;
- no random child photographs; monogram placeholders are the default;
- custom desktop cursor, reduced-motion support, keyboard focus, mobile bottom navigation, and interaction animations.

## Run

### Node 20+ (recommended)

```powershell
npm install
npm run dev
```

Open <http://localhost:4173/>. Do not open the application through `file:///`.

### PowerShell fallback

From PowerShell in this directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\dev-server.ps1
```

Then open <http://localhost:4173/>.

Use another port if needed:

```powershell
powershell -ExecutionPolicy Bypass -File .\dev-server.ps1 -Port 8080
```

If `powershell` is not on PATH, use the full Windows path:

```powershell
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\dev-server.ps1
```

## Admin and tracker

Open <http://localhost:4173/admin/tracker> or the compatible local route <http://localhost:4173/#admin>. The static runtime labels the control room honestly: it is a local functional prototype, **not a secure production auth boundary**.

For day-to-day tracking:

1. Open `/admin/tracker`.
2. Change a student's status or progress inline.
3. Open Quick Update for reason-required XP, streak, assets, private notes and student feedback.
4. Use `8 Week Matrix` for the 4×8 season overview.
5. Use `Lesson Mode` for large Complete / +XP / Give Asset actions.
6. Use `Preview as Student` to verify the dashboard.
7. Use the toast's `Undo` action if needed.

Edits persist in `localStorage` under `elu-live-state-v2`. Settings → Reset Season requires typing `RESET SEASON`; it preserves names and photos while returning all results to zero.

## Student photos

Admin → Media → choose a student → Upload/Replace Photo. The browser validates type and size, strips EXIF by redrawing into a canvas, applies zoom/focal positioning, and stores an optimized 512×512 WebP for the local demo. Remove restores the monogram placeholder.

Because this offline build stores photos in that browser's local storage, clear site data before handing the device to someone else. A deployed edition must move photos to authenticated private object storage with signed access and server-side deletion.

## Animated hero

The hero deliberately uses no background media. Its stage is built from the supplied festival reference, animated gradients, CSS light beams, particles, glow, doodles, and one-time text entry. `prefers-reduced-motion` and Admin → Settings → Effects reduce or disable decorative movement.

## Environment and production integrations

Copy `.env.example` to `.env` only for a future server-backed deployment. Required production values are:

- `DATABASE_URL`, `AUTH_SECRET`;
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`;
- `VK_CLIENT_ID`, `VK_CLIENT_SECRET`;
- `ADMIN_GOOGLE_EMAIL` and/or `ADMIN_VK_ID`;
- the `MEDIA_STORAGE_*` variables;
- `APP_URL`.

Google OAuth, VK OAuth, a PostgreSQL transaction ledger, private object storage, signed media URLs, server-side role checks, and protected mutation endpoints require those credentials plus a server runtime. They are not claimed as active in this dependency-free local build.

## Missions

Admin → Missions supports create, edit, duplicate, and hide/show. The canonical eight-week progression remains the `weeks` catalog near the top of `app.js`.

## Structure

```text
.
├── index.html               # accessible application shell and SVG UI icons
├── styles.css               # festival design system, responsive layout, motion
├── app.js                   # data model, routes, state, gamification, admin actions
├── package.json             # npm run dev/lint/typecheck/test/build/check
├── scripts/                 # zero-dependency Node server and validation/build tools
├── test/                    # Node test runner checks
├── dev-server.ps1           # zero-dependency local HTTP server
├── .github/workflows/ci.yml # GitHub Actions verification and build artifact
├── .env.example             # production integration placeholders
├── docs/asset-map.md        # required supplied-asset classification
├── docs/production-architecture.md # secure deployment boundary and migration path
├── public/assets/game/      # organized copies of eight game items
└── public/assets/reference/ # visual references; originals remain in root
```

## Deployment

GitHub Actions runs install, lint, syntax/type checks, tests and production artifact generation. The public repository contains only demo-safe assets, placeholders, source code and `.env.example`.

The current source repository is [`yulchikyulenka89-ai/challenge-level-up`](https://github.com/yulchikyulenka89-ai/challenge-level-up). Its Pages workflow publishes the zero-state student demo at <https://yulchikyulenka89-ai.github.io/challenge-level-up/> after Pages is enabled with **GitHub Actions** as the source in repository settings.

GitHub Pages may host only a clearly labeled frontend demo. It must not be treated as production because static hosting cannot protect the Admin Tracker or private child media. Production requires a server platform connected to GitHub, authenticated sessions, PostgreSQL, private object storage, signed media delivery, consent/retention policy, backups, rate limiting and access logging.

See [`docs/production-architecture.md`](docs/production-architecture.md) for the concrete security boundary and deployment checklist.

## Checks

```powershell
npm run check
```

This runs lint/invariant checks, JavaScript syntax checks, tests, and a production build into `dist/`.
