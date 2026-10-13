# Status

Last updated: 2026-10-13 (docker-compose.yaml is the copy-paste deploy file)

## Current state

The first complete slice is implemented and intended to be runnable:

- Public justified photo library (newest first, infinite scroll), miniature cards, and a dense table
- Keyword search with field scope (all / name / painter / source / notes)
- Miniature detail pages with full-size lightbox
- Single keeper session: `ADMIN_USERNAME` from env, password hashed in SQLite after first login (`changeme` until then), signed httpOnly cookie
- Create / edit / delete miniatures and photographs
- SQLite + filesystem media under `DATA_DIR`
- Demo seed (three labeled placeholder miniatures) when the miniatures table is empty
- Rustic/fantasy theme with documented font/texture drop-ins; default follows the OS, a pick is saved in `localStorage`
- Dockerfile, `docker-compose.yaml` (copy-paste deploy), `docker-compose.local.yaml` (local build), `.env.example`
- README as the central operations guide (including reverse-proxy deploy); [docs/memory.md](memory.md) for 3000×4000 RAM estimates
- Drizzle Kit migrations in `drizzle/`, applied on boot
- Night / parchment / high-contrast themes, thin English i18n, OG/robots/sitemap
- `/api/health` vs `/api/ready`, request logs, CSP and related headers
- CI: lint, typecheck, tests (lockout, search, pagination, rejected uploads, password policy)
- Tag `vMAJOR.MINOR.PATCH` on GitHub: tests, multi-arch image to GHCR, GitHub Release with a commit changelog

## Requirements (from the original brief)

| Requirement | Status |
| --- | --- |
| Per-miniature name, painter, online source, pictures | Done |
| Detailed views with full-size images | Done (lightbox + `/media/.../original`) |
| Wide whole-library views | Done (Photos wall, Miniatures grid, dense Table) |
| Google Photos-like browsing | Done (dense rows, newest first, infinite scroll, lightbox, `?photo=`) |
| Keyword search with field narrowing | Done (`q` + `field`) |
| Dense table of all entry data | Done (`?view=table`) |
| Simple one-account admin login | Done (first login `changeme`, then a hash in the vault) |
| Public browse without accounts | Done |
| Admin can create entries | Done (edit/delete included so the ledger is usable) |
| Modern interaction, rustic/fantasy theme | Done |
| Placeholder assets with drop-in instructions | Done (`docs/theming.md`) |
| Single Docker container | Done |
| Config via environment variables | Done (password is not an env var) |
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
- Session JWT in an httpOnly cookie; username from `ADMIN_USERNAME`; password scrypt-hashed in the `keepers` table
- Vault keys: 15+ characters, no composition rules, local common-password list, optional HIBP k-anonymity
- Port `3847` locally and in the container; production should not publish it on the public internet
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
- `AUTH_SECRET` has a development fallback; production startup refuses a missing or placeholder secret.
- Demo seed runs only on an empty miniatures table. Deleting all rows and restarting with `SEED_DEMO=true` will recreate placeholders. `docker-compose.yaml` defaults `SEED_DEMO` to false.
- Native modules (`better-sqlite3`, `sharp`) need a Debian-based image; the Dockerfile uses `node:22-bookworm-slim`.
- Cloning: copy the `reliquary-data` volume after `docker compose stop`. That volume is the whole vault, including the keeper password hash. `AUTH_SECRET` stays in compose/env; rotating it invalidates sessions, not the password.
- Compose `mem_limit` is 1G. Too low OOMs an upload. Do not drop below 512M for 12MP photos. See [docs/memory.md](memory.md).
- Until the keeper sets a lasting key, `/login` accepts `changeme`. Set the key on a private network before publishing the proxy. There is no `ADMIN_PASSWORD` env.
- `docker-compose.yaml` binds `127.0.0.1:3847`. `docker-compose.local.yaml` publishes `3847` on all interfaces. TLS/HSTS stay on the reverse proxy.
- CSP allows `'unsafe-inline'` scripts/styles because Next.js still emits them. Images are `'self'` plus `data:`/`blob:`. No third-party script hosts.
