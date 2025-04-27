CREATE TABLE `expenses` (
  `expense_id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `date` date NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `note` longtext,
  `payment_mode` varchar(50) DEFAULT NULL,
  `time` time(6) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`expense_id`),
  KEY `fk_category` (`category_id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
)