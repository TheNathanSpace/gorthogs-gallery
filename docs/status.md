# Status

Last updated: 2026-10-16 (typecheck generates Next.js route types before tsc)

Latest change: `npm run typecheck` runs `next typegen` before `tsc`, so CI can see generated helpers such as `LayoutProps`.

## Current state

The first complete slice is implemented and intended to be runnable. Requirement IDs below are defined in [docs/requirements.md](requirements.md).

- Public justified photo library (newest first, infinite scroll), miniature cards, and a dense table (LIB-02, LIB-03, LIB-04, LIB-07)
- Keyword search with field scope (QRY-01, QRY-02, QRY-03)
- Miniature detail pages with a full-size lightbox (LIB-05, LIB-06)
- Single keeper session: `ADMIN_USERNAME` from env, password hashed in SQLite after first login (`changeme` until then), signed httpOnly cookie (ADM-01, ADM-02, ADM-03)
- Create / edit / delete entries and photographs (ADM-04, ADM-05)
- SQLite + filesystem media under `DATA_DIR` (DB-01 through DB-07)
- Demo seed (three labeled placeholder miniatures) when the miniatures table is empty (DB-06)
- Rustic/fantasy theme with documented font/texture drop-ins; default follows the OS, a pick is saved in `localStorage` (THM-01, THM-02, THM-03)
- Dockerfile, `docker-compose.yaml` (copy-paste deploy), `docker-compose.local.yaml` (local build), `.env.example` (OPS-01, OPS-03)
- README as the operations guide (including reverse-proxy deploy); [docs/memory.md](memory.md) for 3000×4000 RAM estimates (OPS-05)
- Drizzle Kit migrations in `drizzle/`, applied on boot (OPS-06)
- Night / parchment / high-contrast themes, thin English i18n, OG/robots/sitemap (THM-02, THM-04)
- `/api/health` vs `/api/ready`, request logs, CSP and related headers (OPS-07, OPS-08)
- CI: lint, typecheck, tests (lockout, search, pagination, rejected uploads, password policy) (OPS-09)
- Tag `vMAJOR.MINOR.PATCH` on GitHub: tests, multi-arch image to GHCR, GitHub Release with a commit changelog (OPS-10)

## Status table

Must rows are the shipped slice. Stretch rows are open.

| ID | Level | State | Note |
| --- | --- | --- | --- |
| LIB-01 | Must | Done | Public browse, no visitor account |
| LIB-02 | Must | Done | Photo wall, newest first, infinite scroll |
| LIB-03 | Must | Done | `?view=collection` |
| LIB-04 | Must | Done | `?view=table` |
| LIB-05 | Must | Done | `/miniatures/[slug]` |
| LIB-06 | Must | Done | Lightbox, arrows, original download, `?photo=` |
| LIB-07 | Must | Done | Covered by LIB-02 and LIB-06 |
| LIB-08 | Stretch | Open | Lightbox swipe |
| LIB-09 | Stretch | Open | Public RSS or JSON feed |
| QRY-01 | Must | Done | Keyword search |
| QRY-02 | Must | Done | `field`: all, name, painter, source, notes |
| QRY-03 | Must | Done | Painter chips |
| DB-01 | Must | Done | Name, painter, source, photographs |
| DB-02 | Must | Done | SQLite + files on disk |
| DB-03 | Must | Done | Painter is free text |
| DB-04 | Must | Done | Optional source name + URL |
| DB-05 | Must | Done | Optional notes |
| DB-06 | Must | Done | Placeholder seed on an empty table |
| DB-07 | Must | Done | Original + display WebP + thumb WebP |
| DB-08 | Stretch | Open | EXIF lens and capture date |
| ADM-01 | Must | Done | One keeper; username from env |
| ADM-02 | Must | Done | `changeme`, then scrypt hash and cookie session |
| ADM-03 | Must | Done | 15+ characters, local list, optional HIBP |
| ADM-04 | Must | Done | Create, edit, delete, cover, button reorder |
| ADM-05 | Must | Done | Change key on the ledger |
| ADM-06 | Stretch | Open | Drag-and-drop reorder; buttons satisfy ADM-04 |
| ADM-07 | Stretch | Open | Bulk import of a folder |
| ADM-08 | Stretch | Open | Multiple keepers |
| THM-01 | Must | Done | Rustic/fantasy skin |
| THM-02 | Must | Done | Night, parchment, high contrast |
| THM-03 | Must | Done | Drop-ins in [docs/theming.md](theming.md) |
| THM-04 | Must | Done | `LOCALE`, English catalog, `Intl` dates |
| OPS-01 | Must | Done | One container, HTTP only |
| OPS-02 | Must | Done | Env config; password stays in the vault |
| OPS-03 | Must | Done | Deploy Compose and local build Compose |
| OPS-04 | Must | Done | TLS on the reverse proxy |
| OPS-05 | Must | Done | README, this file, and the requirements spec |
| OPS-06 | Must | Done | Migrations on boot |
| OPS-07 | Must | Done | `/api/health` and `/api/ready` |
| OPS-08 | Must | Done | Fail-closed `AUTH_SECRET`, security headers |
| OPS-09 | Must | Done | Lint, typecheck, tests |
| OPS-10 | Must | Done | Version tag publishes GHCR and a GitHub Release |

## UI map

| Surface | Who | What it shows |
| --- | --- | --- |
| `/` | Visitor | Photo wall. `?view=collection` cards. `?view=table` dense table. `?q` and `?field` search. `?photo=` lightbox. |
| `/miniatures/[slug]` | Visitor | Name, painter, source, notes, gallery, lightbox. Keeper sees edit and delete. |
| `/login` | Visitor | Keeper sign-in and the first lasting-key step. |
| `/admin` | Keeper | Ledger list, new-miniature link, change-key form. |
| `/admin/miniatures/new` | Keeper | Create form: fields, photographs, cover. |
| `/admin/miniatures/[id]/edit` | Keeper | Edit fields, photographs, cover, button order, delete. |
| `/media/[id]/thumb` | Visitor | Thumbnail WebP. |
| `/media/[id]/display` | Visitor | Lightbox WebP. |
| `/media/[id]/original` | Visitor | Original upload. |
| `/api/library/photos` | Visitor | Next photo-wall page. |
| `/api/health` | Probe | Liveness. |
| `/api/ready` | Probe | Readiness. Compose uses this. |
| `/sitemap.xml`, `/robots.txt`, Open Graph images | Crawler | Discovery and share cards. |

Header: Library, theme toggle, and either Keeper or Ledger plus Sign out.

## Next session

Start at **ADM-06**. The admin photo strip on `/admin/miniatures/[id]/edit` already reorders with buttons and stores `sortOrder`. Add drag-and-drop on that strip without changing the stored order contract. Leave LIB-08, LIB-09, DB-08, ADM-07, and ADM-08 until that lands.

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
- [docs/requirements.md](requirements.md) is the product source of truth. This file is pickup status. The README is the operations guide.

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
