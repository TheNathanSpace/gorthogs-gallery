CREATE TABLE IF NOT EXISTS `miniatures` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`painter_name` text NOT NULL,
	`source_name` text,
	`source_url` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `miniatures_slug_unique` ON `miniatures` (`slug`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `miniatures_painter_idx` ON `miniatures` (`painter_name`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `miniatures_created_at_idx` ON `miniatures` (`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`miniature_id` text NOT NULL,
	`original_filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`sort_order` integer NOT NULL,
	`is_cover` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`miniature_id`) REFERENCES `miniatures`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `photos_miniature_id_idx` ON `photos` (`miniature_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `photos_created_at_idx` ON `photos` (`created_at`,`id`);
