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
- Single keeper login (username from env; password chosen on first login and hashed in the vault)
- Create / edit / delete entries and photographs
- SQLite + files on disk, one Docker container, reverse-proxy ready

Placeholder miniatures are seeded on first boot so the vault is not empty. They are labeled **PLACEHOLDER PHOTO** — replace them from the ledger. Set `SEED_DEMO=false` before the first start for an empty vault.

## Quick start (local)

```bash
cp .env.example .env.local
# edit AUTH_SECRET
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847). Sign in at `/login` as `admin` with vault key `changeme`, then choose a lasting key of at least 15 characters. Data lands in `./data`.

## Docker

Two Compose files:

| File | Use |
| --- | --- |
| `docker-compose.yaml` | **Server deploy.** Copy it onto the host, edit the `CHANGE` lines (`image`, `AUTH_SECRET`, `PUBLIC_BASE_URL`), `docker compose up -d`. Pulls a published GHCR image. No repo checkout, no build. |
| `docker-compose.local.yaml` | **Local image build** from this repo: `docker compose -f docker-compose.local.yaml up --build`. |

Both run the production image (`NODE_ENV=production`), cap RAM at **1G**, use a **read-only root** plus tmpfs `/tmp`, and store the vault in the `reliquary-data` volume. The process **refuses to boot** if `AUTH_SECRET` is missing or still a placeholder.

Treat `mem_limit` carefully: too low and Docker kills the process mid-upload (exit 137). A 3000×4000 photo is ~46 MiB uncompressed; 1G is the comfortable default and **512M is the floor** for 12MP uploads. Pixel count drives RAM, not file size. Measured numbers: [docs/memory.md](docs/memory.md).

Liveness: `GET /api/health` (SQLite ping + readable disk). Readiness: `GET /api/ready` (same, plus a writable vault). Compose healthchecks `/api/ready`.

### Keeper login

The keeper password is **not** an environment variable and is **not** in compose. Username defaults to `admin` (`ADMIN_USERNAME`).

1. Sign in at `/login` with vault key `changeme`.
2. Choose a lasting key of **at least 15 characters**. A passphrase is fine. There are no uppercase/digit/symbol rules.
3. Reliquary stores a scrypt hash in the vault (SQLite). Common passwords are blocked from a local list. New keys are also checked against Have I Been Pwned by **SHA-1 prefix only** (k-anonymity); the password never leaves the container. Set `PWNED_PASSWORDS=false` if the host has no outbound HTTPS. If HIBP is unreachable the check fails open; the local list still applies.

Change the key later at the bottom of the ledger. To reset a forgotten key, stop writes, then:

```bash
sqlite3 ./data/reliquary.sqlite "UPDATE keepers SET password_hash = NULL;"
```

In Docker the database is `/data/reliquary.sqlite` on the `reliquary-data` volume. Sign in with `changeme` again and choose a new key.

### Deploy (copy `docker-compose.yaml`)

Copy `docker-compose.yaml` onto the server and edit the lines marked `CHANGE`:

- `image:` — the GitHub Release tag or digest
- `AUTH_SECRET` — output of `openssl rand -base64 48`
- `PUBLIC_BASE_URL` — `https://your.domain`

Site title, locale, and the other keys sit in the same `environment:` block. A `.env` file still works if you prefer, but the intended setup is editing this file. Then:

```bash
docker compose up -d
```

It binds **127.0.0.1:3847**, sets `AUTH_COOKIE_SECURE` and turns demo seed off, and does not build from source. The image refuses to boot if `AUTH_SECRET` is still the replace-me placeholder.

The container speaks HTTP only. TLS and HSTS belong on Caddy, Traefik, or nginx. Point the proxy at `http://127.0.0.1:3847` (or the `reliquary` service on the same Docker network) and forward:

- `X-Forwarded-Host` — the public hostname
- `X-Forwarded-Proto` — `https`

Sign in on a **private** network (`admin` / `changeme`), set the lasting vault key, **then** open the proxy. Back up the `reliquary-data` volume on a schedule (see below). Give the volume disk headroom: each upload keeps original + display WebP + thumb.

`SERVER_ACTION_ORIGINS` is a **build-time** fallback if the proxy cannot forward `X-Forwarded-Host`. Prefer forwarding the headers.

### Local image build

```bash
cp .env.example .env
# set AUTH_SECRET to a long random value
docker compose -f docker-compose.local.yaml up --build
```

This publishes port **3847** on all interfaces, seeds demo miniatures by default, and does not require `PUBLIC_BASE_URL`.

### GitHub releases

This repo is meant to live on GitHub. After `main` is there, publish a version by pushing a **semver tag with a `v` prefix**. Actions refuse anything else (`v1.2.3` or `v1.2.3-rc.1`, not `1.2.3` or `v2`). They run lint, typecheck, and tests, build `linux/amd64` and `linux/arm64`, push to GitHub Container Registry, and open a GitHub Release whose description is a **changelog of commit subjects since the previous version tag**.

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Do not create the GitHub Release by hand; the workflow does that. The image is:

```text
ghcr.io/<owner>/<repo>:v1.0.0
```

The same digest is also tagged `:1.0.0`, `:1.0`, and `:latest` (not on pre-releases). On the server, set `image:` in `docker-compose.yaml` to that tag, fill in `AUTH_SECRET` and `PUBLIC_BASE_URL` in the same file, and `docker compose up -d`.

The first package from a public GitHub repo is often **private** until you change it: GitHub → **Packages** → the image → **Package settings** → **Change visibility** → Public. Private repos stay private; `docker login ghcr.io` with a `read:packages` token.

If Actions cannot push to GHCR, set **Settings → Actions → General → Workflow permissions** to read and write (or allow the `packages: write` permission this workflow requests).

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

`AUTH_SECRET`, keeper username, and site title stay in the container environment. The keeper **password hash** lives in the vault with the photographs, so a volume clone keeps the same key. Existing sessions use `AUTH_SECRET`; a new secret only invalidates cookies, not the password. The public library comes up from the volume alone.

Do not copy `/data` while the container is writing. `docker compose stop` first. Schedule that archive; the volume is the gallery.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | (dev fallback) | **Required in production.** Signs the keeper session cookie. |
| `ADMIN_USERNAME` | `admin` | The only login name. Not a secret. The password is not an env var (see Keeper login). |
| `PWNED_PASSWORDS` | `true` | Check new vault keys against Have I Been Pwned (k-anonymity). Local common-password list always runs. |
| `AUTH_COOKIE_SECURE` | `false` (`true` in `docker-compose.yaml`) | Must be `true` when served over HTTPS. |
| `AUTH_COOKIE_NAME` | `reliquary_session` | Session cookie name. |
| `SESSION_TTL_SECONDS` | `604800` | Session lifetime (7 days). |
| `DATA_DIR` | `./data` (`/data` in Docker) | SQLite database and uploaded media. |
| `PUBLIC_BASE_URL` | unset | Canonical public origin (`https://minis.example.com`). Used for Open Graph, sitemap, and the HTTPS cookie check. |
| `LOCALE` | `en` | UI language. English catalog ships first. Dates use `Intl` for this locale. |
| `SITE_TITLE` | `The Reliquary` | Header and page titles. |
| `SITE_TAGLINE` | `A vault of painted miniatures` | Subtitle and metadata description. |
| `SEED_DEMO` | `true` (`false` in `docker-compose.yaml`) | Seed labeled placeholder miniatures if the miniatures table is empty. |
| `MAX_UPLOAD_BYTES` | `20971520` | Per-file upload cap (20 MB). |
| `DISPLAY_MAX_EDGE` | `2400` | Long edge of the lightbox WebP. |
| `THUMB_MAX_EDGE` | `640` | Long edge of library thumbnails. |
| `SERVER_ACTION_ORIGINS` | unset | **Build-time.** Extra hosts for Server Action CSRF if the proxy does not forward `X-Forwarded-Host`. |

For local `npm run dev`, copy `.env.example` to `.env.local`. On the server, edit `docker-compose.yaml` instead. Never commit real secrets.

### Generating `AUTH_SECRET`

```bash
openssl rand -base64 48
```

## Using it

1. Browse `/` — Photos wall (newest first, infinite scroll), Miniatures cards, or the dense Table.
2. Search any keyword and narrow the field (All / Name / Painter / Source / Notes). Painter chips are a shortcut for `Painter`.
3. Click a plate for the lightbox (Esc / arrows). **Open entry** goes to the miniature page.
4. Sign in at `/login`. First time: `admin` / `changeme`, then a lasting vault key of at least 15 characters. `/admin` is the ledger. Change the key later at the bottom of the ledger. Visitors never need this.
5. **New miniature** — name, painter, optional source name/URL, notes, photographs. Star a cover plate.
6. Edit later to reorder, replace, or delete photographs.

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

## Image digest pinning (optional)

A GitHub Release lists the GHCR digest. In `docker-compose.yaml`, set:

```yaml
image: ghcr.io/<owner>/<repo>@sha256:…
```

Do not commit a digest you have not verified.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui, Drizzle + better-sqlite3, Sharp, jose sessions. One Node process. No extra services.

## Development scripts

```bash
npm run dev     # http://127.0.0.1:3847
npm run build
npm start
npm run lint
npm run typecheck
npm test
```

Implementation status and remaining work live in [docs/status.md](docs/status.md).
