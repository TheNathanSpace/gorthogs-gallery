# Status

Last updated: 2026-10-12 (NIST password floor 15, local common list, HIBP k-anonymity)

## Current state

The first complete slice is implemented and intended to be runnable:

- Public justified photo library (newest first, infinite scroll), miniature cards, and a dense table
- Keyword search with field scope (all / name / painter / source / notes)
- Miniature detail pages with full-size lightbox
- Single-admin session (env username/password, signed httpOnly cookie)
- Create / edit / delete miniatures and photographs
- SQLite + filesystem media under `DATA_DIR`
- Demo seed (three labeled placeholder miniatures) when the vault is empty
- Rustic/fantasy theme with documented font/texture drop-ins
- Dockerfile, `docker-compose.yml` (1G cap, read-only root, tmpfs `/tmp`), `.env.example`
- README as the central operations guide; [docs/memory.md](memory.md) for 3000×4000 RAM estimates
- Drizzle Kit migrations in `drizzle/`, applied on boot
- Night / parchment / high-contrast themes, thin English i18n, OG/robots/sitemap
- `/api/health` vs `/api/ready`, request logs, CSP and related headers
- CI: lint, typecheck, tests (lockout, search, pagination, rejected uploads)

## Requirements (from the original brief)

| Requirement | Status |
| --- | --- |
| Per-miniature name, painter, online source, pictures | Done |
| Detailed views with full-size images | Done (lightbox + `/media/.../original`) |
| Wide whole-library views | Done (Photos wall, Miniatures grid, dense Table) |
| Google Photos-like browsing | Done (dense rows, newest first, infinite scroll, lightbox, `?photo=`) |
| Keyword search with field narrowing | Done (`q` + `field`) |
| Dense table of all entry data | Done (`?view=table`) |
| Simple one-account admin login | Done |
| Public browse without accounts | Done |
| Admin can create entries | Done (edit/delete included so the ledger is usable) |
| Modern interaction, rustic/fantasy theme | Done |
| Placeholder assets with drop-in instructions | Done (`docs/theming.md`) |
| Single Docker container | Done |
| Config via environment variables | Done |
| Example compose file | Done |
| Reverse-proxy friendly (no TLS in-app) | Done |
| README as source of truth | Done |
| `docs/` plus this status file | Done |

## Decisions locked for this slice

- Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui
- SQLite (better-sqlite3 + Drizzle) rather than Postgres — fits one container
- Images on disk, not in the database
- Painter is a free-text field, not a user account
- Source is optional name + URL
- Optional notes field for recipes / scale
- Session JWT in an httpOnly cookie; credentials only from env
- Port `3847` locally and in the container
- Default site title “The Reliquary”

## Todos / later

- [x] Keyword search with per-field scope
- [x] Dense table view of every entry
- [x] Newest photographs at the top of the wall
- [x] Infinite scroll on the photo library
- [ ] Drag-and-drop reorder in the admin photo strip (buttons work today)
- [ ] Touch swipe on the lightbox
- [ ] Optional public RSS / JSON feed of new entries
- [ ] EXIF capture (lens, date) if you want shooting notes stored automatically
- [ ] Bulk import of a folder of photos
- [ ] Multiple keepers, if the vault ever needs more than one login
- [x] Automated tests around upload, field search, newest-first pagination, and auth lockout
- [x] Fail-closed production boot, security headers, skip link / focus trap / reduced motion
- [x] Drizzle Kit migrations on boot
- [x] Night / parchment / high-contrast + header toggle
- [x] Thin i18n (LOCALE, English catalog, Intl dates)
- [x] Open Graph cards, robots.txt, sitemap
- [x] Request logs, SQLite+disk health, `/api/ready` vs `/api/health`
- [x] Read-only root, tmpfs `/tmp`, memory limit with caution

## Known caveats

- `SERVER_ACTION_ORIGINS` is read at **image build** time because it lives in `next.config.ts`. Prefer forwarding `X-Forwarded-Host` on the proxy instead of baking hosts into the image.
- `AUTH_SECRET` has a development fallback; production startup of session signing will throw if it is missing.
- Demo seed runs only on an empty miniatures table. Deleting all rows and restarting with `SEED_DEMO=true` will recreate placeholders.
- Native modules (`better-sqlite3`, `sharp`) need a Debian-based image; the Dockerfile uses `node:22-bookworm-slim`.
- Cloning: copy the `reliquary-data` volume after `docker compose stop`. That volume is the whole vault, including the keeper password hash. `AUTH_SECRET` stays in compose/env.
- Compose `mem_limit` is 1G. Too low OOMs an upload. Do not drop below 512M for 12MP photos. See [docs/memory.md](memory.md).
- Production boot refuses placeholder `AUTH_SECRET`. If `PUBLIC_BASE_URL` is HTTPS, `AUTH_COOKIE_SECURE` must be true. There is no `ADMIN_PASSWORD` env: first login is `changeme`, then a scrypt hash in the vault. Lasting keys: 15+ characters, local common-password blocklist, optional HIBP range API (`PWNED_PASSWORDS`).
- CSP allows `'unsafe-inline'` scripts/styles because Next.js still emits them. Images are `'self'` plus `data:`/`blob:`. No third-party script hosts.
