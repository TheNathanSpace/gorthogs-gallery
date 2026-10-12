# Theming and drop-in assets

The Reliquary ships with a rustic/fantasy skin and labeled placeholders. Swap the pieces below without changing gallery behavior.

## Fonts

Headings use **Cinzel**. Body copy uses **Source Serif 4**. Both are loaded in `src/app/layout.tsx` via `next/font/google`.

To use your own files (a blackletter title, a parchment body, a foundry license you own):

1. Put `.woff2` files in `src/fonts/` (this folder is the intended drop-in location; create it).
2. In `src/app/layout.tsx`, replace the Google imports with `localFont`:

```tsx
import localFont from "next/font/local"

const display = localFont({
  src: "../fonts/YourDisplay.woff2",
  variable: "--font-display",
})

const body = localFont({
  src: "../fonts/YourBody.woff2",
  variable: "--font-body",
})
```

Keep the CSS variables `--font-display` and `--font-body`. Utility class `font-display` and `font-heading` follow those variables.

A more ornamental title face (Cinzel Decorative, Unifraktur, etc.) works for the site name only; keep body copy readable.

## Colors

Tokens live in `src/app/globals.css`. Three skins ship, with a header toggle and `prefers-color-scheme` as the default (`system` → Night or Parchment):

| Class | Skin |
| --- | --- |
| `.night` | Walnut hall (dark). Default when the OS prefers dark. |
| `.parchment` | Cream paper, dark ink. Default when the OS prefers light. |
| `.high-contrast` | Near-black / near-white, 2px borders, no grain overlay. |

| Token | Role |
| --- | --- |
| `--background` | Walnut hall |
| `--foreground` | Parchment ink |
| `--primary` / `--gold` | Antique gold |
| `--secondary` | Forest lining |
| `--destructive` | Burgundy |
| `--card` | Shelf / plate backing |

`--gold` is also exposed as the Tailwind color `gold` (`text-gold`, `border-gold/25`).

## Textures

| File | What to make |
| --- | --- |
| `public/theme/grain.svg` | Film-grain / parchment noise overlay used as a tiled body background |
| `public/favicon.svg` | Shield-and-scroll mark. Replace with your own SVG or add `public/favicon.ico` and point `metadata.icons` in `src/app/layout.tsx` at it |

Optional extras you can add and wire in CSS:

- `public/theme/parchment.png` — full-page paper. Add it to the `body` `background-image` stack in `globals.css`.
- `public/theme/wood.jpg` — header/footer rail. Apply as `header` / `footer` background.

Keep overlays subtle; photographs should stay the focus.

## Copy

Site name and tagline are environment variables (`SITE_TITLE`, `SITE_TAGLINE`), not hardcoded in components besides defaults in `src/lib/config.ts`.

In-app phrases (Keeper, ledger, vault, plates) live in `src/lib/messages.ts`. Set `LOCALE` (default `en`) to pick a catalog. English ships first.

## Photographs

Upload JPEG, PNG, or WebP from `/admin`. The app keeps the original and writes WebP thumb + display derivatives with Sharp.

Shoot against a consistent backdrop if you want a Google Photos wall that feels like one library. Include:

- A hero / three-quarter
- A side or back
- A detail (face, freehand, base)

Mark one cover plate per miniature for the collection view.

Demo plates generated on first boot are SVG studio stand-ins with a **PLACEHOLDER PHOTO** banner. Delete them once your own files are in.
