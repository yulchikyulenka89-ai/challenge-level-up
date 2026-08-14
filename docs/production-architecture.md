# ELU Live production architecture

The current application is a fully interactive local prototype. Its browser-side Admin Tracker and `localStorage` persistence are intentionally not presented as a production security boundary.

## Required boundary

```text
Browser
  -> HTTPS server application
       -> Google/VK OAuth session + explicit admin allowlist
       -> protected mutation API with server-side validation and audit records
       -> PostgreSQL XP transaction ledger and season data
       -> private object storage with signed, short-lived media URLs
```

Student-facing reads may be public only when they contain no private notes, identifiers, or media. Every Admin route and mutation must be authorized on the server; hiding controls in the browser is not authorization.

## Data rules

- Derive XP totals from immutable, reason-required transactions rather than trusting a client total.
- Store teacher notes separately from student-visible feedback and never include private notes in public responses.
- Keep child photos in a private bucket, strip metadata, validate content server-side, and issue expiring URLs.
- Record actor, timestamp, action, target, before/after summary, and request identifier in an append-only audit trail.
- Enforce retention, consent, deletion, backup, and restore procedures before real student data is entered.

## Deployment checklist

1. Create the private GitHub repository and require the included CI workflow on the default branch.
2. Connect a server-capable host; do not use GitHub Pages for the production Admin Tracker.
3. Provision PostgreSQL and private object storage in the deployment region selected by the owner.
4. Configure the variables documented in `.env.example` in the host's encrypted secret store.
5. Implement Google/VK callbacks, secure cookies, CSRF protection, rate limiting, and the admin allowlist.
6. Move state mutations, image handling, XP calculations, Undo, and audit writes behind authenticated APIs.
7. Run authorization, privacy, backup/restore, accessibility, responsive, and browser tests before launch.

No production credentials belong in the repository. `.env` and local student-media directories are excluded by `.gitignore`.
