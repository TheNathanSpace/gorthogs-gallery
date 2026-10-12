# Example GitHub Release body

This is what a first tag (`v1.0.0`) would publish. Image name follows the GitHub repo. The digest is an example.

---

## Container image

```bash
docker pull ghcr.io/you/reliquary:v1.0.0
```

Also tagged as the semver without the `v` prefix (and `:latest`, except on pre-releases).

Digest: `sha256:4f3c8e1a9b2d7c6e5f0a1b2c3d4e5f6789abcdef0123456789abcdef01234567`

Run it with the published image instead of a local build:

```bash
RELIQUARY_IMAGE=ghcr.io/you/reliquary:v1.0.0 \
  docker compose -f docker-compose.yml -f docker-compose.ghcr.yml up -d
```

If this is the first image from a public repository, GitHub may keep the GHCR package private until you set it public: **Packages → the package → Package settings → Change visibility**.

## Changelog

First tagged release.

- Require v-prefixed semver tags and changelog releases from git history (db79eb5)
- Publish container images and GitHub Releases from version tags (e7e5324)
- Align operator docs with vault-stored keeper keys (5877b84)
- Note the 15-character vault-key floor in the usage steps (539bcaa)
- Raise vault-key floor to 15 and block common/breached passwords (dfe0ed5)
- Store the keeper key in the vault after first login (d1a2151)
- Fix theme menu Base UI group context and skip-link tab order (c828dca)
- Fix miniature Open Graph cards for Satori layout rules (9ba2500)
- Ship the locked best-practice pack (0929869)
- Document 12MP upload RAM and cap Compose at 1G (5c3d7ce)
- Treat the data volume as a complete vault clone (9804bd6)
- Paint the newest gallery plates immediately and keep infinite scroll (f1beb0c)
- Add field-scoped search, a dense table view, and infinite scroll (d7dabb8)
- Add Reliquary miniature gallery with admin ledger and Docker (9ca9616)
- Initialize project (97970a8)

---

A later tag (`v1.1.0` after `v1.0.0`) keeps the image section and uses this changelog instead:

## Changelog

Changes since v1.0.0:

- Fix lightbox swipe on touch (a1b2c3d)
- Allow bulk import of a photo folder (e4f5a6b)

[Full changelog](https://github.com/you/reliquary/compare/v1.0.0...v1.1.0)
