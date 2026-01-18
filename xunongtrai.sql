-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th1 18, 2026 lúc 04:14 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `xunongtrai`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hanhtrinh`
--

CREATE TABLE `hanhtrinh` (
  `id` int(11) NOT NULL,
  `ngay` date NOT NULL,
  `tong_xu` bigint(20) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hanhtrinh`
--

INSERT INTO `hanhtrinh` (`id`, `ngay`, `tong_xu`, `created_at`) VALUES
(1, '2026-01-18', 9544907, '2026-01-18 02:52:08'),
(2, '2026-01-17', 12907000, '2026-01-18 02:55:00'),
(3, '2026-01-16', 11805000, '2026-01-18 03:01:26'),
(4, '2026-01-15', 5988000, '2026-01-18 03:01:41'),
(5, '2026-01-14', 11307000, '2026-01-18 03:02:04'),
(6, '2026-01-13', 10426000, '2026-01-18 03:02:15'),
(7, '2026-01-12', 12452000, '2026-01-18 03:02:31'),
(8, '2026-01-11', 16588000, '2026-01-18 03:02:43'),
(9, '2026-01-10', 13496000, '2026-01-18 03:02:55');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `luot_thu_hoach`
--

CREATE TABLE `luot_thu_hoach` (
  `id` int(11) NOT NULL,
  `ngay_id` int(11) NOT NULL,
  `so_xu` bigint(20) NOT NULL,
  `thoi_gian` varchar(50) NOT NULL,
  `ghi_chu` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `luot_thu_hoach`
--

INSERT INTO `luot_thu_hoach` (`id`, `ngay_id`, `so_xu`, `thoi_gian`, `ghi_chu`, `created_at`) VALUES
(2, 1, 1026000, '0h37p', NULL, '2026-01-18 02:53:05'),
(3, 1, 1027000, '8h08p', NULL, '2026-01-18 02:53:25'),
(4, 1, 7479000, '9h10p', NULL, '2026-01-18 02:53:46'),
(8, 2, 12907000, '9h57p', NULL, '2026-01-18 03:00:41'),
(9, 3, 11805000, '10h00p', NULL, '2026-01-18 03:01:26'),
(10, 4, 5988000, '10h01p', NULL, '2026-01-18 03:01:41'),
(11, 5, 11307000, '10h01p', NULL, '2026-01-18 03:02:04'),
(12, 6, 10426000, '10h02p', NULL, '2026-01-18 03:02:15'),
(13, 7, 12452000, '10h02p', NULL, '2026-01-18 03:02:31'),
(14, 8, 16588000, '10h02p', NULL, '2026-01-18 03:02:43'),
(15, 9, 13496000, '10h02p', NULL, '2026-01-18 03:02:55');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `hanhtrinh`
--
ALTER TABLE `hanhtrinh`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ngay` (`ngay`);

--
-- Chỉ mục cho bảng `luot_thu_hoach`
--
ALTER TABLE `luot_thu_hoach`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ngay_id` (`ngay_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `hanhtrinh`
--
ALTER TABLE `hanhtrinh`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `luot_thu_hoach`
--
ALTER TABLE `luot_thu_hoach`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `luot_thu_hoach`
--
ALTER TABLE `luot_thu_hoach`
  ADD CONSTRAINT `luot_thu_hoach_ibfk_1` FOREIGN KEY (`ngay_id`) REFERENCES `hanhtrinh` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
