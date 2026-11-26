-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 26-Nov-2026 às 15:10
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `peca_por_peca`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_11_011834_create_personal_access_tokens_table', 1),
(5, '2026_08_13_122927_add_ds_usuario_to_tb_usuario_table', 1),
(6, '2026_10_16_000001_add_st_perfil_disponivel_to_tb_usuario_table', 2),
(7, '2026_10_16_000200_add_avaliacao_trade_fields_to_tb_avaliacao_table', 2),
(8, '2026_10_16_000300_make_legacy_avaliacao_columns_nullable', 2),
(9, '2026_10_16_000400_create_tb_comentario_avaliacao_table', 2),
(10, '2026_10_20_143512_create_tb_denuncia_leitura_table', 2);

-- --------------------------------------------------------

--
-- Estrutura da tabela `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(6, 'App\\Models\\User', 1, 'api-token', '746e240e7f6b5dd6c09e97382fd9f576d32cea4644856b994b90a05af8b7b817', '[\"*\"]', NULL, NULL, '2026-09-23 19:24:34', '2026-09-23 19:24:34'),
(13, 'App\\Models\\User', 4, 'api-token', '7713bdfcfb4c6cce79041494f75431f2d990df0f236af5b11908543e2122abc1', '[\"*\"]', '2026-09-24 00:30:55', NULL, '2026-09-23 21:38:07', '2026-09-24 00:30:55'),
(29, 'App\\Models\\User', 2, 'api-token', '8fe4563e924db04fd11b6be8f675d2a1c0030d0a7b0db05c6a68d86c92a023b3', '[\"*\"]', '2026-09-25 17:06:09', NULL, '2026-09-25 15:56:09', '2026-09-25 17:06:09'),
(30, 'App\\Models\\User', 8, 'api-token', '6e8aa9b5ff82ff763fe1272d7d6f9931cb34d8c2d72334bfac5823b216cf16d7', '[\"*\"]', '2026-09-27 15:36:08', NULL, '2026-09-27 15:21:28', '2026-09-27 15:36:08'),
(31, 'App\\Models\\User', 1, 'api-token', '39b65b99421c711e8bc15ea8131f47c55a324e3443056f355faf723801c05c68', '[\"*\"]', NULL, NULL, '2026-09-27 15:27:25', '2026-09-27 15:27:25'),
(32, 'App\\Models\\User', 1, 'api-token', 'a20b77c9c44e6906ad82533f2b5442186a8e8eb0c402f9975c2d2f3cd7069502', '[\"*\"]', '2026-09-27 18:50:28', NULL, '2026-09-27 15:27:28', '2026-09-27 18:50:28'),
(33, 'App\\Models\\User', 1, 'api-token', '0e3082b07fcc98bcec5f2c8f8b2e88433e850cbaee6431959a0e20383a892edc', '[\"*\"]', NULL, NULL, '2026-09-27 15:37:01', '2026-09-27 15:37:01'),
(34, 'App\\Models\\User', 1, 'api-token', '825ce0d5cf5a8e76d7eb6474f77f90fd3eabc602f1a0ae2f08f1fd158c761ff6', '[\"*\"]', NULL, NULL, '2026-09-27 15:37:03', '2026-09-27 15:37:03'),
(35, 'App\\Models\\User', 1, 'api-token', '286c26c4b6e5eded1c135a1954c6d8ed770be29edf6aaced9165ce2db406baa4', '[\"*\"]', NULL, NULL, '2026-09-27 15:42:35', '2026-09-27 15:42:35'),
(36, 'App\\Models\\User', 2, 'api-token', '735e87a4da3e849da6a6d29f65e45b79cde81a25ed3644c1e7f3808773828e72', '[\"*\"]', NULL, NULL, '2026-09-29 11:47:15', '2026-09-29 11:47:15'),
(37, 'App\\Models\\User', 2, 'api-token', '102e137c526d7472d235e058ead4d6b1decc5aaead8c8fd5e5f668e96d6d31c2', '[\"*\"]', NULL, NULL, '2026-09-29 11:47:16', '2026-09-29 11:47:16'),
(38, 'App\\Models\\User', 2, 'api-token', 'f0335011a9f2eb5812c0a376f4e494c4c35ead0e053f92a26d69f15c295746dc', '[\"*\"]', '2026-09-29 23:06:12', NULL, '2026-09-29 11:47:18', '2026-09-29 23:06:12'),
(39, 'App\\Models\\User', 1, 'api-token', '5bcd8bc0c0585f3db18328009b3084031aeee4ad4ea1025494d01d2bb471694b', '[\"*\"]', NULL, NULL, '2026-09-29 12:54:59', '2026-09-29 12:54:59'),
(40, 'App\\Models\\User', 1, 'api-token', 'c84bac870c372c223d5bdb91e490942385396387ff2c52e9283ac62b89e291db', '[\"*\"]', NULL, NULL, '2026-09-29 12:55:01', '2026-09-29 12:55:01'),
(42, 'App\\Models\\User', 2, 'api-token', '4bbe4842b7620c1896dfe547b02f87f12a9065079646d92006b43de6784bb734', '[\"*\"]', NULL, NULL, '2026-09-29 23:19:57', '2026-09-29 23:19:57'),
(44, 'App\\Models\\User', 5, 'api-token', '6f07293c30cefc091cafa871676f89ed3cbba167501ccce22aadaf061cb662ce', '[\"*\"]', '2026-09-30 11:39:51', NULL, '2026-09-29 23:57:09', '2026-09-30 11:39:51'),
(45, 'App\\Models\\User', 2, 'api-token', '48a65e605af2fd6ee99a5595dbe29f4defecef0b52fa3aab9fdc203ed6c07f73', '[\"*\"]', '2026-10-01 12:30:27', NULL, '2026-09-30 11:13:28', '2026-10-01 12:30:27'),
(46, 'App\\Models\\User', 9, 'api-token', '3a53827139dd50926ed60458c07fde169227396a6840543925d8a3a2b6428d40', '[\"*\"]', NULL, NULL, '2026-09-30 13:22:43', '2026-09-30 13:22:43'),
(47, 'App\\Models\\User', 1, 'api-token', '18c7a60f688ef2a74f4ca5f36e39544657814b75023a49284abfe15f456088dd', '[\"*\"]', NULL, NULL, '2026-09-30 13:23:40', '2026-09-30 13:23:40'),
(48, 'App\\Models\\User', 1, 'api-token', '6cb5af1c28bc75e7be19735e942796d468582fb77c797c618a5d0ffc29d1a891', '[\"*\"]', NULL, NULL, '2026-09-30 21:00:10', '2026-09-30 21:00:10'),
(49, 'App\\Models\\User', 1, 'api-token', 'ffc36498a48f69ee464cf550b252e4c2d5198aca8c9e4011a45aa53924179ef4', '[\"*\"]', NULL, NULL, '2026-09-30 21:00:14', '2026-09-30 21:00:14'),
(50, 'App\\Models\\User', 1, 'api-token', '00a475c5f74a8081765b0be7d8553a0940253823b3e7529c4d746156e064e917', '[\"*\"]', NULL, NULL, '2026-09-30 21:00:16', '2026-09-30 21:00:16'),
(51, 'App\\Models\\User', 1, 'api-token', '48fb9d9ec033b4ee4149bd1c40959d2deafcfb719be3202126e1d903b09052d0', '[\"*\"]', NULL, NULL, '2026-09-30 21:00:17', '2026-09-30 21:00:17'),
(52, 'App\\Models\\User', 1, 'api-token', 'ff26efe19a6cda844ac8993c5c7efa6f54a371db7c4f6e8015cfa2870203dcce', '[\"*\"]', NULL, NULL, '2026-09-30 23:02:03', '2026-09-30 23:02:03'),
(53, 'App\\Models\\User', 2, 'api-token', '683c2ff1db2797db1cacacc70a9a4b32642757ef311ecc533e9de30f70cf868f', '[\"*\"]', '2026-10-02 20:23:35', NULL, '2026-10-01 12:54:01', '2026-10-02 20:23:35'),
(54, 'App\\Models\\User', 1, 'api-token', '23a90e44814ea07a40af73a1f30b4e4f6b16ecce79de5e8709ec5ab3ecedc224', '[\"*\"]', NULL, NULL, '2026-10-02 20:20:13', '2026-10-02 20:20:13'),
(56, 'App\\Models\\User', 10, 'api-token', 'c3846df7f6d0863b3aede55379ee0d3cd73bd7d2fbbe656ab358de721db5fd5e', '[\"*\"]', '2026-10-12 14:02:29', NULL, '2026-10-12 13:03:11', '2026-10-12 14:02:29'),
(57, 'App\\Models\\User', 10, 'api-token', '3388f1477e5ace6133402ff657a907b0824089ab0b5cacbf9f466f08495fe65a', '[\"*\"]', NULL, NULL, '2026-10-12 14:13:13', '2026-10-12 14:13:13'),
(58, 'App\\Models\\User', 10, 'api-token', '95bce0ba51a5b91d90e218ced677765f31cee7327e22363637c4b3c56e8e6e2d', '[\"*\"]', NULL, NULL, '2026-10-12 14:13:15', '2026-10-12 14:13:15'),
(63, 'App\\Models\\User', 2, 'api-token', 'ebf60fd51d8a7bb1468e39dfd04eea5f878640ceba38a2cfd83162f0fa9309c4', '[\"*\"]', '2026-10-13 20:03:04', NULL, '2026-10-13 20:00:04', '2026-10-13 20:03:04'),
(64, 'App\\Models\\User', 2, 'api-token', '8a4989b87a6113300b309f5f5f641a01ad00961eb7bd369531ceff61275a9870', '[\"*\"]', NULL, NULL, '2026-10-13 20:03:45', '2026-10-13 20:03:45'),
(65, 'App\\Models\\User', 2, 'api-token', 'facebbcb56434235d095a3b253ad76869c5d3260d375f3b4afd29819d9d68365', '[\"*\"]', '2026-10-13 20:11:51', NULL, '2026-10-13 20:03:46', '2026-10-13 20:11:51'),
(67, 'App\\Models\\User', 2, 'api-token', 'ca5b7adc267e9c26a86f10150115567f3579794e2d399cb3a199f819d981f58c', '[\"*\"]', '2026-10-13 20:14:33', NULL, '2026-10-13 20:14:22', '2026-10-13 20:14:33'),
(69, 'App\\Models\\User', 2, 'api-token', 'edf4f203258795795d0166b954ef33c66652bcc2a639b922a5deed141bd17052', '[\"*\"]', '2026-10-13 20:38:22', NULL, '2026-10-13 20:16:09', '2026-10-13 20:38:22'),
(70, 'App\\Models\\User', 2, 'api-token', 'a6beefa3f0caf3a5a2127baf1006cc9ab6c9b7c6b2c90c9d921cfa5f83e51799', '[\"*\"]', '2026-10-13 20:42:27', NULL, '2026-10-13 20:40:17', '2026-10-13 20:42:27'),
(78, 'App\\Models\\User', 10, 'api-token', '1c89e363615142080b23e5502da400e3fec475a2e1e7ee6b9e473418e5ba9ee1', '[\"*\"]', '2026-10-14 00:08:55', NULL, '2026-10-13 23:59:09', '2026-10-14 00:08:55'),
(80, 'App\\Models\\User', 1, 'api-token', '84e9b3f46044590bbf349f04107d2ab68f42ceeb1214138281e8147c21c00f5c', '[\"*\"]', '2026-11-02 18:23:24', NULL, '2026-11-02 18:22:58', '2026-11-02 18:23:24'),
(81, 'App\\Models\\User', 5, 'api-token', 'b5140edbf99ec0adf0e5750d3f6f149b3b7dc805869584242733dfe0c9ed1442', '[\"*\"]', NULL, NULL, '2026-11-21 00:51:51', '2026-11-21 00:51:51'),
(82, 'App\\Models\\User', 5, 'api-token', 'f79cd765ba151825549616a2ed3aa1e3aa21e7efdfa458aaeacae74edbd4628e', '[\"*\"]', NULL, NULL, '2026-11-21 00:51:57', '2026-11-21 00:51:57'),
(85, 'App\\Models\\User', 2, 'api-token', '4fdd8c0de61ab93274317fba6577923c0679d765a6d9b8bdb8ee13a96efaf727', '[\"*\"]', NULL, NULL, '2026-11-21 16:49:41', '2026-11-21 16:49:41'),
(86, 'App\\Models\\User', 2, 'api-token', '6cf8b375e3f37548e8be704dc9c9e39d54d44eaa46cd70d5c9f496f4a231928d', '[\"*\"]', NULL, NULL, '2026-11-21 16:49:43', '2026-11-21 16:49:43'),
(87, 'App\\Models\\User', 2, 'api-token', 'b5e510bad072a5541fa46f98311f2f9b980a460609591a18e1b0414c483c295f', '[\"*\"]', NULL, NULL, '2026-11-21 16:49:44', '2026-11-21 16:49:44'),
(96, 'App\\Models\\User', 3, 'api-token', '85b1fdeb00853581a59c06b66372d8fc14a473ddfa42c29254dca35628c6ca71', '[\"*\"]', NULL, NULL, '2026-11-22 15:11:44', '2026-11-22 15:11:44'),
(100, 'App\\Models\\User', 6, 'api-token', '9dc4ea453c9ba3f599286ff5b87ed32b61ba4e0ea980b9082a8ca0ea303d54ef', '[\"*\"]', NULL, NULL, '2026-11-23 11:51:20', '2026-11-23 11:51:20'),
(104, 'App\\Models\\User', 1, 'api-token', 'd3ad2403687fde5e26109c08b6800f691736980003cedc3796f5b571bd0f20ec', '[\"*\"]', NULL, NULL, '2026-11-23 14:05:22', '2026-11-23 14:05:22'),
(105, 'App\\Models\\User', 1, 'api-token', '867bb029343cb2675686ba81e49ca5c788c8497054b5efb4b8e3678b5d5174e7', '[\"*\"]', NULL, NULL, '2026-11-23 14:05:29', '2026-11-23 14:05:29'),
(110, 'App\\Models\\User', 1, 'api-token', '3e5f161408537e2c40ec5429b940458e43d492176da37e940525e90c821c4051', '[\"*\"]', '2026-11-23 18:02:36', NULL, '2026-11-23 16:36:44', '2026-11-23 18:02:36'),
(117, 'App\\Models\\User', 2, 'api-token', '1db2d1a966af78a7793a14919289d87ca4606555892930dc4ad2c490fb215c3e', '[\"*\"]', '2026-11-24 18:22:24', NULL, '2026-11-24 11:03:28', '2026-11-24 18:22:24'),
(118, 'App\\Models\\User', 3, 'api-token', '837af579a023315a5697aac2629ecbbbf5332edcffe43affbcec25257a43fbe9', '[\"*\"]', NULL, NULL, '2026-11-24 11:03:58', '2026-11-24 11:03:58'),
(122, 'App\\Models\\User', 3, 'api-token', 'a1d07f35423416a437bf9bf1c36f24d7d0ed1c38cac7d483a86cdfde79231f4a', '[\"*\"]', '2026-11-24 17:11:12', NULL, '2026-11-24 17:02:22', '2026-11-24 17:11:12'),
(123, 'App\\Models\\User', 3, 'api-token', '26cc359640b89b200ccd7e1a0112b673e0e6458eab2c681003fa999637808648', '[\"*\"]', '2026-11-24 18:19:16', NULL, '2026-11-24 17:16:18', '2026-11-24 18:19:16'),
(124, 'App\\Models\\User', 1, 'api-token', '09ac1f55c370582c0b499db649a362f7a543e8016896e62be8205c2b175def95', '[\"*\"]', '2026-11-24 17:20:47', NULL, '2026-11-24 17:20:21', '2026-11-24 17:20:47'),
(125, 'App\\Models\\User', 3, 'api-token', '4190bf4e7b02981e96c033fec27e8518b42f0c264f79eb553560f4a8b6352c50', '[\"*\"]', '2026-11-26 14:05:42', NULL, '2026-11-24 18:19:57', '2026-11-26 14:05:42'),
(126, 'App\\Models\\User', 1, 'api-token', '3d4ff54009a19aa7e24f5bdba560bef355a3a80ec52f760a322969dc4a1e7530', '[\"*\"]', '2026-11-26 14:10:31', NULL, '2026-11-26 14:09:48', '2026-11-26 14:10:31');

-- --------------------------------------------------------

--
-- Estrutura da tabela `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_avaliacao`
--

CREATE TABLE `tb_avaliacao` (
  `id_avaliacao` int(11) NOT NULL,
  `id_proposta` int(11) DEFAULT NULL,
  `id_avaliador` int(11) DEFAULT NULL,
  `id_avaliado` int(11) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_produto` int(11) DEFAULT NULL,
  `nr_nota` int(11) NOT NULL,
  `ds_comentario` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tb_avaliacao`
--

INSERT INTO `tb_avaliacao` (`id_avaliacao`, `id_proposta`, `id_avaliador`, `id_avaliado`, `id_usuario`, `id_produto`, `nr_nota`, `ds_comentario`, `created_at`, `updated_at`) VALUES
(4, NULL, NULL, 4, NULL, NULL, 5, 'Excelente experiência! Muito educada e atenciosa. Recomendo!', '2026-11-23 12:49:44', '2026-11-23 12:49:44'),
(5, NULL, NULL, 4, NULL, NULL, 5, 'Foi ótimo fazer negócio! Tudo ocorreu perfeitamente.', '2026-11-23 12:49:44', '2026-11-23 12:49:44'),
(6, NULL, NULL, 4, NULL, NULL, 5, 'Usuária muito confiável, gentil e responsável. Nota máxima!', '2026-11-23 12:49:44', '2026-11-23 12:49:44'),
(7, NULL, NULL, 4, NULL, NULL, 5, 'Adorei a experiência! Comunicação excelente e negociação tranquila.', '2026-11-23 12:49:44', '2026-11-23 12:49:44'),
(8, NULL, NULL, 4, NULL, NULL, 5, 'Tudo perfeito! Recomendo muito fazer trocas com essa usuária.', '2026-11-23 12:49:44', '2026-11-23 12:49:44');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_categoria`
--

CREATE TABLE `tb_categoria` (
  `id_categoria` int(11) NOT NULL,
  `nm_categoria` varchar(100) NOT NULL,
  `ds_categoria` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tb_categoria`
--

INSERT INTO `tb_categoria` (`id_categoria`, `nm_categoria`, `ds_categoria`, `created_at`, `updated_at`) VALUES
(1, 'Hardware', 'Componentes internos e periféricos de computadores, como placas-mãe, processadores, placas de vídeo, coolers, gabinetes e outros equipamentos de hardware.', '2026-09-23 14:20:06', NULL),
(2, 'Computador e notebook', 'Computadores desktop, notebooks e seus acessórios, incluindo peças completas, equipamentos usados, novos ou para manutenção.', '2026-09-23 14:20:06', NULL),
(3, 'Celular e tablet', 'Smartphones, tablets e acessórios relacionados, como capas, telas, baterias, botões, conectores e demais componentes.', '2026-09-23 14:20:06', NULL),
(4, 'Memórias e pen drives', 'Dispositivos de armazenamento e memória, como memória RAM, SSDs, HDs, cartões de memória, pen drives e outros meios de armazenamento de dados.', '2026-09-23 14:20:06', NULL),
(5, 'Fontes e carregadores', 'Fontes de alimentação, carregadores, cabos de energia, adaptadores de tomada e acessórios utilizados para fornecer energia a equipamentos eletrônicos.', '2026-09-23 14:20:06', NULL),
(6, 'Impressoras e adaptadores', 'Impressoras, scanners, cartuchos, toners, adaptadores, conversores e acessórios utilizados para impressão e conexão de dispositivos.', '2026-09-23 14:20:06', NULL),
(7, 'Consoles e videogames', 'Consoles, controles, jogos, cabos, peças de reposição e acessórios para videogames e entretenimento eletrônico.', '2026-09-23 14:20:06', NULL),
(8, 'Câmeras', 'Câmeras fotográficas, webcams, filmadoras, lentes, tripés, baterias e demais acessórios relacionados à captura de imagens e vídeos.', '2026-09-23 14:20:06', NULL),
(9, 'Outros', 'Outros tipos de componentes eletrônicos.', '2026-09-23 14:20:06', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_comentario_avaliacao`
--

CREATE TABLE `tb_comentario_avaliacao` (
  `id_comentario` int(10) UNSIGNED NOT NULL,
  `id_avaliacao` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ds_comentario` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_denuncia`
--

CREATE TABLE `tb_denuncia` (
  `id_denuncia` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_usuario_denunciado` int(11) DEFAULT NULL,
  `id_produto` int(11) DEFAULT NULL,
  `ds_motivo` varchar(255) NOT NULL,
  `ds_denuncia` text DEFAULT NULL,
  `st_denuncia` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_denuncia_leitura`
--

CREATE TABLE `tb_denuncia_leitura` (
  `id_administrador` int(11) NOT NULL,
  `id_denuncia` int(11) NOT NULL,
  `lida_em` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_favorito`
--

CREATE TABLE `tb_favorito` (
  `id_favorito` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_historico_interacao`
--

CREATE TABLE `tb_historico_interacao` (
  `id_historico` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `tp_interacao` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_imagem_denuncia`
--

CREATE TABLE `tb_imagem_denuncia` (
  `id_imagem_denuncia` int(11) NOT NULL,
  `id_denuncia` int(11) NOT NULL,
  `ds_imagem` varchar(255) NOT NULL,
  `nr_ordem` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_imagem_produto`
--

CREATE TABLE `tb_imagem_produto` (
  `id_imagem` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `ds_imagem` varchar(255) NOT NULL,
  `nr_ordem` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tb_imagem_produto`
--

INSERT INTO `tb_imagem_produto` (`id_imagem`, `id_produto`, `ds_imagem`, `nr_ordem`, `created_at`, `updated_at`) VALUES
(1, 1, 'products/HbeeQjRhrlVDSZrakk0ogiZnt7XG9GFp3fbZvQBj.jpg', 1, '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(2, 1, 'products/gKKspiVWB7KN46P5dkGUiSrp9O6b1BuCfb1IO7Fs.jpg', 2, '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(3, 1, 'products/LkdvVgGtGL5vwn66r41MzVpS9EB54K7jBOhT4n3T.jpg', 3, '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(4, 1, 'products/W1kWJ8YnMTCwN8yrIw9XooEU0qnqpnG6LSpWjDkM.jpg', 4, '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(5, 1, 'products/9MeLMT208aSaJaHy2heQyD9qPOGfrAvHKf3E9kLG.jpg', 5, '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(6, 2, 'products/IOzuqL40ixTqhQaciQHxjfwxOFpgL9jtxyBImruQ.jpg', 1, '2026-11-21 01:25:46', '2026-11-21 01:25:46'),
(7, 3, 'products/l2izTBQWYdx9pXpIU1ExGEhbgcHuVYkjX6EwyloR.jpg', 1, '2026-11-21 01:26:47', '2026-11-21 01:26:47'),
(9, 5, 'products/pwyWr3b0R0eEF9WeUGtxWjyu4EHnvWT5pZw0Ru3W.jpg', 1, '2026-11-21 17:00:39', '2026-11-21 17:00:39'),
(10, 6, 'products/hLlky8lqGSbTb5TFGervRy7KyV7vJwdZr0PcGiT6.jpg', 1, '2026-11-21 17:02:27', '2026-11-21 17:02:27'),
(11, 7, 'products/URP8Ef2UI0EFzxdHjp5rQFxPnrxnBok6qmda1Cac.jpg', 1, '2026-11-21 17:03:21', '2026-11-21 17:03:21'),
(12, 8, 'products/kUW2VnylKHAXIQmn1bud0J9kgphpOaVR7Z43sevn.jpg', 1, '2026-11-21 17:04:16', '2026-11-21 17:04:16'),
(13, 9, 'products/r3Vd57TOydAaromrT4y3f1MMwt9Z10NXdaxlnL0h.jpg', 1, '2026-11-21 17:06:32', '2026-11-21 17:06:32'),
(14, 10, 'products/zzwZsl4SU4ZapgNBBu5HuvF3j7c9mVU1AbBbOmzj.jpg', 1, '2026-11-21 17:07:55', '2026-11-21 17:07:55'),
(15, 11, 'products/xlLan1FmjBhjAqe7PzfWppcnYZPGc47P56i3PkvI.jpg', 1, '2026-11-21 17:10:26', '2026-11-21 17:10:26'),
(16, 12, 'products/BDZOWOsdKt3oOGy1wzJxRM0LSPTsCs2nfN3ZqSjA.jpg', 1, '2026-11-21 17:25:51', '2026-11-21 17:25:51'),
(17, 13, 'products/qqWBpZEeXEEy8JJyX4XzMOLCiC3pVsqmLE930UtD.jpg', 1, '2026-11-21 17:28:06', '2026-11-21 17:28:06'),
(18, 14, 'products/X7H1YZ5PKngcA5ORhv0NxXgkJGgmsVRmtiQs70J8.jpg', 1, '2026-11-21 17:30:52', '2026-11-21 17:30:52'),
(19, 14, 'products/S4UAKuMa3UnhMzqjK6ilXg6UgGDV5xy7A918I5Pp.jpg', 2, '2026-11-21 17:30:52', '2026-11-21 17:30:52'),
(20, 15, 'products/H1gUBya1gFWHXl1aacXMmUrFQkcf01RKcxJAzUih.jpg', 1, '2026-11-21 17:35:58', '2026-11-21 17:35:58'),
(21, 16, 'products/Wmaq9zNalUAxIM7Cp6otQ4wbAomFXrxJDDhYcS4N.jpg', 1, '2026-11-21 17:38:10', '2026-11-21 17:38:10'),
(22, 16, 'products/bSSxCqNVCPMp106ZyCUhJkQBgST2SSNctitDSVd0.jpg', 2, '2026-11-21 17:38:10', '2026-11-21 17:38:10'),
(23, 16, 'products/7qzIzXvfbjMITnyFsKXJ6dL3unx93YZrAaQiDSbn.jpg', 3, '2026-11-21 17:38:10', '2026-11-21 17:38:10'),
(24, 16, 'products/QLOuXCw3G4dnYpVftWQYZecldXOH1fAhwSn3CJfV.jpg', 4, '2026-11-21 17:38:10', '2026-11-21 17:38:10'),
(25, 17, 'products/fG7f2kIVVTSGHaj1mnZuxPlWSJDMeIMrexreqQSV.jpg', 1, '2026-11-21 17:43:39', '2026-11-21 17:43:39'),
(26, 17, 'products/iA5vOFnO7QPLVTuu6EOTOLP8FWyEbRLbZsmgKM2q.jpg', 2, '2026-11-21 17:43:39', '2026-11-21 17:43:39'),
(27, 17, 'products/QEcUULy3DgeSjOAnbbO1KlECBas72zdW2rQDGHoj.jpg', 3, '2026-11-21 17:43:39', '2026-11-21 17:43:39'),
(28, 17, 'products/YjLZfIEP4NgYUDjC21Xc5ebtl8NdrEV8gddGF1Hq.jpg', 4, '2026-11-21 17:43:39', '2026-11-21 17:43:39'),
(29, 18, 'products/ogDrj7ZQn3sDZTuMxEq52wnITfF5L8MIP1mv4h9a.jpg', 1, '2026-11-21 17:59:09', '2026-11-21 17:59:09'),
(30, 18, 'products/FBH9y0V7DTZxU3O47vbt8NnTPz4Knk8j358J3PIx.jpg', 2, '2026-11-21 17:59:09', '2026-11-21 17:59:09'),
(31, 18, 'products/DpUxC6OzutyahKpg4fk9aQivIJJPpJ3qngcddy5k.jpg', 3, '2026-11-21 17:59:09', '2026-11-21 17:59:09'),
(32, 19, 'products/60vXJdOfNg0hZzxKkbHaAjjOa9oxIvCkcZ6F9171.jpg', 1, '2026-11-21 18:00:16', '2026-11-21 18:00:16'),
(33, 20, 'products/qMq7gfE5p7sIE97Zfjnmr70bnKSkyX3oFOGyPJv1.jpg', 1, '2026-11-21 18:03:21', '2026-11-21 18:03:21'),
(34, 20, 'products/GERvNkNyQMb82HIqkdZyHcC92C1rT9OQIlPVbK97.jpg', 2, '2026-11-21 18:03:21', '2026-11-21 18:03:21'),
(35, 21, 'products/mOWkfNJEADj9LFQSjKwQj6kLohy8AGyoikS1nvQG.jpg', 1, '2026-11-21 18:04:24', '2026-11-21 18:04:24'),
(36, 22, 'products/fAIKm0bufGw4GUODNVFuLXTtz95hYBD76sOr1VJY.jpg', 1, '2026-11-22 14:12:36', '2026-11-22 14:12:36'),
(37, 23, 'products/NoGCtSfp0RYw8s6WT8FkwCgGbSYEz4xBhNDLnnB8.jpg', 1, '2026-11-22 14:12:45', '2026-11-22 14:12:45'),
(38, 24, 'products/Ek0xOcO5HgwIyed43EftZBTiZ2Kk7DJOgFBT0RlE.jpg', 1, '2026-11-22 22:15:39', '2026-11-22 22:15:39'),
(39, 25, 'products/Mly2rVEM6Lrx5CCLqAPyLyxrfptZXs4RdclPJEWL.jpg', 1, '2026-11-22 22:22:13', '2026-11-22 22:22:13'),
(40, 26, 'products/nRKDJDMp9DelCtRVLmfVIV7xgpp80tO04tyRh8aA.jpg', 1, '2026-11-23 11:59:03', '2026-11-23 11:59:03'),
(41, 27, 'products/6Y95xh95BHRx1XqTCNMZl8lsUwJVni8M1HHroBFN.jpg', 1, '2026-11-23 12:02:17', '2026-11-23 12:02:17'),
(42, 4, 'products/eWMAN9tXrSNJxGU3F91CWh2yOU5EW5iacYlTRy7D.jpg', 1, '2026-11-23 17:16:19', '2026-11-23 17:16:19');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_item_proposta`
--

CREATE TABLE `tb_item_proposta` (
  `id_item_proposta` int(11) NOT NULL,
  `id_proposta` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `tp_item` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_mensagem`
--

CREATE TABLE `tb_mensagem` (
  `id_mensagem` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_proposta` int(11) NOT NULL,
  `ds_mensagem` text NOT NULL DEFAULT '',
  `ds_imagem` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_notificacao`
--

CREATE TABLE `tb_notificacao` (
  `id_notificacao` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `ds_notificacao` varchar(255) NOT NULL,
  `st_visualizada` char(1) NOT NULL,
  `st_push` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_produto`
--

CREATE TABLE `tb_produto` (
  `id_produto` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nm_produto` varchar(100) NOT NULL,
  `ds_produto` varchar(255) DEFAULT NULL,
  `st_condicao` char(1) NOT NULL,
  `st_status` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tb_produto`
--

INSERT INTO `tb_produto` (`id_produto`, `id_usuario`, `id_categoria`, `nm_produto`, `ds_produto`, `st_condicao`, `st_status`, `created_at`, `updated_at`) VALUES
(1, 3, 9, 'Drone Explorador', 'Drone bonito e moderno, perfeito para quem curte registrar lugares e momentos de um ângulo diferente. Nunca usei ele, disponível para troca por algo maneiro que me interesse.', 'N', 'A', '2026-11-21 01:24:43', '2026-11-21 01:24:43'),
(2, 3, 7, 'Nintendo Wii Novo', 'Nintendo Wii em estado de novo, super conservado e funcionando perfeitamente. Ótimo para jogar com amigos e família e curtir vários clássicos. Disponível para troca por algo interessante!', 'N', 'A', '2026-11-21 01:25:46', '2026-11-21 01:25:46'),
(3, 3, 2, 'Notebook', 'Notebook seminovo, ideal para estudar, navegar na internet e jogar Minecraft com bom desempenho. Uma boa opção para quem busca um computador para o dia a dia e momentos de diversão.', 'S', 'A', '2026-11-21 01:26:47', '2026-11-21 01:26:47'),
(4, 3, 3, 'ipad', 'Eu quero trocar meu ipad por um celular da mesma marca.', 'U', 'A', '2026-11-21 01:28:20', '2026-11-26 14:03:51'),
(5, 2, 3, 'Celular personalizado Coraline', 'Quero trocar meu celular personalizado por outro modelo. Gosto muito dele, mas está na hora de mudar!', 'U', 'A', '2026-11-21 17:00:39', '2026-11-23 17:05:22'),
(6, 2, 3, 'Celular iPhone 8 roxo do MIN', 'iPhone para quem busca praticidade no dia a dia, seja para acessar redes sociais, tirar fotos ou conversar. Disponível para troca! Entre em contato para saber mais sobre o aparelho e combinar uma proposta.', 'U', 'T', '2026-11-21 17:02:27', '2026-11-24 11:43:49'),
(7, 2, 8, 'Câmera Fotográfica Y2K', 'Câmera linda e super bem cuidada, perfeita para quem gosta de registrar momentos e criar fotos incríveis. Está funcionando direitinho e pronta para ganhar um novo dono.', 'U', 'A', '2026-11-21 17:03:21', '2026-11-21 17:03:21'),
(8, 2, 3, 'Celular Quebrado', 'celular quebrado', 'Q', 'A', '2026-11-21 17:04:15', '2026-11-21 17:04:15'),
(9, 4, 9, 'Kit Rosa Delicado', 'Kit com várias coisinhas lindas em tons de rosa-claro, delicadas e super fofas. Perfeito para quem ama itens charmosos. Troco por algo que me interesse!!', 'U', 'A', '2026-11-21 17:06:32', '2026-11-21 17:06:32'),
(10, 4, 6, 'Impressora para Adesivos Fofos', 'Impressora em ótimo estado, perfeita para imprimir adesivos fofos, personalizados e coloridos. Ideal para quem ama papelaria criativa e projetos personalizados. Troco por algo legal!', 'S', 'A', '2026-11-21 17:07:55', '2026-11-21 17:07:55'),
(11, 4, 1, 'Placa de Vídeo', 'Placa de vídeo disponível para troca por outras peças eletrônicas. Entre em contato para conferir o modelo, as especificações e a compatibilidade com seu computador. Aceito propostas!', 'U', 'A', '2026-11-21 17:10:26', '2026-11-21 17:10:26'),
(12, 5, 1, 'Placa Mãe', 'placa mãe em ótimo estado.', 'S', 'A', '2026-11-21 17:25:51', '2026-11-21 17:25:51'),
(13, 5, 1, 'Placa Mãe Última Geração', 'sem defeitos.', 'U', 'A', '2026-11-21 17:28:06', '2026-11-21 17:28:06'),
(14, 5, 2, 'notebook prata', 'perfeito para trabalho e tals', 'U', 'A', '2026-11-21 17:30:52', '2026-11-21 17:30:52'),
(15, 4, 4, 'Pendrive ou MP3 Pink', 'Pendrive ou MP3 na cor pink, lindo e delicado, perfeito para quem ama acessórios fofos e estilosos. Troco por algo legal e que seja do meu interesse.', 'U', 'A', '2026-11-21 17:35:58', '2026-11-21 17:35:58'),
(16, 4, 5, 'Carregador Personalizado', 'Carregador personalizado com detalhes de coração, super delicado e diferente. Perfeito para quem ama acessórios fofos e cheios de personalidade.', 'U', 'A', '2026-11-21 17:38:10', '2026-11-21 17:38:10'),
(17, 3, 3, 'Iphone 8 256gb', 'em ótimas condições', 'U', 'A', '2026-11-21 17:43:39', '2026-11-21 17:43:39'),
(18, 2, 6, 'Impressora Moderna HP', 'Impressora da cor branca da marca hp', 'U', 'A', '2026-11-21 17:59:09', '2026-11-21 17:59:09'),
(19, 2, 7, 'Xbox', 'quero trocar por outro console', 'U', 'A', '2026-11-21 18:00:16', '2026-11-23 15:07:46'),
(20, 5, 7, 'ps4 com 2 controles', 'ps4, tem um risquinho na parte debaixo, pequeno defeito estético', 'U', 'T', '2026-11-21 18:03:21', '2026-11-22 22:24:24'),
(21, 5, 6, 'ps5', 'vem com o jogo do homem aranha', 'U', 'T', '2026-11-21 18:04:24', '2026-11-21 18:10:19'),
(22, 5, 2, 'Monitor msi pro mp273aw', 'Monitor MSI de 27 polegadas, com tela Full HD e ótima qualidade de imagem. Possui painel IPS e taxa de atualização de 100 Hz, ideal para trabalhar, estudar e jogar. Está bem conservado e funcionando perfeitamente.', 'U', 'A', '2026-11-22 14:12:36', '2026-11-22 14:12:36'),
(23, 2, 1, 'SSD NVMe Kingston NV2 1 TB', 'Kit com dois pentes de memória RAM DDR4, totalizando 32 GB. Ideal para melhorar o desempenho do computador, executar vários programas ao mesmo tempo e aproveitar jogos com mais fluidez. Em bom estado e funcionando perfeitamente.', 'S', 'A', '2026-11-22 14:12:45', '2026-11-22 14:12:45'),
(24, 5, 7, 'ps4', 'em ótimo estado.', 'U', 'A', '2026-11-22 22:15:39', '2026-11-22 22:15:39'),
(25, 5, 4, 'pendrive', 'ótimo estado.', 'U', 'A', '2026-11-22 22:22:12', '2026-11-22 22:22:12'),
(26, 6, 3, 'Samsung Galaxy a23 Preto', 'celular recem comprado acabou de sair da caixa, troco por notebook samsung novo e usado tambem', 'N', 'A', '2026-11-23 11:59:03', '2026-11-23 12:04:43'),
(27, 6, 3, 'Iphone 17 preto', 'celular novinho comprado em loja troco por computadores novos no geral', 'N', 'A', '2026-11-23 12:02:17', '2026-11-23 12:02:17');

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_proposta`
--

CREATE TABLE `tb_proposta` (
  `id_proposta` int(11) NOT NULL,
  `id_solicitante` int(11) NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `st_troca` char(1) NOT NULL,
  `ds_local_troca` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `st_confirmacao_solicitante` char(1) NOT NULL DEFAULT 'N',
  `st_confirmacao_destinatario` char(1) NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `tb_usuario`
--

CREATE TABLE `tb_usuario` (
  `id_usuario` int(11) NOT NULL,
  `nm_usuario` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tp_usuario` char(1) NOT NULL,
  `st_usuario` char(1) NOT NULL,
  `st_perfil_disponivel` char(1) NOT NULL DEFAULT 'A' COMMENT 'A = disponível para trocas, I = indisponível',
  `st_email_verificado` char(1) NOT NULL,
  `ds_foto_perfil` varchar(255) DEFAULT NULL,
  `ds_usuario` text DEFAULT NULL,
  `ds_localizacao` varchar(255) DEFAULT NULL,
  `ds_banner` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `tb_usuario`
--

INSERT INTO `tb_usuario` (`id_usuario`, `nm_usuario`, `email`, `password`, `tp_usuario`, `st_usuario`, `st_perfil_disponivel`, `st_email_verificado`, `ds_foto_perfil`, `ds_usuario`, `ds_localizacao`, `ds_banner`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2y$12$H/g3TIZPbozGgOSiNdnPh.m0LvcHiDq2qjt2EX48H02.qi7F5WM0e', 'A', 'A', 'A', 'N', 'usuarios/perfis/OvzSUWhDLObprIjDTM2sJFFZflCWZuXTJVc6BdY2.jpg', 'a', NULL, 'usuarios/banners/boSvNSFHIPYCIEpt3Y6ZvGm59ka0ie4ZfOm42QNU.jpg', NULL, '2026-11-21 00:59:13', '2026-11-23 14:05:42'),
(2, 'Giulia', 'giulia@gmail.com', '$2y$12$1eko7BJ6UwCJby0dSnC0jeWwZfbnYxqXMcjLpd2BDT4TM2PuFCuf.', 'C', 'A', 'A', 'N', 'usuarios/perfis/cOInrcUFlV5DVrL0Nm3RWnvx6S1CjJl9PR0ojBeo.jpg', 'Por aqui para trocar, conhecer coisas novas e aproveitar melhor o que cada um tem.', 'Itanhaém - SP', 'usuarios/banners/ieZrjWWAtvMzMGB9SkpZsTdVTna0sn0o8BHpy17B.jpg', NULL, '2026-11-21 01:00:11', '2026-11-23 17:44:27'),
(3, 'Peter', 'peter@gmail.com', '$2y$12$avtxPHaCRCUHNtfEfG6Y1uIXfXOqynRl6HXwdcL4a3HV.1L.mIniS', 'C', 'A', 'A', 'N', 'usuarios/perfis/BPskV3GAuwIntdeN9eaymhAenmONNKXlmX3Ay7ON.jpg', 'troco por celulares principalmente', 'Itanhaém - SP', 'usuarios/banners/VM3mChwTVc0WIjfoAnqtH2HJJyx1o7DFDsSUP1gZ.jpg', NULL, '2026-11-21 01:00:41', '2026-11-23 17:36:28'),
(4, 'Melanie', 'melanie@gmail.com', '$2y$12$eajERbtgfmC1Vh4mYFJah.Rdizqb.06W4XtZlrYd5pU6lGpGTeQNq', 'C', 'A', 'A', 'N', 'usuarios/perfis/sycro6ousNJLs5cprNHtpKATwZMptDHN8wcp56Ih.jpg', 'Especialista em software, tecnica de informatica', 'Itanhaém - SP', 'usuarios/banners/1NSBdvHgbFDiaBoEoLL8e13LpeC9T4qzom0wwWEl.jpg', NULL, '2026-11-21 01:01:43', '2026-11-23 17:36:32'),
(5, 'Investigador L', 'deathnote@gmail.com', '$2y$12$AyH7qDCAZvSkkmc/qguQe.6D7hqv5bC2uAOmnR/whNIMR4hkeybbq', 'C', 'A', 'A', 'N', 'usuarios/perfis/XoOUJCYWk2Ea5vCLehBnpDULjql7sOxNOZoYClgg.jpg', 'Quanto menos você souber sobre mim, melhor. Eu já sei o suficiente sobre você.', 'Itanhaém - SP', 'usuarios/banners/1GmMklWcXdjQu0mXF2H902cDO988YeRGsAA74hEf.jpg', NULL, '2026-11-21 01:02:14', '2026-11-21 17:13:29'),
(6, 'Miles', 'miles@gmail.com', '$2y$12$ji9nCugaIwaTI13rH7zoXOcXOMwH6244dz69MN4Ec1b/tMlZ0pKcC', 'C', 'A', 'A', 'N', 'usuarios/perfis/W4omLMonKcMEzjgQliWMC9zTTg5WCTA8M5jFfCIu.jpg', NULL, 'Itanhaém - SP', 'usuarios/banners/Ti1YX8aYvUm863WX5VE381p6ff60t8UrwOi0f0Zq.jpg', NULL, '2026-11-21 01:03:41', '2026-11-23 11:55:08');

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Índices para tabela `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Índices para tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Índices para tabela `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Índices para tabela `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Índices para tabela `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Índices para tabela `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Índices para tabela `tb_avaliacao`
--
ALTER TABLE `tb_avaliacao`
  ADD PRIMARY KEY (`id_avaliacao`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_produto` (`id_produto`),
  ADD KEY `tb_avaliacao_id_proposta_index` (`id_proposta`),
  ADD KEY `tb_avaliacao_id_avaliador_index` (`id_avaliador`),
  ADD KEY `tb_avaliacao_id_avaliado_index` (`id_avaliado`);

--
-- Índices para tabela `tb_categoria`
--
ALTER TABLE `tb_categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Índices para tabela `tb_comentario_avaliacao`
--
ALTER TABLE `tb_comentario_avaliacao`
  ADD PRIMARY KEY (`id_comentario`),
  ADD KEY `tb_comentario_avaliacao_id_avaliacao_foreign` (`id_avaliacao`),
  ADD KEY `tb_comentario_avaliacao_id_usuario_foreign` (`id_usuario`);

--
-- Índices para tabela `tb_denuncia`
--
ALTER TABLE `tb_denuncia`
  ADD PRIMARY KEY (`id_denuncia`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_produto` (`id_produto`),
  ADD KEY `idx_denuncia_usuario_denunciado` (`id_usuario_denunciado`);

--
-- Índices para tabela `tb_denuncia_leitura`
--
ALTER TABLE `tb_denuncia_leitura`
  ADD PRIMARY KEY (`id_administrador`,`id_denuncia`),
  ADD KEY `idx_denuncia_leitura` (`id_denuncia`);

--
-- Índices para tabela `tb_favorito`
--
ALTER TABLE `tb_favorito`
  ADD PRIMARY KEY (`id_favorito`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices para tabela `tb_historico_interacao`
--
ALTER TABLE `tb_historico_interacao`
  ADD PRIMARY KEY (`id_historico`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices para tabela `tb_imagem_denuncia`
--
ALTER TABLE `tb_imagem_denuncia`
  ADD PRIMARY KEY (`id_imagem_denuncia`),
  ADD KEY `idx_imagem_denuncia` (`id_denuncia`);

--
-- Índices para tabela `tb_imagem_produto`
--
ALTER TABLE `tb_imagem_produto`
  ADD PRIMARY KEY (`id_imagem`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices para tabela `tb_item_proposta`
--
ALTER TABLE `tb_item_proposta`
  ADD PRIMARY KEY (`id_item_proposta`),
  ADD KEY `id_proposta` (`id_proposta`),
  ADD KEY `id_produto` (`id_produto`);

--
-- Índices para tabela `tb_mensagem`
--
ALTER TABLE `tb_mensagem`
  ADD PRIMARY KEY (`id_mensagem`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_proposta` (`id_proposta`);

--
-- Índices para tabela `tb_notificacao`
--
ALTER TABLE `tb_notificacao`
  ADD PRIMARY KEY (`id_notificacao`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Índices para tabela `tb_produto`
--
ALTER TABLE `tb_produto`
  ADD PRIMARY KEY (`id_produto`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Índices para tabela `tb_proposta`
--
ALTER TABLE `tb_proposta`
  ADD PRIMARY KEY (`id_proposta`),
  ADD KEY `id_solicitante` (`id_solicitante`),
  ADD KEY `id_destinatario` (`id_destinatario`);

--
-- Índices para tabela `tb_usuario`
--
ALTER TABLE `tb_usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=127;

--
-- AUTO_INCREMENT de tabela `tb_avaliacao`
--
ALTER TABLE `tb_avaliacao`
  MODIFY `id_avaliacao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `tb_categoria`
--
ALTER TABLE `tb_categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `tb_comentario_avaliacao`
--
ALTER TABLE `tb_comentario_avaliacao`
  MODIFY `id_comentario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_denuncia`
--
ALTER TABLE `tb_denuncia`
  MODIFY `id_denuncia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_favorito`
--
ALTER TABLE `tb_favorito`
  MODIFY `id_favorito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tb_historico_interacao`
--
ALTER TABLE `tb_historico_interacao`
  MODIFY `id_historico` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_imagem_denuncia`
--
ALTER TABLE `tb_imagem_denuncia`
  MODIFY `id_imagem_denuncia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `tb_imagem_produto`
--
ALTER TABLE `tb_imagem_produto`
  MODIFY `id_imagem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de tabela `tb_item_proposta`
--
ALTER TABLE `tb_item_proposta`
  MODIFY `id_item_proposta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de tabela `tb_mensagem`
--
ALTER TABLE `tb_mensagem`
  MODIFY `id_mensagem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `tb_notificacao`
--
ALTER TABLE `tb_notificacao`
  MODIFY `id_notificacao` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_produto`
--
ALTER TABLE `tb_produto`
  MODIFY `id_produto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `tb_proposta`
--
ALTER TABLE `tb_proposta`
  MODIFY `id_proposta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `tb_usuario`
--
ALTER TABLE `tb_usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `tb_avaliacao`
--
ALTER TABLE `tb_avaliacao`
  ADD CONSTRAINT `fk_avaliacao_avaliado` FOREIGN KEY (`id_avaliado`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avaliacao_avaliador` FOREIGN KEY (`id_avaliador`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avaliacao_proposta` FOREIGN KEY (`id_proposta`) REFERENCES `tb_proposta` (`id_proposta`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_avaliacao_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`),
  ADD CONSTRAINT `tb_avaliacao_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`);

--
-- Limitadores para a tabela `tb_comentario_avaliacao`
--
ALTER TABLE `tb_comentario_avaliacao`
  ADD CONSTRAINT `tb_comentario_avaliacao_id_avaliacao_foreign` FOREIGN KEY (`id_avaliacao`) REFERENCES `tb_avaliacao` (`id_avaliacao`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_comentario_avaliacao_id_usuario_foreign` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_denuncia`
--
ALTER TABLE `tb_denuncia`
  ADD CONSTRAINT `tb_denuncia_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`),
  ADD CONSTRAINT `tb_denuncia_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`);

--
-- Limitadores para a tabela `tb_denuncia_leitura`
--
ALTER TABLE `tb_denuncia_leitura`
  ADD CONSTRAINT `fk_denuncia_leitura_administrador` FOREIGN KEY (`id_administrador`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_denuncia_leitura_denuncia` FOREIGN KEY (`id_denuncia`) REFERENCES `tb_denuncia` (`id_denuncia`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_favorito`
--
ALTER TABLE `tb_favorito`
  ADD CONSTRAINT `tb_favorito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_favorito_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_historico_interacao`
--
ALTER TABLE `tb_historico_interacao`
  ADD CONSTRAINT `tb_historico_interacao_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`),
  ADD CONSTRAINT `tb_historico_interacao_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`);

--
-- Limitadores para a tabela `tb_imagem_denuncia`
--
ALTER TABLE `tb_imagem_denuncia`
  ADD CONSTRAINT `fk_imagem_denuncia` FOREIGN KEY (`id_denuncia`) REFERENCES `tb_denuncia` (`id_denuncia`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_imagem_produto`
--
ALTER TABLE `tb_imagem_produto`
  ADD CONSTRAINT `tb_imagem_produto_ibfk_1` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_item_proposta`
--
ALTER TABLE `tb_item_proposta`
  ADD CONSTRAINT `tb_item_proposta_ibfk_1` FOREIGN KEY (`id_proposta`) REFERENCES `tb_proposta` (`id_proposta`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_item_proposta_ibfk_2` FOREIGN KEY (`id_produto`) REFERENCES `tb_produto` (`id_produto`);

--
-- Limitadores para a tabela `tb_mensagem`
--
ALTER TABLE `tb_mensagem`
  ADD CONSTRAINT `tb_mensagem_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`),
  ADD CONSTRAINT `tb_mensagem_ibfk_2` FOREIGN KEY (`id_proposta`) REFERENCES `tb_proposta` (`id_proposta`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_notificacao`
--
ALTER TABLE `tb_notificacao`
  ADD CONSTRAINT `tb_notificacao_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `tb_produto`
--
ALTER TABLE `tb_produto`
  ADD CONSTRAINT `tb_produto_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `tb_usuario` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_produto_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `tb_categoria` (`id_categoria`);

--
-- Limitadores para a tabela `tb_proposta`
--
ALTER TABLE `tb_proposta`
  ADD CONSTRAINT `tb_proposta_ibfk_1` FOREIGN KEY (`id_solicitante`) REFERENCES `tb_usuario` (`id_usuario`),
  ADD CONSTRAINT `tb_proposta_ibfk_2` FOREIGN KEY (`id_destinatario`) REFERENCES `tb_usuario` (`id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
