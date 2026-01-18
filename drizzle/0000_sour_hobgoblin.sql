CREATE TABLE `leaderboard` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`username` text NOT NULL,
	`completed_missions_count` integer DEFAULT 0,
	`total_score` integer DEFAULT 0,
	`completion_time_ms` integer NOT NULL,
	`command_count` integer NOT NULL,
	`error_count` integer NOT NULL,
	`achievement_count` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`level` integer DEFAULT 1,
	`total_score` integer DEFAULT 0,
	`total_missions_completed` integer DEFAULT 0,
	`total_commands_executed` integer DEFAULT 0,
	`total_errors` integer DEFAULT 0,
	`unlocked_achievements` text DEFAULT '[]',
	`last_played_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`class_code` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);