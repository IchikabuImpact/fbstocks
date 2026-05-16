/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.15-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: fbstocks
-- ------------------------------------------------------
-- Server version	10.11.15-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorite_samples`
--

DROP TABLE IF EXISTS `favorite_samples`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorite_samples` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_symbol` varchar(10) NOT NULL,
  `stock_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_symbol` (`stock_symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorite_samples`
--

LOCK TABLES `favorite_samples` WRITE;
/*!40000 ALTER TABLE `favorite_samples` DISABLE KEYS */;
INSERT INTO `favorite_samples` VALUES
(7,'1928','','2024-12-23 07:57:30','2024-12-23 07:57:30'),
(8,'8593','','2024-12-23 07:57:30','2024-12-23 07:57:30'),
(9,'8931','','2024-12-23 07:57:30','2024-12-23 07:57:30'),
(10,'9765','','2024-12-23 07:57:30','2024-12-23 07:57:30'),
(11,'7532','','2024-12-23 07:57:30','2024-12-23 07:57:30'),
(12,'3475','','2024-12-23 07:57:30','2024-12-23 07:57:30');
/*!40000 ALTER TABLE `favorite_samples` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`stock_id`),
  KEY `stock_id` (`stock_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES
(7,1,7,'2026-05-16 13:42:38','2026-05-16 13:42:38'),
(8,1,8,'2026-05-16 13:42:46','2026-05-16 13:42:46'),
(9,1,9,'2026-05-16 13:42:54','2026-05-16 13:42:54'),
(10,1,10,'2026-05-16 13:43:02','2026-05-16 13:43:02'),
(11,1,11,'2026-05-16 13:43:10','2026-05-16 13:43:10'),
(12,1,12,'2026-05-16 13:43:16','2026-05-16 13:43:16'),
(13,1,13,'2026-05-16 13:43:22','2026-05-16 13:43:22'),
(14,1,14,'2026-05-16 13:43:27','2026-05-16 13:43:27'),
(15,1,15,'2026-05-16 13:43:32','2026-05-16 13:43:32'),
(16,1,16,'2026-05-16 13:43:38','2026-05-16 13:43:38'),
(17,1,17,'2026-05-16 13:43:43','2026-05-16 13:43:43'),
(18,1,18,'2026-05-16 13:43:48','2026-05-16 13:43:48'),
(19,1,19,'2026-05-16 13:43:54','2026-05-16 13:43:54'),
(20,1,20,'2026-05-16 13:44:01','2026-05-16 13:44:01'),
(21,1,21,'2026-05-16 13:44:06','2026-05-16 13:44:06'),
(22,1,22,'2026-05-16 13:44:11','2026-05-16 13:44:11');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_accounts`
--

DROP TABLE IF EXISTS `social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(50) NOT NULL,
  `provider_id` varchar(255) NOT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `social_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_accounts`
--

LOCK TABLES `social_accounts` WRITE;
/*!40000 ALTER TABLE `social_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `social_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stock_symbol` varchar(10) NOT NULL,
  `stock_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `stock_symbol` (`stock_symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES
(1,'1928','1928','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(2,'8593','8593','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(3,'8931','8931','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(4,'9765','9765','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(5,'7532','7532','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(6,'3475','3475','2026-05-16 13:26:49','2026-05-16 13:26:49'),
(7,'1578','アモーヴァ・アセットマネジメント株式会社　上場インデックスファンド日経２２５（ミニ）','2026-05-16 13:42:38','2026-05-16 13:42:38'),
(8,'1605','ＩＮＰＥＸ','2026-05-16 13:42:46','2026-05-16 13:42:46'),
(9,'1615','野村アセットマネジメント株式会社　ＮＥＸＴ　ＦＵＮＤＳ　東証銀行業株価指数連動型上場投信','2026-05-16 13:42:54','2026-05-16 13:42:54'),
(10,'2702','日本マクドナルドホールディングス','2026-05-16 13:43:02','2026-05-16 13:43:02'),
(11,'4062','イビデン','2026-05-16 13:43:10','2026-05-16 13:43:10'),
(12,'4063','信越化学工業','2026-05-16 13:43:16','2026-05-16 13:43:16'),
(13,'4204','積水化学工業','2026-05-16 13:43:22','2026-05-16 13:43:22'),
(14,'4452','花王','2026-05-16 13:43:27','2026-05-16 13:43:27'),
(15,'6503','三菱電機','2026-05-16 13:43:32','2026-05-16 13:43:32'),
(16,'6674','ジーエス・ユアサ　コーポレーション','2026-05-16 13:43:38','2026-05-16 13:43:38'),
(17,'6701','日本電気','2026-05-16 13:43:43','2026-05-16 13:43:43'),
(18,'6762','ＴＤＫ','2026-05-16 13:43:48','2026-05-16 13:43:48'),
(19,'6981','村田製作所','2026-05-16 13:43:54','2026-05-16 13:43:54'),
(20,'8058','三菱商事','2026-05-16 13:44:01','2026-05-16 13:44:01'),
(21,'8766','東京海上ホールディングス','2026-05-16 13:44:06','2026-05-16 13:44:06'),
(22,'9984','ソフトバンクグループ','2026-05-16 13:44:11','2026-05-16 13:44:11');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'いちかぶインパクト','kenchanbaken@gmail.com','2024-09-19 08:52:05','2024-09-19 08:52:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16 23:38:12
