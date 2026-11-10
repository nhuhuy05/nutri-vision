CREATE TABLE `ai_scan_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`image_uri` text NOT NULL,
	`image_remote_path` text,
	`engine` text NOT NULL,
	`model_version` text NOT NULL,
	`labels_version` text,
	`predicted_label` text,
	`predicted_food_id` text,
	`confidence_score` real,
	`candidates_json` text,
	`inference_ms` integer,
	`confirmed_food_id` text,
	`is_user_corrected` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`predicted_food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`confirmed_food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "scan_engine_check" CHECK(engine IN ('tflite', 'mlkit', 'cloud_llm')),
	CONSTRAINT "scan_conf_check" CHECK(confidence_score IS NULL OR (confidence_score BETWEEN 0 AND 1)),
	CONSTRAINT "scan_user_corrected_check" CHECK(is_user_corrected IN (0, 1)),
	CONSTRAINT "scan_status_check" CHECK(status IN ('pending', 'confirmed', 'discarded', 'failed')),
	CONSTRAINT "scan_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_scan_user_time` ON `ai_scan_history` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_scan_model` ON `ai_scan_history` (`model_version`,`status`);--> statement-breakpoint
CREATE TABLE `favorite_foods` (
	`user_id` text NOT NULL,
	`food_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	PRIMARY KEY(`user_id`, `food_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "favorite_foods_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE TABLE `food_servings` (
	`id` text PRIMARY KEY NOT NULL,
	`food_id` text NOT NULL,
	`label` text NOT NULL,
	`grams` real NOT NULL,
	`is_default` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "servings_grams_check" CHECK(grams > 0),
	CONSTRAINT "servings_is_default_check" CHECK(is_default IN (0, 1)),
	CONSTRAINT "servings_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_servings_food` ON `food_servings` (`food_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_servings_default` ON `food_servings` (`food_id`) WHERE is_default = 1 AND deleted_at IS NULL;--> statement-breakpoint
CREATE TABLE `foods` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`created_by` text,
	`name` text NOT NULL,
	`name_en` text,
	`name_normalized` text NOT NULL,
	`category_code` text DEFAULT 'main_dish' NOT NULL,
	`ai_class_label` text,
	`barcode` text,
	`calories_100g` real NOT NULL,
	`protein_100g` real DEFAULT 0 NOT NULL,
	`carbs_100g` real DEFAULT 0 NOT NULL,
	`fat_100g` real DEFAULT 0 NOT NULL,
	`fiber_100g` real DEFAULT 0 NOT NULL,
	`sugar_100g` real DEFAULT 0 NOT NULL,
	`sodium_mg_100g` real DEFAULT 0 NOT NULL,
	`seed_version` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`created_by`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "foods_source_check" CHECK(source IN ('seed', 'user', 'barcode', 'ai')),
	CONSTRAINT "foods_cal_check" CHECK(calories_100g >= 0),
	CONSTRAINT "foods_synced_check" CHECK(synced IN (0, 1)),
	CONSTRAINT "foods_source_creator_check" CHECK((source = 'seed' AND created_by IS NULL) OR (source <> 'seed' AND created_by IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `idx_foods_barcode` ON `foods` (`barcode`);--> statement-breakpoint
CREATE INDEX `idx_foods_ai_label` ON `foods` (`ai_class_label`);--> statement-breakpoint
CREATE INDEX `idx_foods_category` ON `foods` (`category_code`);--> statement-breakpoint
CREATE INDEX `idx_foods_creator` ON `foods` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_foods_unsynced` ON `foods` (`id`) WHERE synced = 0;--> statement-breakpoint
CREATE INDEX `idx_foods_normalized` ON `foods` (`name_normalized`);--> statement-breakpoint
CREATE TABLE `meal_items` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`food_id` text,
	`food_name` text NOT NULL,
	`serving_label` text,
	`serving_qty` real,
	`weight_grams` real NOT NULL,
	`calories` real NOT NULL,
	`protein` real DEFAULT 0 NOT NULL,
	`carbs` real DEFAULT 0 NOT NULL,
	`fat` real DEFAULT 0 NOT NULL,
	`fiber` real DEFAULT 0 NOT NULL,
	`sugar` real DEFAULT 0 NOT NULL,
	`sodium_mg` real DEFAULT 0 NOT NULL,
	`ai_scan_id` text,
	`ai_confidence` real,
	`is_user_edited` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`ai_scan_id`) REFERENCES `ai_scan_history`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "meal_items_weight_check" CHECK(weight_grams > 0),
	CONSTRAINT "meal_items_user_edited_check" CHECK(is_user_edited IN (0, 1)),
	CONSTRAINT "meal_items_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_items_meal` ON `meal_items` (`meal_id`) WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX `idx_items_food` ON `meal_items` (`user_id`,`food_id`);--> statement-breakpoint
CREATE INDEX `idx_items_unsync` ON `meal_items` (`id`) WHERE synced = 0;--> statement-breakpoint
CREATE TABLE `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`logged_at` integer NOT NULL,
	`meal_type` text NOT NULL,
	`note` text,
	`photo_uri` text,
	`photo_remote_path` text,
	`logged_via` text DEFAULT 'manual' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "meals_type_check" CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
	CONSTRAINT "meals_logged_via_check" CHECK(logged_via IN ('manual', 'ai_camera', 'barcode', 'template')),
	CONSTRAINT "meals_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_meals_user_date` ON `meals` (`user_id`,`date`) WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX `idx_meals_unsynced` ON `meals` (`id`) WHERE synced = 0;--> statement-breakpoint
CREATE TABLE `nutrition_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`effective_from` text NOT NULL,
	`calories` real NOT NULL,
	`protein_g` real NOT NULL,
	`carbs_g` real NOT NULL,
	`fat_g` real NOT NULL,
	`water_ml` real DEFAULT 2000 NOT NULL,
	`fiber_g` real DEFAULT 25 NOT NULL,
	`sodium_mg` real DEFAULT 2300 NOT NULL,
	`source` text DEFAULT 'auto' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "nutrition_goals_cal_check" CHECK(calories > 0),
	CONSTRAINT "nutrition_goals_source_check" CHECK(source IN ('auto', 'manual')),
	CONSTRAINT "nutrition_goals_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_goals_user_eff` ON `nutrition_goals` (`user_id`,`effective_from`);--> statement-breakpoint
CREATE TABLE `sync_meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`is_guest` integer DEFAULT 0 NOT NULL,
	`email` text,
	`name` text,
	`avatar_url` text,
	`gender` text,
	`bmr_basis` text DEFAULT 'male' NOT NULL,
	`birth_year` integer,
	`height_cm` real,
	`start_weight_kg` real,
	`target_weight_kg` real,
	`goal_type` text,
	`activity_level` text,
	`diet_preference` text DEFAULT 'none' NOT NULL,
	`allergies_json` text DEFAULT '[]' NOT NULL,
	`bmr` real,
	`tdee` real,
	`is_onboarding_completed` integer DEFAULT 0 NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`language` text DEFAULT 'vi' NOT NULL,
	`unit_weight` text DEFAULT 'kg' NOT NULL,
	`unit_height` text DEFAULT 'cm' NOT NULL,
	`unit_water` text DEFAULT 'ml' NOT NULL,
	`timezone` text DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	`week_starts_on` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	CONSTRAINT "user_profiles_is_guest_check" CHECK(is_guest IN (0, 1)),
	CONSTRAINT "user_profiles_gender_check" CHECK(gender IS NULL OR gender IN ('male', 'female', 'other')),
	CONSTRAINT "user_profiles_bmr_basis_check" CHECK(bmr_basis IN ('male', 'female', 'average')),
	CONSTRAINT "user_profiles_birth_year_check" CHECK(birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)),
	CONSTRAINT "user_profiles_height_cm_check" CHECK(height_cm IS NULL OR height_cm > 0),
	CONSTRAINT "user_profiles_start_weight_kg_check" CHECK(start_weight_kg IS NULL OR start_weight_kg > 0),
	CONSTRAINT "user_profiles_target_weight_kg_check" CHECK(target_weight_kg IS NULL OR target_weight_kg > 0),
	CONSTRAINT "user_profiles_goal_type_check" CHECK(goal_type IS NULL OR goal_type IN ('fat_loss', 'maintenance', 'muscle_gain')),
	CONSTRAINT "user_profiles_activity_level_check" CHECK(activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'very_active')),
	CONSTRAINT "user_profiles_diet_preference_check" CHECK(diet_preference IN ('none', 'vegetarian', 'vegan', 'keto', 'low_carb')),
	CONSTRAINT "user_profiles_theme_check" CHECK(theme IN ('system', 'light', 'dark')),
	CONSTRAINT "user_profiles_unit_weight_check" CHECK(unit_weight IN ('kg', 'lb')),
	CONSTRAINT "user_profiles_unit_height_check" CHECK(unit_height IN ('cm', 'ft')),
	CONSTRAINT "user_profiles_unit_water_check" CHECK(unit_water IN ('ml', 'oz')),
	CONSTRAINT "user_profiles_week_starts_on_check" CHECK(week_starts_on IN (0, 1)),
	CONSTRAINT "user_profiles_onboarding_completed_check" CHECK(is_onboarding_completed IN (0, 1)),
	CONSTRAINT "user_profiles_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_user_profiles_email` ON `user_profiles` (`email`);--> statement-breakpoint
CREATE TABLE `water_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`amount_ml` integer NOT NULL,
	`recorded_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "water_logs_amount_check" CHECK(amount_ml > 0),
	CONSTRAINT "water_logs_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE INDEX `idx_water_user_date` ON `water_logs` (`user_id`,`date`) WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE TABLE `weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`recorded_date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`body_fat_percentage` real,
	`note` text,
	`photo_uri` text,
	`photo_remote_path` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	`synced` integer DEFAULT 0 NOT NULL,
	`sync_attempts` integer DEFAULT 0 NOT NULL,
	`sync_error` text,
	FOREIGN KEY (`user_id`) REFERENCES `user_profiles`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT "weight_logs_kg_check" CHECK(weight_kg > 0),
	CONSTRAINT "weight_logs_body_fat_check" CHECK(body_fat_percentage IS NULL OR (body_fat_percentage BETWEEN 0 AND 100)),
	CONSTRAINT "weight_logs_synced_check" CHECK(synced IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_weight_user_date` ON `weight_logs` (`user_id`,`recorded_date`) WHERE deleted_at IS NULL;