CREATE TABLE `honored_emissary` (
	`id` integer PRIMARY KEY NOT NULL,
	`miniature_id` text,
	FOREIGN KEY (`miniature_id`) REFERENCES `miniatures`(`id`) ON UPDATE no action ON DELETE set null
);
