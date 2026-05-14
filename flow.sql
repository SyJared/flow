-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 03:38 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `flow`
--

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `actor_id` int(11) NOT NULL,
  `workspace_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` enum('create_task','task_assign','task_doing','task_done','new_member') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `actor_id`, `workspace_id`, `task_id`, `message`, `type`, `created_at`) VALUES
(1, 1, 4, 27, 'Created a task', 'create_task', '2026-05-02 17:01:22'),
(2, 1, 4, 28, 'Created a task', 'create_task', '2026-05-03 04:20:26'),
(3, 1, 4, 27, 'is done with the task', 'task_done', '2026-05-04 03:02:48'),
(4, 1, 4, 26, 'is done with the task', 'task_done', '2026-05-04 03:06:02'),
(5, 5, 4, 28, 'is done with the task', 'task_done', '2026-05-04 03:20:19'),
(6, 5, 6, 31, 'Created a task', 'create_task', '2026-05-11 14:55:24'),
(7, 5, 6, 32, 'Created a task', 'create_task', '2026-05-11 14:55:33'),
(8, 5, 6, 33, 'Created a task', 'create_task', '2026-05-11 14:55:35'),
(9, 1, 4, 15, 'is done with the task', 'task_done', '2026-05-13 14:33:30'),
(10, 1, 4, 17, 'is done with the task', 'task_done', '2026-05-13 14:33:53');

-- --------------------------------------------------------

--
-- Table structure for table `notification_users`
--

CREATE TABLE `notification_users` (
  `id` int(11) NOT NULL,
  `notification_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notification_users`
--

INSERT INTO `notification_users` (`id`, `notification_id`, `user_id`, `is_read`, `read_at`) VALUES
(1, 1, 5, 1, NULL),
(2, 1, 7, 0, NULL),
(3, 2, 5, 1, NULL),
(4, 2, 7, 0, NULL),
(5, 3, 5, 1, NULL),
(6, 3, 7, 0, NULL),
(8, 4, 5, 1, NULL),
(9, 4, 7, 0, NULL),
(11, 5, 1, 1, NULL),
(12, 5, 7, 0, NULL),
(13, 6, 1, 1, NULL),
(14, 7, 1, 1, NULL),
(15, 8, 1, 1, NULL),
(16, 9, 5, 0, NULL),
(17, 9, 7, 0, NULL),
(19, 10, 5, 0, NULL),
(20, 10, 7, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','doing','done') DEFAULT 'todo',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `due_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `workspace_id`, `assigned_to`, `assigned_by`, `title`, `description`, `status`, `priority`, `due_date`, `created_at`, `created_by`) VALUES
(2, 4, 7, 1, 's', 's', 'todo', 'medium', '2026-04-28 00:00:00', '2026-04-27 07:56:58', 1),
(3, 4, 1, 1, 'Task ', 'complete the tasks details and information', 'done', 'high', '2026-05-01 00:00:00', '2026-04-30 04:20:24', 1),
(15, 4, 1, 1, 'DSAD', 'DSADAS', 'done', 'low', '2026-04-10 00:00:00', '2026-04-30 04:57:12', 1),
(17, 4, 1, 1, 'task update section', 'finish task updates functions', 'done', 'high', '2026-05-08 00:00:00', '2026-05-01 04:48:49', 1),
(18, 4, 5, 1, 'da', 'dd', 'todo', 'low', '2026-05-02 00:00:00', '2026-05-01 04:49:08', 1),
(19, 4, 1, 1, 's', 'a', 'done', 'medium', '2026-05-06 00:00:00', '2026-05-01 05:13:01', 1),
(20, 4, 5, 1, 'daskda', 'dsadas', 'todo', 'medium', '2026-05-15 00:00:00', '2026-05-01 05:15:16', 1),
(21, 4, 1, 1, 'sssssss', 'ssss', 'done', 'medium', '2026-05-14 00:00:00', '2026-05-01 05:15:42', 1),
(22, 4, 1, 1, 's', 's', 'done', 'medium', '2026-05-15 00:00:00', '2026-05-01 05:43:32', 1),
(23, 4, 1, 1, 'dsda', 'dsadas', 'doing', 'medium', '2026-05-06 00:00:00', '2026-05-02 16:50:22', 1),
(24, 4, 1, 1, 'notification', 'finish notification insert', 'doing', 'high', '2026-05-04 00:00:00', '2026-05-02 16:53:24', 1),
(25, 4, 7, 1, 'notificatin2', 'finish notification', 'todo', 'high', '2026-05-18 00:00:00', '2026-05-02 16:58:20', 1),
(26, 4, 1, 1, 'notif3', 'finish notif fast', 'done', 'high', '2026-05-04 00:00:00', '2026-05-02 16:59:22', 1),
(27, 4, 1, 1, 'notif4', 'finish notif', 'done', 'high', '2026-05-04 00:00:00', '2026-05-02 17:01:22', 1),
(28, 4, 5, 1, 'test notif', 'dsadsa', 'done', 'medium', '2026-05-12 00:00:00', '2026-05-03 04:20:26', 1),
(31, 6, 1, 5, 'make task page', 'complete taskpage', 'todo', 'high', '2026-05-12 00:00:00', '2026-05-11 14:55:24', 5),
(32, 6, 1, 5, 'more', 'more', 'todo', 'high', '2026-05-12 00:00:00', '2026-05-11 14:55:33', 5),
(33, 6, 1, 5, 'more', 'more', 'todo', 'high', '2026-05-12 00:00:00', '2026-05-11 14:55:35', 5);

-- --------------------------------------------------------

--
-- Table structure for table `task_updates`
--

CREATE TABLE `task_updates` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0,
  `message` text NOT NULL,
  `status` enum('todo','doing','done') DEFAULT NULL,
  `hours_spent` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_updates`
--

INSERT INTO `task_updates` (`id`, `task_id`, `user_id`, `workspace_id`, `progress`, `message`, `status`, `hours_spent`, `created_at`) VALUES
(1, 3, 1, 4, 0, '18', NULL, NULL, '2026-04-30 08:13:39'),
(2, 3, 1, 4, 0, '49', NULL, NULL, '2026-04-30 08:13:56'),
(3, 3, 1, 4, 0, '43', NULL, NULL, '2026-05-01 04:38:05'),
(4, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:24'),
(5, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:35'),
(6, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:36'),
(7, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:36'),
(8, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:36'),
(9, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:36'),
(10, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:36'),
(11, 3, 1, 4, 0, '0', NULL, NULL, '2026-05-01 04:38:37'),
(12, 17, 1, 4, 0, '12', NULL, NULL, '2026-05-01 04:49:35'),
(13, 17, 1, 4, 0, '36', NULL, NULL, '2026-05-01 04:49:54'),
(14, 17, 1, 4, 0, '62', NULL, NULL, '2026-05-01 04:50:09'),
(15, 19, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-01 05:13:07'),
(16, 19, 1, 4, 35, 'ds', NULL, NULL, '2026-05-01 05:14:45'),
(17, 21, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-01 05:15:49'),
(18, 3, 1, 4, 86, 'dadas', NULL, 1.00, '2026-05-01 05:34:02'),
(19, 22, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-01 05:43:39'),
(20, 21, 1, 4, 40, 'sda', NULL, 1.00, '2026-05-01 05:48:27'),
(21, 3, 1, 4, 48, 'dsadsa', NULL, 1.00, '2026-05-01 06:22:16'),
(22, 3, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-01 15:51:09'),
(23, 18, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-01 15:56:15'),
(24, 18, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-01 15:57:50'),
(25, 21, 1, 4, 100, 'Marked as done', 'done', 10.00, '2026-05-01 16:07:28'),
(26, 15, 1, 4, 19, 'first', NULL, 0.00, '2026-05-01 16:10:01'),
(27, 15, 1, 4, 34, 'second', NULL, 0.00, '2026-05-01 16:13:02'),
(28, 15, 1, 4, 39, 'dsadsa', NULL, 0.00, '2026-05-01 16:16:04'),
(29, 15, 1, 4, 15, 'dsa', NULL, 0.00, '2026-05-01 16:21:00'),
(30, 15, 1, 4, 15, 'dsa', NULL, 0.04, '2026-05-01 16:23:37'),
(31, 3, 1, 4, 100, 'Marked as done', 'done', 23.48, '2026-05-02 15:20:12'),
(32, 19, 1, 4, 100, 'Marked as done', 'done', 34.34, '2026-05-02 15:35:21'),
(33, 22, 1, 4, 73, 'ddsadsa', NULL, 33.91, '2026-05-02 15:38:26'),
(34, 22, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-02 15:38:30'),
(35, 27, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-04 03:02:35'),
(36, 27, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-04 03:02:37'),
(37, 27, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-04 03:02:48'),
(38, 26, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-04 03:05:54'),
(39, 26, 1, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-04 03:06:02'),
(40, 28, 5, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-04 03:20:10'),
(41, 28, 5, 4, 100, 'Marked as done', 'done', 0.00, '2026-05-04 03:20:19'),
(42, 24, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-13 13:35:07'),
(43, 24, 1, 4, 11, 'test state', NULL, 0.01, '2026-05-13 13:35:32'),
(44, 15, 1, 4, 100, 'Marked as done', 'done', 286.16, '2026-05-13 14:33:30'),
(45, 17, 1, 4, 100, 'Marked as done', 'done', 297.73, '2026-05-13 14:33:53'),
(46, 23, 1, 4, 0, 'Started Doing', 'doing', NULL, '2026-05-13 14:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'sy', 'ssssss2nd@gmail.com', '$2b$10$jlkGkbJoZlswpmTvB5MzFuIH7h/h7qjS4DkiwXpM23n/07j180t1W', '2026-04-24 05:04:20'),
(5, 'red', '1@gmail.com', '$2b$10$KAxpn7dbaW6Q/zu6F11b..K1neegQDQPFBFfl30xZNDYVMDa1rgNi', '2026-04-27 03:29:28'),
(6, 'mon', '2@gmail.com', '$2b$10$O/.JniYt0h2yZ2j5CgjTUeYcj9czcCZYDaAOa55PnH2YoKdrrlNlm', '2026-04-27 03:29:36'),
(7, 'joy', '3@gmail.com', '$2b$10$iYwaaUL82kW2q9FuQgIvJuuYX799JpJM/nfcyp42NrgI1tQTZFWjS', '2026-04-27 03:29:46');

-- --------------------------------------------------------

--
-- Table structure for table `workspaces`
--

CREATE TABLE `workspaces` (
  `id` int(11) NOT NULL,
  `workspace_name` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workspaces`
--

INSERT INTO `workspaces` (`id`, `workspace_name`, `owner_id`, `created_at`) VALUES
(4, 'flow devs', 1, '2026-04-26 07:15:37'),
(6, 'flow devs the second', 5, '2026-05-09 05:20:18'),
(7, 'third', 5, '2026-05-09 05:20:54');

-- --------------------------------------------------------

--
-- Table structure for table `workspace_members`
--

CREATE TABLE `workspace_members` (
  `id` int(11) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('owner','admin','member') DEFAULT 'member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workspace_members`
--

INSERT INTO `workspace_members` (`id`, `workspace_id`, `user_id`, `role`, `created_at`) VALUES
(2, 4, 1, 'owner', '2026-04-26 07:15:37'),
(4, 4, 7, 'member', '2026-04-27 04:00:10'),
(5, 4, 5, 'admin', '2026-04-27 06:33:56'),
(6, 6, 5, 'owner', '2026-05-09 05:20:18'),
(7, 6, 1, 'member', '2026-05-09 05:20:41'),
(8, 7, 5, 'owner', '2026-05-09 05:20:54'),
(9, 7, 1, 'admin', '2026-05-09 05:21:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actor_id` (`actor_id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `workspace_id` (`workspace_id`);

--
-- Indexes for table `notification_users`
--
ALTER TABLE `notification_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_id` (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workspace_id` (`workspace_id`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `fk_tasks_created_by` (`created_by`);

--
-- Indexes for table `task_updates`
--
ALTER TABLE `task_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `workspace_id` (`workspace_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workspaces`
--
ALTER TABLE `workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `workspace_members`
--
ALTER TABLE `workspace_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`workspace_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notification_users`
--
ALTER TABLE `notification_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `task_updates`
--
ALTER TABLE `task_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workspaces`
--
ALTER TABLE `workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workspace_members`
--
ALTER TABLE `workspace_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_users`
--
ALTER TABLE `notification_users`
  ADD CONSTRAINT `notification_users_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_users_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_updates`
--
ALTER TABLE `task_updates`
  ADD CONSTRAINT `task_updates_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_updates_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_updates_ibfk_3` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workspaces`
--
ALTER TABLE `workspaces`
  ADD CONSTRAINT `workspaces_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `workspace_members`
--
ALTER TABLE `workspace_members`
  ADD CONSTRAINT `workspace_members_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workspace_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
