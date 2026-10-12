CREATE TABLE IF NOT EXISTS `keepers` (
	`username` text PRIMARY KEY NOT NULL,
	`password_hash` text,
	`updated_at` integer NOT NULL
);
