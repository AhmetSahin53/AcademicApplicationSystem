-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: akademik_basvuru
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `basvuru_atiflar`
--

DROP TABLE IF EXISTS `basvuru_atiflar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basvuru_atiflar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basvuru_id` int NOT NULL,
  `atif_bilgisi` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `basvuru_id` (`basvuru_id`),
  CONSTRAINT `basvuru_atiflar_ibfk_1` FOREIGN KEY (`basvuru_id`) REFERENCES `basvurular` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basvuru_atiflar`
--

LOCK TABLES `basvuru_atiflar` WRITE;
/*!40000 ALTER TABLE `basvuru_atiflar` DISABLE KEYS */;
INSERT INTO `basvuru_atiflar` VALUES (1,1,'Smith, J. (2023). Referencing Y─▒lmaz\'s work on deep learning. Advanced Computing Journal, 15(3), 78-92.'),(2,1,'Johnson, K. (2022). Analysis of neural network applications. IEEE Computer, 55(2), 67-80.'),(3,1,'Brown, L. (2023). Machine learning in modern applications. AI Review, 28(1), 112-130.'),(4,2,'Chen, W. (2023). Modern wireless communication techniques. Journal of Telecommunications, 18(2), 45-58.'),(5,2,'Garcia, M. (2022). 5G implementation challenges. Mobile Networks and Applications, 27(3), 112-125.'),(6,1,'Smith, J. (2023). Referencing Y─▒lmaz\'s work on deep learning. Advanced Computing Journal, 15(3), 78-92.'),(7,1,'Johnson, K. (2022). Analysis of neural network applications. IEEE Computer, 55(2), 67-80.');
/*!40000 ALTER TABLE `basvuru_atiflar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basvuru_belgeleri`
--

DROP TABLE IF EXISTS `basvuru_belgeleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basvuru_belgeleri` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basvuru_id` int NOT NULL,
  `dosya_yolu` varchar(255) NOT NULL,
  `dosya_adi` varchar(255) NOT NULL,
  `dosya_tipi` varchar(100) NOT NULL,
  `dosya_boyutu` int NOT NULL,
  `yukleme_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `basvuru_id` (`basvuru_id`),
  CONSTRAINT `basvuru_belgeleri_ibfk_1` FOREIGN KEY (`basvuru_id`) REFERENCES `basvurular` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basvuru_belgeleri`
--

LOCK TABLES `basvuru_belgeleri` WRITE;
/*!40000 ALTER TABLE `basvuru_belgeleri` DISABLE KEYS */;
INSERT INTO `basvuru_belgeleri` VALUES (1,1,'/uploads/ornek/ozgecmis.pdf','ozgecmis.pdf','application/pdf',449,'2025-04-29 08:02:16'),(2,1,'/uploads/ornek/diploma.pdf','diploma.pdf','application/pdf',449,'2025-04-29 08:02:16'),(3,1,'/uploads/ornek/yayin_belgesi.pdf','yayin_belgesi.pdf','application/pdf',449,'2025-04-29 08:02:18'),(4,2,'/uploads/ornek/ozgecmis.pdf','ozgecmis.pdf','application/pdf',449,'2025-04-29 08:02:19'),(5,2,'/uploads/ornek/diploma.pdf','diploma.pdf','application/pdf',449,'2025-04-29 08:02:19'),(6,2,'/uploads/ornek/yayin_belgesi.pdf','yayin_belgesi.pdf','application/pdf',449,'2025-04-29 08:02:20'),(7,1,'https://akademik-basvuru.s3.us-east-1.amazonaws.com/uploads/adaylar/documents/Ahmet_Y─▒lmaz_Ozgecmis.pdf','Ahmet_Y─▒lmaz_Ozgecmis.pdf','application/pdf',449,'2025-04-29 08:49:20'),(8,1,'https://akademik-basvuru.s3.us-east-1.amazonaws.com/uploads/adaylar/documents/Ahmet_Y─▒lmaz_Diploma.pdf','Ahmet_Y─▒lmaz_Diploma.pdf','application/pdf',449,'2025-04-29 08:49:21'),(9,1,'https://akademik-basvuru.s3.us-east-1.amazonaws.com/uploads/adaylar/documents/Ahmet_Y─▒lmaz_YayinBelgesi.pdf','Ahmet_Y─▒lmaz_YayinBelgesi.pdf','application/pdf',449,'2025-04-29 08:49:22');
/*!40000 ALTER TABLE `basvuru_belgeleri` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basvuru_konferanslar`
--

DROP TABLE IF EXISTS `basvuru_konferanslar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basvuru_konferanslar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basvuru_id` int NOT NULL,
  `konferans_bilgisi` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `basvuru_id` (`basvuru_id`),
  CONSTRAINT `basvuru_konferanslar_ibfk_1` FOREIGN KEY (`basvuru_id`) REFERENCES `basvurular` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basvuru_konferanslar`
--

LOCK TABLES `basvuru_konferanslar` WRITE;
/*!40000 ALTER TABLE `basvuru_konferanslar` DISABLE KEYS */;
INSERT INTO `basvuru_konferanslar` VALUES (1,1,'Y─▒lmaz, A. (2023). Deep Learning in Practice. International Conference on Computer Science, Berlin, Germany, June 15-18, 2023.'),(2,1,'Y─▒lmaz, A., Kaya, B. (2022). Neural Network Optimization. IEEE Conference on Artificial Intelligence, New York, USA, May 10-12, 2022.'),(3,2,'Demir, A. (2023). Future of 5G. International Symposium on Wireless Communication, Tokyo, Japan, July 5-8, 2023.'),(4,2,'Demir, A., Y─▒ld─▒z, S. (2022). IoT and 5G Integration. IEEE Conference on Communications, Barcelona, Spain, April 15-18, 2022.'),(5,1,'Y─▒lmaz, A. (2023). Deep Learning in Practice. International Conference on Computer Science, Berlin, Germany, June 15-18, 2023.');
/*!40000 ALTER TABLE `basvuru_konferanslar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basvuru_yayinlar`
--

DROP TABLE IF EXISTS `basvuru_yayinlar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basvuru_yayinlar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basvuru_id` int NOT NULL,
  `yayin_turu` varchar(10) NOT NULL,
  `yayin_bilgisi` text NOT NULL,
  `baslica_yazar` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `basvuru_id` (`basvuru_id`),
  CONSTRAINT `basvuru_yayinlar_ibfk_1` FOREIGN KEY (`basvuru_id`) REFERENCES `basvurular` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basvuru_yayinlar`
--

LOCK TABLES `basvuru_yayinlar` WRITE;
/*!40000 ALTER TABLE `basvuru_yayinlar` DISABLE KEYS */;
INSERT INTO `basvuru_yayinlar` VALUES (1,1,'A1','Y─▒lmaz, A., Kaya, B. (2023). Deep Learning Applications in Computer Science. Journal of Computer Science, 45(2), 112-125.',1),(2,1,'A1','Y─▒lmaz, A., Demir, C., Kaya, B. (2022). Neural Networks for Image Processing. IEEE Transactions on Image Processing, 31(3), 1245-1260.',1),(3,1,'A2','Y─▒lmaz, A., ├ûzt├╝rk, M. (2021). Machine Learning Algorithms for Data Analysis. International Journal of Data Science, 12(4), 345-358.',1),(4,2,'A1','Demir, A., Y─▒ld─▒z, S. (2023). Wireless Communication Systems. IEEE Transactions on Communications, 42(3), 234-248.',1),(5,2,'B1','Demir, A., Kara, M. (2022). 5G Network Architecture. International Conference on Telecommunications, Paris, France, Proceedings, 123-135.',1),(6,1,'A1','Y─▒lmaz, A., Kaya, B. (2023). Deep Learning Applications in Computer Science. Journal of Computer Science, 45(2), 112-125.',1),(7,1,'A2','Y─▒lmaz, A., ├ûzt├╝rk, M. (2021). Machine Learning Algorithms for Data Analysis. International Journal of Data Science, 12(4), 345-358.',1);
/*!40000 ALTER TABLE `basvuru_yayinlar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `basvurular`
--

DROP TABLE IF EXISTS `basvurular`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `basvurular` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ilan_id` int NOT NULL,
  `aday_id` int NOT NULL,
  `durum` enum('Beklemede','Onayland─▒','Reddedildi') NOT NULL DEFAULT 'Beklemede',
  `basvuru_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sonuc_tarihi` timestamp NULL DEFAULT NULL,
  `sonuc_aciklama` text,
  PRIMARY KEY (`id`),
  KEY `ilan_id` (`ilan_id`),
  KEY `aday_id` (`aday_id`),
  CONSTRAINT `basvurular_ibfk_1` FOREIGN KEY (`ilan_id`) REFERENCES `ilanlar` (`id`) ON DELETE CASCADE,
  CONSTRAINT `basvurular_ibfk_2` FOREIGN KEY (`aday_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `basvurular`
--

LOCK TABLES `basvurular` WRITE;
/*!40000 ALTER TABLE `basvurular` DISABLE KEYS */;
INSERT INTO `basvurular` VALUES (1,2,11,'Beklemede','2025-04-29 08:02:12',NULL,NULL),(2,3,12,'Beklemede','2025-04-29 08:02:18',NULL,NULL);
/*!40000 ALTER TABLE `basvurular` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bildirimler`
--

DROP TABLE IF EXISTS `bildirimler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bildirimler` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `baslik` varchar(255) NOT NULL,
  `mesaj` text NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `okundu` tinyint(1) NOT NULL DEFAULT '0',
  `olusturma_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bildirimler_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bildirimler`
--

LOCK TABLES `bildirimler` WRITE;
/*!40000 ALTER TABLE `bildirimler` DISABLE KEYS */;
/*!40000 ALTER TABLE `bildirimler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ilan_juri_uyeleri`
--

DROP TABLE IF EXISTS `ilan_juri_uyeleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ilan_juri_uyeleri` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ilan_id` int NOT NULL,
  `juri_id` int NOT NULL,
  `ekleme_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ilan_id` (`ilan_id`,`juri_id`),
  KEY `juri_id` (`juri_id`),
  CONSTRAINT `ilan_juri_uyeleri_ibfk_1` FOREIGN KEY (`ilan_id`) REFERENCES `ilanlar` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ilan_juri_uyeleri_ibfk_2` FOREIGN KEY (`juri_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ilan_juri_uyeleri`
--

LOCK TABLES `ilan_juri_uyeleri` WRITE;
/*!40000 ALTER TABLE `ilan_juri_uyeleri` DISABLE KEYS */;
INSERT INTO `ilan_juri_uyeleri` VALUES (1,2,8,'2025-04-27 18:06:09'),(2,4,8,'2025-04-28 15:38:04'),(4,8,8,'2025-04-29 12:58:46');
/*!40000 ALTER TABLE `ilan_juri_uyeleri` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ilan_kriterleri`
--

DROP TABLE IF EXISTS `ilan_kriterleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ilan_kriterleri` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ilan_id` int NOT NULL,
  `kriter_tipi` varchar(10) NOT NULL,
  `kriter_aciklama` text NOT NULL,
  `min_puan` int NOT NULL DEFAULT '0',
  `min_adet` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ilan_id` (`ilan_id`),
  CONSTRAINT `ilan_kriterleri_ibfk_1` FOREIGN KEY (`ilan_id`) REFERENCES `ilanlar` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ilan_kriterleri`
--

LOCK TABLES `ilan_kriterleri` WRITE;
/*!40000 ALTER TABLE `ilan_kriterleri` DISABLE KEYS */;
INSERT INTO `ilan_kriterleri` VALUES (4,2,'A1','SCI, SCI-Expanded, SSCI veya AHCI kapsam─▒ndaki dergilerde yay─▒mlanm─▒┼ş makale',60,3),(5,2,'A2','Uluslararas─▒ alan indekslerinde taranan dergilerde yay─▒mlanm─▒┼ş makale',40,2),(6,2,'D1','Aday─▒n yay─▒nlar─▒na yap─▒lan at─▒flar',30,10),(7,3,'A1','SCI, SCI-Expanded, SSCI veya AHCI kapsam─▒ndaki dergilerde yay─▒mlanm─▒┼ş makale',40,1),(8,3,'B1','Uluslararas─▒ kongre/sempozyum bildirisi',20,2),(9,4,'A1','SCI, SCI-Expanded, SSCI veya AHCI kapsam─▒ndaki dergilerde yay─▒mlanm─▒┼ş makale',80,5),(10,4,'C1','Uluslararas─▒ kitap/kitap b├Âl├╝m├╝',50,1),(11,4,'D1','Aday─▒n yay─▒nlar─▒na yap─▒lan at─▒flar',50,20);
/*!40000 ALTER TABLE `ilan_kriterleri` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ilanlar`
--

DROP TABLE IF EXISTS `ilanlar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ilanlar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `baslik` varchar(255) NOT NULL,
  `kadro_turu` enum('Dr. ├û─şr. ├£yesi','Do├ğent','Profes├Âr') NOT NULL,
  `birim` varchar(255) NOT NULL,
  `anabilim_dali` varchar(255) NOT NULL,
  `baslangic_tarihi` date NOT NULL,
  `bitis_tarihi` date NOT NULL,
  `durum` enum('Aktif','Pasif','Yay─▒mlanacak') NOT NULL DEFAULT 'Yay─▒mlanacak',
  `aciklama` text,
  `olusturma_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ilanlar`
--

LOCK TABLES `ilanlar` WRITE;
/*!40000 ALTER TABLE `ilanlar` DISABLE KEYS */;
INSERT INTO `ilanlar` VALUES (2,'Bigisayar M├╝hendisli─şi Do├ğent ─░lan─▒','Do├ğent','M├╝hendislik Fak├╝ltesi','Bilgisayar M├╝hendisli─şi','2025-03-25','2025-05-23','Aktif','Bilgisayar M├╝hendisli─şi Anabilim Dal─▒\'nda do├ğent kadrosunda g├Ârevlendirilmek ├╝zere akademik personel al─▒nacakt─▒r. Adaylar─▒n Bilgisayar M├╝hendisli─şi alan─▒nda do├ğent unvan─▒na sahip olmalar─▒ gerekmektedir.','2025-04-27 17:19:49'),(3,'Elektrik-Elektronik M├╝hendisli─şi Dr. ├û─şr. ├£yesi ─░lan─▒','Dr. ├û─şr. ├£yesi','M├╝hendislik Fak├╝ltesi','Elektrik-Elektronik M├╝hendisli─şi','2025-03-27','2025-05-25','Pasif','Elektrik-Elektronik M├╝hendisli─şi Anabilim Dal─▒\'nda Dr. ├û─şr. ├£yesi kadrosunda g├Ârevlendirilmek ├╝zere akademik personel al─▒nacakt─▒r. Adaylar─▒n Elektrik-Elektronik M├╝hendisli─şi alan─▒nda doktora derecesine sahip olmalar─▒ gerekmektedir.','2025-04-27 17:19:49'),(4,'Makine M├╝hendisli─şi Profes├Âr ─░lan─▒','Profes├Âr','M├╝hendislik Fak├╝ltesi','Makine M├╝hendisli─şi','2025-03-27','2025-05-25','Aktif','Makine M├╝hendisli─şi Anabilim Dal─▒\'nda profes├Âr kadrosunda g├Ârevlendirilmek ├╝zere akademik personel al─▒nacakt─▒r. Adaylar─▒n Makine M├╝hendisli─şi alan─▒nda profes├Âr unvan─▒na sahip olmalar─▒ gerekmektedir.','2025-04-27 17:19:49'),(7,'c','Dr. ├û─şr. ├£yesi','c','c','2025-04-21','2025-05-14','Pasif','c','2025-04-29 10:06:29'),(8,'Bili┼şim Sistemleri M├╝hendisli─şi Do├ğent ─░lan─▒','Do├ğent','Teknoloji Fak├╝ltesi','Bili┼şim Sistemleri','2025-04-26','2025-05-24','Aktif','Bili┼şim Sistemleri M├╝hendisli─şi Do├ğent ─░lan─▒','2025-04-29 11:47:38'),(9,'t','Dr. ├û─şr. ├£yesi','t','t','2025-05-04','2025-06-03','Yay─▒mlanacak','t','2025-04-29 12:54:51');
/*!40000 ALTER TABLE `ilanlar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `juri_degerlendirmeleri`
--

DROP TABLE IF EXISTS `juri_degerlendirmeleri`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `juri_degerlendirmeleri` (
  `id` int NOT NULL AUTO_INCREMENT,
  `basvuru_id` int NOT NULL,
  `juri_id` int NOT NULL,
  `degerlendirme_metni` text,
  `sonuc` enum('Olumlu','Olumsuz') NOT NULL,
  `rapor_yolu` varchar(255) DEFAULT NULL,
  `degerlendirme_tarihi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `guncelleme_tarihi` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `basvuru_id` (`basvuru_id`,`juri_id`),
  KEY `juri_id` (`juri_id`),
  CONSTRAINT `juri_degerlendirmeleri_ibfk_1` FOREIGN KEY (`basvuru_id`) REFERENCES `basvurular` (`id`) ON DELETE CASCADE,
  CONSTRAINT `juri_degerlendirmeleri_ibfk_2` FOREIGN KEY (`juri_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `juri_degerlendirmeleri`
--

LOCK TABLES `juri_degerlendirmeleri` WRITE;
/*!40000 ALTER TABLE `juri_degerlendirmeleri` DISABLE KEYS */;
/*!40000 ALTER TABLE `juri_degerlendirmeleri` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tc_no` varchar(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('aday','admin','yonetici','juri') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tc_no` (`tc_no`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'18218306616','Ahmet Muhammed ┼Şahin','ahmet12369874@gmail.com','$2b$10$plUYXmDMUJQ1JcIydapUFOAAn2T8kFJlEYV6IvWRPXHRnF4PGuygG','admin','2025-04-27 17:54:14'),(7,'11567668190','Emircan Kural','emircankural@gmail.com','$2b$10$uAhd3bVAiuXPrRDLPwasYucW4llVZp2g6JYJu9v/KHbyfrReINKi6','aday','2025-04-27 17:59:50'),(8,'11111111111','Mehmet Dursun','mehmet@example.com','$2b$10$nQDyQxtKFvIFGNWIxxi.W.ItnNiAXXLobgeXQr7kxJv8Zl5M4U5/2','juri','2025-04-27 18:04:39'),(9,'22222222222','Elif T├╝rk','elif@example.com','$2b$10$l5KfJ7Xotfx69mmXLti2kuZDfavsmXQ8NgN7A8KhuGG/joFk3WMSG','yonetici','2025-04-27 18:05:23'),(10,'77777777777','Rafa Silva','rafa@example.com','$2b$10$PyH8FO9N/56YUQTHNxV.ruNDZ3W9nQ8MvWEAklAvJN/dIGJAwab.S','aday','2025-04-28 13:27:21'),(11,'12345678901','Ahmet Y─▒lmaz','ahmet.yilmaz@example.com','$2b$10$uKPD1Ptfu.iH7LcE3CS0G.jygIANwGIY6Sx0vvY4.KfN6af8RXJWi','aday','2025-04-29 08:02:11'),(12,'98765432109','Ay┼şe Demir','ayse.demir@example.com','$2b$10$CIj/lYj9sr4bpxy4Xv0G5ee2hu2QZ61UJpSeRq1HAmG/G7fnnbJWS','aday','2025-04-29 08:02:12');
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

-- Dump completed on 2025-04-29 16:28:22
