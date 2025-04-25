DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `color` varchar(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`category_id`)
)