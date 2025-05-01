CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `backup_frequency` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` bit(1) NOT NULL,
  `is_backup` bit(1) DEFAULT NULL,
  `last_backup` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `notifications` bit(1) DEFAULT NULL,
  `user_password` varchar(255) NOT NULL,
  `theme_mode` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
)