-- Adminer 5.4.2 MySQL 8.3.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

CREATE DATABASE `online_exam` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `online_exam`;

DROP TABLE IF EXISTS `exams`;
CREATE TABLE `exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `total_duration_minutes` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exams` (`id`, `title`, `total_duration_minutes`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1,	'exam 1',	120,	0,	7,	'0000-00-00 00:00:00',	'0000-00-00 00:00:00'),
(2,	'exam 3',	120,	0,	7,	'0000-00-00 00:00:00',	'0000-00-00 00:00:00'),
(3,	'exam 4',	120,	0,	7,	'0000-00-00 00:00:00',	'0000-00-00 00:00:00'),
(4,	'exam 5',	120,	0,	7,	'2026-02-17 13:26:22',	'2026-02-17 13:26:22'),
(7,	'exam 6',	100,	0,	7,	'2026-02-17 13:44:51',	'2026-02-17 13:44:51');

DROP TABLE IF EXISTS `question_options`;
CREATE TABLE `question_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `question_options` (`id`, `question_id`, `option_text`, `is_correct`, `created_at`, `updated_at`) VALUES
(3,	2,	'3',	0,	'2026-02-17 15:58:07',	'2026-02-17 15:58:07'),
(4,	2,	'4',	1,	'2026-02-17 15:58:07',	'2026-02-17 15:58:07'),
(5,	3,	'3',	0,	'2026-02-17 15:58:29',	'2026-02-17 15:58:29'),
(6,	3,	'5',	1,	'2026-02-17 15:58:29',	'2026-02-17 15:58:29');

DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int NOT NULL,
  `question_text` text NOT NULL,
  `marks` int NOT NULL,
  `negative_marks` int NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `questions` (`id`, `subject_id`, `question_text`, `marks`, `negative_marks`, `created_at`, `updated_at`) VALUES
(2,	5,	'what is 2 + 2',	4,	-1,	'2026-02-17 15:58:07',	'2026-02-17 15:58:07'),
(3,	5,	'what is 2 + 3',	4,	-1,	'2026-02-17 15:58:29',	'2026-02-17 15:58:29');

DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `subject_duration_minutes` int NOT NULL,
  `order_index` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subjects` (`id`, `exam_id`, `name`, `subject_duration_minutes`, `order_index`, `created_at`, `updated_at`) VALUES
(1,	4,	'subject 1',	30,	1,	'2026-02-17 14:32:06',	'2026-02-17 14:32:06'),
(5,	7,	'subject 1',	100,	1,	'2026-02-17 15:56:09',	'2026-02-17 15:56:09');

DROP TABLE IF EXISTS `tmp_user`;
CREATE TABLE `tmp_user` (
  `email` varchar(200) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `tmp_user` (`email`, `name`) VALUES
('rushikesh.corewix@gmail.com',	'rushikesh');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(200) NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `password_hash` varchar(200) NOT NULL,
  `role` enum('admin','student') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` (`id`, `email`, `full_name`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(6,	'student1@gmail.com',	'student 1',	'$2b$10$sOOv/TE1au.EWjyLouYg.OjtHmbXxkpvZoLTlorCCjIjmsu.pMb6C',	'student',	'2026-02-16 13:51:23',	'2026-02-16 13:51:23'),
(7,	'admin@gmail.com',	'admin',	'$2b$10$KuPOTwp1qmQWIRj1vhYYGOFgFiXsoyKxJFiCoadEZGF4uHmSnVqWu',	'admin',	'2026-02-16 14:20:16',	'2026-02-16 14:20:16');

-- 2026-02-17 10:38:21 UTC