import { mkdir, writeFile } from "node:fs/promises"
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import sharp from "sharp"

import { SEED_DEMO } from "@/lib/config"
import { photoDir, photoPath } from "@/lib/images"
import { placeholderSvg } from "@/lib/placeholder-art"
import { miniatures, photos } from "@/lib/schema"

type SeedPhoto = {
  filename: string
  width: number
  height: number
  hue: number
  silhouette: "knight" | "dragon" | "mage" | "generic"
  cover?: boolean
}

type SeedMiniature = {
  id: string
  slug: string
  name: string
  painterName: string
  sourceName: string
  sourceUrl: string
  notes: string
  photos: SeedPhoto[]
}

const DEMO: SeedMiniature[] = [
  {
    id: "seed-aldric",
    slug: "sir-aldric-the-oathbound",
    name: "Sir Aldric the Oathbound",
    painterName: "Mira Thorne",
    sourceName: "MyMiniFactory / Oathbound Knights",
    sourceUrl: "https://www.myminifactory.com/",
    notes:
      "Placeholder entry. Replace these studio shots with your own: front, side, and a detail of the shield heraldry. NMM gold on the trim, grimdark weathering on the plate.",
    photos: [
      {
        filename: "aldric-front.png",
        width: 1200,
        height: 1600,
        hue: 42,
        silhouette: "knight",
        cover: true,
      },
      {
        filename: "aldric-side.png",
        width: 1600,
        height: 1200,
        hue: 38,
        silhouette: "knight",
      },
      {
        filename: "aldric-detail.png",
        width: 1400,
        height: 1400,
        hue: 48,
        silhouette: "knight",
      },
    ],
  },
  {
    id: "seed-ashscale",
    slug: "ashscale-wyrmling",
    name: "Ashscale Wyrmling",
    painterName: "Kael Voss",
    sourceName: "DragonForge Patreon",
    sourceUrl: "https://www.patreon.com/",
    notes:
      "Placeholder entry. Shoot this one on a dark slate tile with a rim light so the orange-to-soot gradient on the wings reads. Include a close-up of the eyes.",
    photos: [
      {
        filename: "ashscale-hero.png",
        width: 1920,
        height: 1080,
        hue: 18,
        silhouette: "dragon",
        cover: true,
      },
      {
        filename: "ashscale-portrait.png",
        width: 1400,
        height: 1750,
        hue: 12,
        silhouette: "dragon",
      },
    ],
  },
  {
    id: "seed-elowen",
    slug: "sister-elowen",
    name: "Sister Elowen of the Last Lantern",
    painterName: "Mira Thorne",
    sourceName: "Official lantern-keeper range",
    sourceUrl: "https://www.games-workshop.com/",
    notes:
      "Placeholder entry. Photograph the lantern OSL as the hero shot, then a three-quarter of the robes. Glaze the light source warmer than the cloth.",
    photos: [
      {
        filename: "elowen-lantern.png",
        width: 1150,
        height: 1600,
        hue: 195,
        silhouette: "mage",
        cover: true,
      },
      {
        filename: "elowen-three-quarter.png",
        width: 1600,
        height: 1100,
        hue: 210,
        silhouette: "mage",
      },
      {
        filename: "elowen-base.png",
        width: 1500,
        height: 1000,
        hue: 200,
        silhouette: "mage",
      },
    ],
  },
]

const EXTRA: Array<{
  id: string
  name: string
  painterName: string
  sourceName: string
  sourceUrl: string
  hue: number
  silhouette: SeedPhoto["silhouette"]
  notes: string
}> = [
  {
    id: "seed-ironfen",
    name: "Ironfen Ranger",
    painterName: "Mira Thorne",
    sourceName: "Hollowfen STL pack",
    sourceUrl: "https://www.myminifactory.com/",
    hue: 130,
    silhouette: "knight",
    notes: "Placeholder. Green cloak contrast against the iron greaves.",
  },
  {
    id: "seed-cinder",
    name: "Cinder Acolyte",
    painterName: "Kael Voss",
    sourceName: "Ashen Choir",
    sourceUrl: "https://www.patreon.com/",
    hue: 25,
    silhouette: "mage",
    notes: "Placeholder. Embers on the censer, soot on the hem.",
  },
  {
    id: "seed-brine",
    name: "Brinewake Corsair",
    painterName: "Liora Quill",
    sourceName: "Salt & Sail",
    sourceUrl: "https://www.thingiverse.com/",
    hue: 200,
    silhouette: "knight",
    notes: "Placeholder. Salt-white highlights on teal cloth.",
  },
  {
    id: "seed-moor",
    name: "Moorland Beast",
    painterName: "Kael Voss",
    sourceName: "Wilds of Bracken",
    sourceUrl: "https://www.myminifactory.com/",
    hue: 85,
    silhouette: "dragon",
    notes: "Placeholder. Muddy tufts, wet-blend the hide.",
  },
  {
    id: "seed-gilded",
    name: "Gilded Reliquarist",
    painterName: "Liora Quill",
    sourceName: "Cathedral of Dust",
    sourceUrl: "https://www.games-workshop.com/",
    hue: 50,
    silhouette: "mage",
    notes: "Placeholder. True metallic gold, scratched back with brown-black.",
  },
  {
    id: "seed-nightpetal",
    name: "Nightpetal Witch",
    painterName: "Mira Thorne",
    sourceName: "Hedge-walkers",
    sourceUrl: "https://www.patreon.com/",
    hue: 295,
    silhouette: "mage",
    notes: "Placeholder. Violet-black robes, pollen yellow on the staff.",
  },
  {
    id: "seed-bastion",
    name: "Bastion Warden",
    painterName: "Oren Hale",
    sourceName: "Walls of Vell",
    sourceUrl: "https://www.myminifactory.com/",
    hue: 35,
    silhouette: "knight",
    notes: "Placeholder. Stone-grey plate, a single red oath-ribbon.",
  },
  {
    id: "seed-skyshadow",
    name: "Skyshadow Drake",
    painterName: "Oren Hale",
    sourceName: "Aerie prints",
    sourceUrl: "https://www.cults3d.com/",
    hue: 230,
    silhouette: "dragon",
    notes: "Placeholder. Cool rim light along the wing membranes.",
  },
  {
    id: "seed-thresh",
    name: "Thresh-cult Thrall",
    painterName: "Liora Quill",
    sourceName: "Harvest Moon STLs",
    sourceUrl: "https://www.patreon.com/",
    hue: 70,
    silhouette: "generic",
    notes: "Placeholder. Sickle steel and dried-grain yellows.",
  },
  {
    id: "seed-lantern-hound",
    name: "Lantern Hound",
    painterName: "Kael Voss",
    sourceName: "Last Lantern companions",
    sourceUrl: "https://www.games-workshop.com/",
    hue: 40,
    silhouette: "generic",
    notes: "Placeholder. OSL from the lantern onto the muzzle.",
  },
]

DEMO.push(
  ...EXTRA.map((entry) => ({
    id: entry.id,
    slug: entry.id.replace("seed-", ""),
    name: entry.name,
    painterName: entry.painterName,
    sourceName: entry.sourceName,
    sourceUrl: entry.sourceUrl,
    notes: entry.notes,
    photos: [
      {
        filename: `${entry.id}-hero.png`,
        width: 1200,
        height: 1600,
        hue: entry.hue,
        silhouette: entry.silhouette,
        cover: true,
      },
      {
        filename: `${entry.id}-detail.png`,
        width: 1600,
        height: 1100,
        hue: entry.hue - 8,
        silhouette: entry.silhouette,
      },
    ],
  }))
)

export async function seedDemoIfEmpty(
  db: BetterSQLite3Database<typeof import("@/lib/schema")>
) {
  if (!SEED_DEMO) return
  const existing = db.select({ id: miniatures.id }).from(miniatures).get()
  if (existing) return

  const newest = Date.now()
  for (const [miniIndex, entry] of DEMO.entries()) {
    const createdAt = new Date(newest - miniIndex * 8 * 60 * 60 * 1000)
    db.insert(miniatures)
      .values({
        id: entry.id,
        slug: entry.slug,
        name: entry.name,
        painterName: entry.painterName,
        sourceName: entry.sourceName,
        sourceUrl: entry.sourceUrl,
        notes: entry.notes,
        createdAt,
        updatedAt: createdAt,
      } satisfies typeof miniatures.$inferInsert)
      .run()

    for (const [index, photo] of entry.photos.entries()) {
      const id = `${entry.id}-photo-${index + 1}`
      const svg = placeholderSvg({
        title: entry.name,
        subtitle: photo.filename.replace(".png", "").replaceAll("-", " "),
        width: photo.width,
        height: photo.height,
        hue: photo.hue,
        silhouette: photo.silhouette,
      })
      const original = await sharp(svg).png().toBuffer()
      const display = await sharp(original)
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 86 })
        .toBuffer()
      const thumb = await sharp(original)
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer()

      await mkdir(photoDir(id), { recursive: true })
      await writeFile(photoPath(id, "original"), original)
      await writeFile(photoPath(id, "display"), display)
      await writeFile(photoPath(id, "thumb"), thumb)

      db.insert(photos)
        .values({
          id,
          miniatureId: entry.id,
          originalFilename: photo.filename,
          mimeType: "image/png",
          width: photo.width,
          height: photo.height,
          sortOrder: index,
          isCover: Boolean(photo.cover),
          createdAt: new Date(createdAt.getTime() - index * 60 * 1000),
        })
        .run()
    }
  }
}
