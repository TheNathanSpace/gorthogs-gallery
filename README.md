# The Reliquary

A small gallery for painted 3D-printed miniatures. Visitors browse without an account. One keeper account adds names, painters, online sources, and photographs.

The library is deliberately Google Photos-like: a wide justified photo wall, a grouped miniature collection, and a full-size lightbox. The skin is rustic/fantasy — dark walnut, parchment gold, display serif headings.

## What you get

- Public library of every photograph, justified into rows, newest first, infinite scroll
- Collection view of miniature cards (cover plate, name, painter)
- Dense table of every miniature and its data
- Keyword search scoped to all fields, name, painter, source, or notes
- Detail page per miniature with metadata and a large gallery
- Lightbox with keyboard arrows, original-file download, and source link
- Single admin login (username/password from environment variables)
- Create / edit / delete entries and photographs
- SQLite + files on disk, one Docker container, reverse-proxy ready

Placeholder miniatures are seeded on first boot so the vault is not empty. They are labeled **PLACEHOLDER PHOTO** — replace them from the ledger.

## Quick start (local)

```bash
cp .env.example .env.local
# edit AUTH_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847). Sign in at `/login` with the admin credentials. Data lands in `./data`.

## Docker

```bash
cp .env.example .env
# set AUTH_SECRET to a long random value
docker compose up --build
```

The example compose file publishes port **3847** and stores SQLite plus photographs in the `reliquary-data` volume. Sit this behind Caddy, Traefik, or nginx. TLS belongs on the proxy; this container speaks HTTP only.

Point the proxy at `http://reliquary:3847` (or `127.0.0.1:3847`) and forward:

- `X-Forwarded-Host` — the public hostname
- `X-Forwarded-Proto` — `https` when the public site is HTTPS

Then set `AUTH_COOKIE_SECURE=true` so the session cookie is marked Secure.

Health check: `GET /api/health`.

### Restore or clone from the volume

The named volume `reliquary-data` (mounted at `/data`) is the **entire vault**: SQLite, WAL files, and every photograph. Copy that volume onto another host and start this image — that is a cloned instance of the gallery.

Stop the source container first so SQLite is idle, then archive the volume:

```bash
docker compose stop reliquary
docker run --rm \
  -v reliquary_reliquary-data:/vault \
  -v "$PWD":/backup \
  alpine tar czf /backup/reliquary-vault.tar.gz -C /vault .
```

The compose project name prefixes the volume (`<project>_reliquary-data`). Check with `docker volume ls`.

On the new host, with this same repo/image:

```bash
docker volume create reliquary_reliquary-data
docker run --rm \
  -v reliquary_reliquary-data:/vault \
  -v "$PWD":/backup \
  alpine tar xzf /backup/reliquary-vault.tar.gz -C /vault
docker compose up -d
```

Keeper username/password, `AUTH_SECRET`, and site title are container environment, not vault data. A content clone does not copy those; set them on the new compose stack. The public library comes up from the volume alone.

Do not copy `/data` while the container is writing. `docker compose stop` first.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | (dev fallback) | **Required in production.** Signs the admin session. |
| `ADMIN_USERNAME` | `admin` | The only login name. |
| `ADMIN_PASSWORD` | `changeme` | The only login password. |
| `AUTH_COOKIE_SECURE` | `false` | Set `true` when served over HTTPS. |
| `AUTH_COOKIE_NAME` | `reliquary_session` | Session cookie name. |
| `SESSION_TTL_SECONDS` | `604800` | Session lifetime (7 days). |
| `DATA_DIR` | `./data` (`/data` in Docker) | SQLite database and uploaded media. |
| `SITE_TITLE` | `The Reliquary` | Header and page titles. |
| `SITE_TAGLINE` | `A vault of painted miniatures` | Subtitle and metadata description. |
| `SEED_DEMO` | `true` | Seed labeled placeholder miniatures if the DB is empty. |
| `MAX_UPLOAD_BYTES` | `20971520` | Per-file upload cap (20 MB). |
| `DISPLAY_MAX_EDGE` | `2400` | Long edge of the lightbox WebP. |
| `THUMB_MAX_EDGE` | `640` | Long edge of library thumbnails. |
| `SERVER_ACTION_ORIGINS` | unset | **Build-time.** Extra hosts for Server Action CSRF if the proxy does not forward `X-Forwarded-Host`. |

Copy `.env.example` and fill it in. Never commit real secrets.

### Generating `AUTH_SECRET`

```bash
openssl rand -base64 48
```

## Using it

1. Browse `/` — Photos wall (newest first, infinite scroll), Miniatures cards, or the dense Table.
2. Search any keyword and narrow the field (All / Name / Painter / Source / Notes). Painter chips are a shortcut for `Painter`.
3. Click a plate for the lightbox (Esc / arrows). **Open entry** goes to the miniature page.
4. Sign in at `/login` (Keeper). `/admin` is the ledger.
5. **New miniature** — name, painter, optional source name/URL, notes, photographs. Star a cover plate.
6. Edit later to reorder, replace, or delete photographs.

Visitors never see the login unless they open `/login`.

## Data layout

Under `DATA_DIR`:

```
data/
  reliquary.sqlite
  media/
    <photo-id>/
      original      # bytes as uploaded
      display.webp  # lightbox
      thumb.webp    # library
```

Back up the whole directory. Photographs are not stored in git.

Public URLs:

- `/media/<photo-id>/thumb`
- `/media/<photo-id>/display`
- `/media/<photo-id>/original`

## Replacing placeholders

Demo entries are clearly watermarked. From `/admin`, edit each one: change name/painter/source, delete the placeholder plates, upload your studio shots, or delete the demo miniatures and start fresh.

Set `SEED_DEMO=false` before the first start if you want an empty vault. Seeding only runs when the miniatures table is empty.

Fonts, colors, and optional textures: see [docs/theming.md](docs/theming.md).

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, Drizzle + better-sqlite3, Sharp, jose sessions. One Node process. No extra services.

## Development scripts

```bash
npm run dev     # http://127.0.0.1:3847
npm run build
npm start
npm run lint
```

Implementation status and remaining work live in [docs/status.md](docs/status.md).
