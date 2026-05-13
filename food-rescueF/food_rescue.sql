-- Food Rescue Platform — Raw SQL schema (MySQL / phpMyAdmin)
-- Use this if you want to skip `php artisan migrate` and import directly.
-- Charset: utf8mb4 / collation: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `system_analytics`;
DROP TABLE IF EXISTS `deliveries`;
DROP TABLE IF EXISTS `requests`;
DROP TABLE IF EXISTS `foods`;
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `users`;

-- USERS
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `role` ENUM('restaurant','beneficiary','volunteer','admin') NOT NULL DEFAULT 'beneficiary',
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deleted_at` TIMESTAMP NULL,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SANCTUM TOKENS
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` TEXT NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FOODS
CREATE TABLE `foods` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `quantity` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `location` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(1024) NULL,
  `status` ENUM('available','reserved','completed') NOT NULL DEFAULT 'available',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `foods_user_id_index` (`user_id`),
  KEY `foods_status_index` (`status`),
  CONSTRAINT `foods_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REQUESTS (one request per food)
CREATE TABLE `requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `food_id` BIGINT UNSIGNED NOT NULL,
  `beneficiary_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('pickup','delivery') NOT NULL,
  `notes` TEXT NULL,
  `delivery_address` VARCHAR(1024) NULL,
  `status` ENUM('pending','accepted','rejected','in_progress','completed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `requests_food_id_unique` (`food_id`),
  KEY `requests_beneficiary_id_index` (`beneficiary_id`),
  KEY `requests_status_index` (`status`),
  CONSTRAINT `requests_food_fk` FOREIGN KEY (`food_id`) REFERENCES `foods`(`id`) ON DELETE CASCADE,
  CONSTRAINT `requests_beneficiary_fk` FOREIGN KEY (`beneficiary_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DELIVERIES (one per request)
CREATE TABLE `deliveries` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT UNSIGNED NOT NULL,
  `volunteer_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('on_the_way','picked_up','delivered') NOT NULL DEFAULT 'on_the_way',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deliveries_request_id_unique` (`request_id`),
  KEY `deliveries_volunteer_id_index` (`volunteer_id`),
  KEY `deliveries_status_index` (`status`),
  CONSTRAINT `deliveries_request_fk` FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON DELETE CASCADE,
  CONSTRAINT `deliveries_volunteer_fk` FOREIGN KEY (`volunteer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYSTEM ANALYTICS (daily snapshots)
CREATE TABLE `system_analytics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `meals_saved` INT UNSIGNED NOT NULL DEFAULT 0,
  `active_deliveries` INT UNSIGNED NOT NULL DEFAULT 0,
  `success_rate` FLOAT NOT NULL DEFAULT 0,
  `waste_reduction_rate` FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_analytics_date_unique` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo seed data (admin / restaurant / beneficiary / volunteer)
-- Passwords are bcrypt hashes. Plain values:
--   admin@gmail.com / admin
--   restaurant@rescue.com / password123
--   beneficiary@rescue.com / password123
--   volunteer@rescue.com / password123
INSERT INTO `users` (`full_name`,`email`,`password`,`role`,`is_deleted`,`created_at`,`updated_at`) VALUES
('Platform Admin','admin@gmail.com','$2y$12$Q9z6m8KQO0mPg6oDXqYxbeoY2/0pY1Y/kFVpvNQHr3v6uFqJL2cFa','admin',0,NOW(),NOW()),
('Green Leaf Bistro','restaurant@rescue.com','$2y$12$nLh9G/yV7mBjJF9aCKj2P.mWcF5aHwlxH3R5l4jK7sG8u4P6yqrUe','restaurant',0,NOW(),NOW()),
('Hope Shelter','beneficiary@rescue.com','$2y$12$nLh9G/yV7mBjJF9aCKj2P.mWcF5aHwlxH3R5l4jK7sG8u4P6yqrUe','beneficiary',0,NOW(),NOW()),
('Alex Volunteer','volunteer@rescue.com','$2y$12$nLh9G/yV7mBjJF9aCKj2P.mWcF5aHwlxH3R5l4jK7sG8u4P6yqrUe','volunteer',0,NOW(),NOW());

-- NOTE: Password hashes above are placeholders. Run `php artisan db:seed`
-- after import to ensure all seeded users have correct working hashes.

SET FOREIGN_KEY_CHECKS = 1;
