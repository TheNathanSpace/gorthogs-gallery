# Requirements

Product source of truth for The Reliquary. Implementation status lives in [docs/status.md](status.md). Setup and operator workflow live in [README.md](../README.md).

IDs are stable. **Must** items are the shipped slice. **Stretch** items are later work already named in status; they are not promises for the next session except where status says to start.

## Information architecture

| Path | Who | Purpose |
| --- | --- | --- |
| `/` | Visitor | Whole library. When a keeper has named an Honored Emissary, that miniature is shown in a banner above the shelves. Default is the photo wall. `?view=collection` is miniature cards. `?view=table` is the dense table. `?q` and `?field` filter. `?photo=<id>` opens the lightbox. |
| `/miniatures/[slug]` | Visitor | One miniature: metadata and a large gallery. If it is the Honored Emissary, the eyebrow says so. A signed-in keeper also sees edit and delete. |
| `/login` | Visitor | Keeper sign-in. First visit accepts `changeme` and asks for a lasting key. |
| `/admin` | Keeper | Ledger: every miniature, the Honored Emissary picker, a link to create one, and the change-key form. |
| `/admin/miniatures/new` | Keeper | Create a miniature and its photographs. |
| `/admin/miniatures/[id]/edit` | Keeper | Edit fields, replace or delete photographs, choose the cover, reorder with buttons. |
| `/media/[id]/thumb` | Visitor | Library thumbnail WebP. |
| `/media/[id]/display` | Visitor | Lightbox WebP. |
| `/media/[id]/original` | Visitor | Bytes as uploaded. |
| `/api/library/photos` | Visitor | Next page of the photo wall. |
| `/api/health` | Probe | Liveness: SQLite ping and a readable disk. |
| `/api/ready` | Probe | Readiness: liveness plus a writable vault. |
| `/sitemap.xml`, `/robots.txt` | Crawler | Discovery. Open Graph images ship for the site and each miniature. |

Header links: Library, theme, and either Keeper (`/login`) or Ledger plus Sign out.

## Library

| ID | Status | Requirement |
| --- | --- | --- |
| LIB-01 | Must | Visitors browse the library without an account. |
| LIB-02 | Must | The default view is a justified photo wall, newest first, with infinite scroll. |
| LIB-03 | Must | `?view=collection` shows miniature cards: cover plate, name, and painter. |
| LIB-04 | Must | `?view=table` is a dense table of every miniature and its data. |
| LIB-05 | Must | Each miniature has a public detail page at `/miniatures/[slug]` with metadata and a large gallery. |
| LIB-06 | Must | A lightbox opens from a plate (`?photo=` on the library, and from the detail gallery). It supports Esc, keyboard arrows, original-file download, and the source link when the miniature has one. |
| LIB-07 | Must | Browsing is Google Photos-like: dense rows, newest first, infinite scroll, a lightbox, and a shareable `?photo=` link. LIB-02 and LIB-06 carry this. |
| LIB-08 | Stretch | Touch swipe moves between photographs in the lightbox. |
| LIB-09 | Stretch | A public RSS or JSON feed lists new entries. |
| LIB-10 | Must | When a keeper has named an Honored Emissary, every library view shows that miniature in a banner above the shelves, including during search. Clearing the honor removes the banner. |

## Search

| ID | Status | Requirement |
| --- | --- | --- |
| QRY-01 | Must | Keyword search filters the library. |
| QRY-02 | Must | `field` scopes that search to all fields, name, painter, source, or notes. |
| QRY-03 | Must | Painter chips are a shortcut for `field=painter` and that painter's name. |

## Data

| ID | Status | Requirement |
| --- | --- | --- |
| DB-01 | Must | Each miniature has a name, a painter, an optional online source, and photographs. |
| DB-02 | Must | The vault is SQLite plus files under `DATA_DIR`. Photograph bytes are not stored in the database. |
| DB-03 | Must | Painter is free text, not a user account. |
| DB-04 | Must | Source is an optional name plus URL. |
| DB-05 | Must | Notes are optional (recipes, scale, and similar). |
| DB-06 | Must | When the miniatures table is empty and `SEED_DEMO` is true, boot seeds three labeled placeholder miniatures. |
| DB-07 | Must | Each upload keeps the original bytes, a display WebP, and a thumb WebP. |
| DB-08 | Stretch | EXIF (lens, capture date) is stored from uploads when present. |

## Keeper

| ID | Status | Requirement |
| --- | --- | --- |
| ADM-01 | Must | There is one keeper. The username comes from `ADMIN_USERNAME` (default `admin`). The password is not an environment variable. |
| ADM-02 | Must | Until a lasting key is set, `/login` accepts `changeme`. The lasting key is an scrypt hash in the `keepers` table. The session is a signed httpOnly cookie. |
| ADM-03 | Must | A lasting key is at least 15 characters, with no composition rules. A local common-password list always applies. When `PWNED_PASSWORDS` is true, new keys are checked against Have I Been Pwned by SHA-1 prefix only. |
| ADM-04 | Must | The keeper can create, edit, and delete miniatures and photographs, star a cover plate, and reorder photographs with buttons. |
| ADM-05 | Must | The keeper can change the vault key from the bottom of the ledger. |
| ADM-06 | Stretch | Drag-and-drop reorder in the admin photo strip. ADM-04's buttons are the current control. |
| ADM-07 | Stretch | The keeper can bulk-import a folder of photographs. |
| ADM-08 | Stretch | More than one keeper can sign in. |
| ADM-09 | Must | From the ledger, the keeper can name one existing miniature as the Honored Emissary, clear that choice, or replace it with another. Deleting the honored miniature clears the honor. |

## Theme and language

| ID | Status | Requirement |
| --- | --- | --- |
| THM-01 | Must | The skin is rustic/fantasy: dark walnut, parchment gold, display serif headings. |
| THM-02 | Must | Themes are night, parchment, and high contrast. The default follows the OS. A pick is saved in `localStorage`. |
| THM-03 | Must | Fonts, colors, and textures can be swapped by the drop-in instructions in [docs/theming.md](theming.md). Placeholder miniatures are labeled so they can be replaced from the ledger. |
| THM-04 | Must | `LOCALE` selects the UI language. The English catalog ships first. Dates use `Intl` for that locale. |

## Operations

| ID | Status | Requirement |
| --- | --- | --- |
| OPS-01 | Must | One Node process in one container. No extra services. The app speaks HTTP only. |
| OPS-02 | Must | Configuration is environment variables, except the keeper password (ADM-01). |
| OPS-03 | Must | `docker-compose.yaml` is the copy-paste server deploy. `docker-compose.local.yaml` builds from this repo. |
| OPS-04 | Must | TLS and HSTS stay on the reverse proxy. The app uses `X-Forwarded-Host` and `X-Forwarded-Proto`. |
| OPS-05 | Must | [README.md](../README.md) is the operations guide. This file is the product source of truth. [docs/status.md](status.md) is the pickup document. |
| OPS-06 | Must | Drizzle migrations in `drizzle/` apply on boot. |
| OPS-07 | Must | `GET /api/health` is liveness. `GET /api/ready` is readiness. Compose healthchecks `/api/ready`. |
| OPS-08 | Must | Production boot refuses a missing or placeholder `AUTH_SECRET`. Responses send a content security policy and related headers. |
| OPS-09 | Must | CI runs lint, typecheck, and tests. |
| OPS-10 | Must | A `vMAJOR.MINOR.PATCH` tag builds a multi-arch image, pushes it to GHCR, and opens a GitHub Release whose description is the commit subjects since the previous version tag. |
