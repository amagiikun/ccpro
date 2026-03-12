CREATE TABLE `comic_panels` (
	`id` text PRIMARY KEY NOT NULL,
	`comic_id` text NOT NULL,
	`generation_id` text,
	`order` integer NOT NULL,
	`pos_x` real,
	`pos_y` real,
	`width` real,
	`height` real,
	`dialogues` text,
	FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`generation_id`) REFERENCES `generations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comics` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cover_url` text,
	`layout` text,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt` text NOT NULL,
	`negative_prompt` text,
	`provider_id` text NOT NULL,
	`model` text NOT NULL,
	`type` text NOT NULL,
	`result_url` text,
	`thumbnail_url` text,
	`parameters` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`capabilities` text NOT NULL,
	`base_url` text NOT NULL,
	`api_key` text NOT NULL,
	`models` text NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
