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
  `total_duration_minutes` int DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '0',
  `exam_type` enum('FULL_EXAM','CATEGORY') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_by` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `exams` (`id`, `title`, `total_duration_minutes`, `is_active`, `exam_type`, `created_by`, `created_at`, `updated_at`) VALUES
(18,	'exam 1',	120,	0,	'FULL_EXAM',	7,	'2026-02-20 14:54:49',	'2026-02-20 14:54:49'),
(20,	'exam 3',	0,	0,	'CATEGORY',	7,	'2026-02-20 14:56:06',	'2026-02-20 14:56:06');

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
(43,	13,	'1',	0,	'2026-02-20 15:37:45',	'2026-02-20 15:37:45'),
(44,	13,	'2',	0,	'2026-02-20 15:37:45',	'2026-02-20 15:37:45'),
(45,	13,	'3',	0,	'2026-02-20 15:37:45',	'2026-02-20 15:37:45'),
(46,	13,	'4',	1,	'2026-02-20 15:37:45',	'2026-02-20 15:37:45'),
(47,	14,	'1',	0,	'2026-02-20 15:39:11',	'2026-02-20 15:39:11'),
(48,	14,	'3',	0,	'2026-02-20 15:39:11',	'2026-02-20 15:39:11'),
(49,	14,	'5',	0,	'2026-02-20 15:39:11',	'2026-02-20 15:39:11'),
(50,	14,	'7',	1,	'2026-02-20 15:39:11',	'2026-02-20 15:39:11'),
(51,	15,	'pi * r * r',	1,	'2026-02-20 17:02:45',	'2026-02-20 17:02:45'),
(52,	15,	'r * r',	0,	'2026-02-20 17:02:45',	'2026-02-20 17:02:45'),
(53,	15,	'2 * pi * r',	0,	'2026-02-20 17:02:45',	'2026-02-20 17:02:45'),
(54,	15,	'none',	0,	'2026-02-20 17:02:45',	'2026-02-20 17:02:45'),
(55,	16,	'Dholka',	0,	'2026-02-20 17:05:52',	'2026-02-20 17:05:52'),
(56,	16,	'Gandhinagar',	0,	'2026-02-20 17:05:52',	'2026-02-20 17:05:52'),
(57,	16,	'Ahmedabad',	1,	'2026-02-20 17:05:52',	'2026-02-20 17:05:52'),
(58,	16,	'Aravalli',	0,	'2026-02-20 17:05:52',	'2026-02-20 17:05:52'),
(59,	17,	'Dholka',	0,	'2026-02-20 17:11:33',	'2026-02-20 17:11:33'),
(60,	17,	'Gandhinagar',	0,	'2026-02-20 17:11:33',	'2026-02-20 17:11:33'),
(61,	17,	'Ahmedabad',	1,	'2026-02-20 17:11:33',	'2026-02-20 17:11:33'),
(62,	17,	'Aravalli',	0,	'2026-02-20 17:11:33',	'2026-02-20 17:11:33');

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
(13,	14,	'what is 2+2',	1,	0,	'2026-02-20 15:37:45',	'2026-02-20 15:37:45'),
(14,	14,	'what is 5+2',	1,	0,	'2026-02-20 15:39:11',	'2026-02-20 15:39:11'),
(15,	13,	'what is the formula of circle',	1,	0,	'2026-02-20 17:02:45',	'2026-02-20 17:02:45'),
(16,	15,	'what is the district name of ahmedabad',	1,	0,	'2026-02-20 17:05:52',	'2026-02-20 17:05:52'),
(17,	16,	'what is the district name of ahmedabad',	1,	0,	'2026-02-20 17:11:33',	'2026-02-20 17:11:33');

DROP TABLE IF EXISTS `subjects`;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `subject_duration_minutes` int DEFAULT NULL,
  `order_index` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `subjects` (`id`, `exam_id`, `name`, `subject_duration_minutes`, `order_index`, `created_at`, `updated_at`) VALUES
(13,	20,	'maths',	20,	1,	'2026-02-20 15:35:32',	'2026-02-20 15:35:32'),
(14,	18,	'maths',	0,	1,	'2026-02-20 15:35:48',	'2026-02-20 15:35:48'),
(15,	20,	'GK',	10,	2,	'2026-02-20 17:04:11',	'2026-02-20 17:04:11'),
(16,	20,	'temp subject',	1,	3,	'2026-02-20 17:11:24',	'2026-02-20 17:11:24');

DROP TABLE IF EXISTS `tmp_user`;
CREATE TABLE `tmp_user` (
  `email` varchar(200) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `tmp_user` (`email`, `name`) VALUES
('rushikesh.corewix@gmail.com',	'rushikesh');

DROP TABLE IF EXISTS `user_answers`;
CREATE TABLE `user_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `option_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `question_id` (`question_id`),
  KEY `option_id` (`option_id`),
  CONSTRAINT `user_answers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_answers_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `question_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `user_exams`;
CREATE TABLE `user_exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `exam_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `user_exams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


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

-- 2026-02-20 11:52:26 UTC