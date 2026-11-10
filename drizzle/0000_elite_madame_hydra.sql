CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`category` text NOT NULL,
	`calories` real NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`serving_unit` text NOT NULL,
	`serving_weight_grams` real NOT NULL,
	`is_custom` integer DEFAULT 0 NOT NULL,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX `idx_foods_name` ON `foods` (`name`);--> statement-breakpoint
CREATE INDEX `idx_foods_category` ON `foods` (`category`);--> statement-breakpoint
CREATE TABLE `goals` (
	`user_id` text PRIMARY KEY NOT NULL,
	`calories` real NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`water_ml` real NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `meal_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`meal_type` text NOT NULL,
	`food_id` text NOT NULL,
	`food_name` text NOT NULL,
	`portion_multiplier` real NOT NULL,
	`calories` real NOT NULL,
	`protein` real NOT NULL,
	`carbs` real NOT NULL,
	`fat` real NOT NULL,
	`photo_uri` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_meal_logs_date` ON `meal_logs` (`date`);--> statement-breakpoint
CREATE INDEX `idx_meal_logs_user_date` ON `meal_logs` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_meal_logs_synced` ON `meal_logs` (`synced`);--> statement-breakpoint
CREATE TABLE `sync_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`gender` text,
	`birth_year` integer,
	`height_cm` real,
	`current_weight_kg` real,
	`target_weight_kg` real,
	`activity_level` text,
	`diet_preference` text,
	`bmr` real,
	`tdee` real,
	`avatar_url` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight_kg` real NOT NULL,
	`recorded_at` text NOT NULL,
	`note` text,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_weight_logs_user_date` ON `weight_logs` (`user_id`,`recorded_at`);