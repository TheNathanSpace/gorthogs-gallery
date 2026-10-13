# Container memory

Compose sets `mem_limit: 1g`, `read_only: true`, and tmpfs `/tmp`. Treat the memory number as a sharp knife: **too low and Docker SIGKILLs the process mid-upload**, leaving a half-written photo on disk. Too high just sits unused.

The only persistent writes are the `/data` volume. Sharp and Next.js use `/tmp`. Do not drop the tmpfs.

Pixel count drives decode RAM, not file size. The 20 MB upload cap does not bound how large a JPEG can be in pixels.

## 3000×4000 (12 megapixel) upload

Uncompressed RGBA is `3000 × 4000 × 4` = **45.8 MiB**.

The same Sharp path the app uses (`processUpload`: metadata, display WebP at 2400px long edge, then thumb WebP at 640px) was measured in a fresh Node process with no Next.js:

| Format | File size | Peak RSS above idle |
| --- | --- | --- |
| JPEG q92 | 8.1 MiB | ~26 MiB |
| Noisy PNG | 30 MiB | ~57 MiB |
| Uncompressed TIFF | 34 MiB | ~73 MiB |

That is decode + resize only. The container also needs:

- Next.js idle RAM, typically **150–300 MiB**
- The original file buffer (up to `MAX_UPLOAD_BYTES`, default 20 MiB)

## What to set

| Limit | When |
| --- | --- |
| **1G** | Comfortable default (what both Compose files ship) |
| **512M** | Floor if keepers actually upload 12MP photos |
| Below 512M | Expect OOM kills on a 3000×4000 JPEG |

A 20 MiB phone JPEG can be well above 12MP. If uploads start dying with exit 137, raise `mem_limit` before anything else.
