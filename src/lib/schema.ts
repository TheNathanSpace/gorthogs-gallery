import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

export const miniatures = sqliteTable(
  "miniatures",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    painterName: text("painter_name").notNull(),
    sourceName: text("source_name"),
    sourceUrl: text("source_url"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("miniatures_painter_idx").on(table.painterName),
    index("miniatures_created_at_idx").on(table.createdAt),
  ]
)

export const photos = sqliteTable(
  "photos",
  {
    id: text("id").primaryKey(),
    miniatureId: text("miniature_id")
      .notNull()
      .references(() => miniatures.id, { onDelete: "cascade" }),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    sortOrder: integer("sort_order").notNull(),
    isCover: integer("is_cover", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("photos_miniature_id_idx").on(table.miniatureId),
    index("photos_created_at_idx").on(table.createdAt, table.id),
  ]
)

export const miniaturesRelations = relations(miniatures, ({ many }) => ({
  photos: many(photos),
}))

export const photosRelations = relations(photos, ({ one }) => ({
  miniature: one(miniatures, {
    fields: [photos.miniatureId],
    references: [miniatures.id],
  }),
}))

export const keepers = sqliteTable("keepers", {
  username: text("username").primaryKey(),
  passwordHash: text("password_hash"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

/** One row (`id` = 1). `miniatureId` is null when no miniature is honored. */
export const honoredEmissary = sqliteTable("honored_emissary", {
  id: integer("id").primaryKey(),
  miniatureId: text("miniature_id").references(() => miniatures.id, {
    onDelete: "set null",
  }),
})

export type Miniature = typeof miniatures.$inferSelect
export type Photo = typeof photos.$inferSelect
export type Keeper = typeof keepers.$inferSelect
