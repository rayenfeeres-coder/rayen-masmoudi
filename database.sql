-- ==========================================================
-- RAYEN MASMOUDI DIGITAL - Base de Données Complète MySQL
-- Agence de Digital Marketing & Video Ads - Sfax, Tunisie
-- Compatible avec XAMPP (Apache + MySQL / MariaDB) & PHP 8+
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+01:00"; -- Fuseau horaire Tunisie (UTC+1)

-- --------------------------------------------------------
-- Création de la Base de Données
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `rayen_masmoudi_digital` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `rayen_masmoudi_digital`;

-- --------------------------------------------------------
-- Table: admins (Utilisateurs et Administrateurs)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Haché avec password_hash() BCRYPT ou SHA-256 salé
  `salt` VARCHAR(64) DEFAULT 'rmd_salt_2026',
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'manager') DEFAULT 'admin',
  `session_version` INT DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_login` DATETIME NULL,
  `last_password_change` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `salt`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', 'rayen.masmoudi.digital@gmail.com', '$2y$10$wE6v9eH1g0sO2b.X3p0PgejXbE304V2Kq04qH/Z4Q7e8Uj5x9b3iG', 'rmd_salt_2026', 'Rayen Masmoudi', 'superadmin', NOW());

-- --------------------------------------------------------
-- Table: settings (Paramètres Généraux du Site & Coordonnées GPS)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `agency_name` VARCHAR(100) NOT NULL DEFAULT 'RAYEN MASMOUDI DIGITAL',
  `tagline` VARCHAR(255) NOT NULL DEFAULT 'مش خدمات فقط... نتائج تُقاس.',
  `sub_tagline` VARCHAR(255) NOT NULL DEFAULT 'Digital Marketing & Video Ads',
  `hero_description` TEXT,
  `phone` VARCHAR(30) NOT NULL DEFAULT '+216 44 203 500',
  `whatsapp` VARCHAR(30) NOT NULL DEFAULT '+21644203500',
  `email` VARCHAR(100) NOT NULL DEFAULT 'rayen.masmoudi.digital@gmail.com',
  `address` VARCHAR(150) NOT NULL DEFAULT 'Sfax, Tunisie',
  `facebook_url` VARCHAR(255) NOT NULL DEFAULT 'https://facebook.com/RayenMasmoudiDigital',
  `instagram_url` VARCHAR(255) DEFAULT 'https://instagram.com/rayen_masmoudi_digital',
  `website_url` VARCHAR(100) NOT NULL DEFAULT 'https://digital.com',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'DT',
  `announcement_active` TINYINT(1) DEFAULT 1,
  `announcement_text` VARCHAR(255) DEFAULT '🔥 عرض خاص صفاقس : تخفيض 20% على باقات الإعلانات الممولة ومونتاج الفيديو !',
  `default_latitude` DECIMAL(10, 8) DEFAULT 34.74056000,
  `default_longitude` DECIMAL(11, 8) DEFAULT 10.76028000,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`id`, `agency_name`, `tagline`, `sub_tagline`, `hero_description`, `phone`, `whatsapp`, `email`, `address`, `facebook_url`, `currency`, `announcement_active`, `announcement_text`) VALUES
(1, 'RAYEN MASMOUDI DIGITAL', 'مش خدمات فقط... نتائج تُقاس.', 'Digital Marketing & Video Ads', 'نساعدك على تطوير مشروعك، جذب الحرفاء، وزيادة مبيعاتك عبر الحلول الرقمية الحديثة.', '+216 44 203 500', '+21644203500', 'rayen.masmoudi.digital@gmail.com', 'Sfax, Tunisie', 'https://facebook.com/RayenMasmoudiDigital', 'DT', 1, '🔥 عرض خاص صفاقس : تخفيض 20% على باقات الإعلانات الممولة ومونتاج الفيديو !');

-- --------------------------------------------------------
-- Table: working_hours (Gestion des Horaires et Disponibilité)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `working_hours`;
CREATE TABLE `working_hours` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `day_name` VARCHAR(30) NOT NULL,
  `day_name_ar` VARCHAR(30) NOT NULL,
  `is_open` TINYINT(1) DEFAULT 1,
  `open_time` VARCHAR(20) DEFAULT '08:30',
  `close_time` VARCHAR(20) DEFAULT '18:30',
  `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `working_hours` (`id`, `day_name`, `day_name_ar`, `is_open`, `open_time`, `close_time`, `sort_order`) VALUES
(1, 'Lundi', 'الإثنين', 1, '08:30', '18:30', 1),
(2, 'Mardi', 'الثلاثاء', 1, '08:30', '18:30', 2),
(3, 'Mercredi', 'الأربعاء', 1, '08:30', '18:30', 3),
(4, 'Jeudi', 'الخميس', 1, '08:30', '18:30', 4),
(5, 'Vendredi', 'الجمعة', 1, '08:30', '18:30', 5),
(6, 'Samedi', 'السبت', 1, '09:00', '14:00', 6),
(7, 'Dimanche', 'الأحد', 0, 'Fermé', 'Fermé', 7);

-- --------------------------------------------------------
-- Table: ads (Gestion des Équipes & Campagnes Publicitaires)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ads`;
CREATE TABLE `ads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `title_ar` VARCHAR(150) NULL,
  `slug` VARCHAR(150) NOT NULL,
  `advertiser_name` VARCHAR(100) NOT NULL,
  `advertiser_phone` VARCHAR(30) NOT NULL,
  `advertiser_email` VARCHAR(100) NULL,
  `description` TEXT NOT NULL,
  `description_ar` TEXT NULL,
  `price_dt` DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  `old_price_dt` DECIMAL(10,2) NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'marketing',
  `images_json` JSON, -- Liste des images associées
  `video_url` VARCHAR(255) NULL,
  `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `rejection_reason` TEXT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `is_paused` TINYINT(1) DEFAULT 0,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `scheduled_publish_time` DATETIME NULL,
  `custom_elements_json` JSON,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `map_address` VARCHAR(255) NULL,
  `map_enabled` TINYINT(1) DEFAULT 0,
  `views_count` INT DEFAULT 0,
  `clicks_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ads` (`id`, `title`, `title_ar`, `slug`, `advertiser_name`, `advertiser_phone`, `description`, `price_dt`, `category`, `images_json`, `status`, `is_published`, `is_paused`, `start_date`, `end_date`, `map_address`) VALUES
(1, 'Campagne Promo Pâtisserie Orientale', 'حملة ترويجية للمرطبات الشرقية - صفاقس', 'campagne-promo-patisserie', 'Patisserie Ben Salem', '+216 98 123 456', 'Campagne publicitaire vidéo sur Facebook et Instagram avec livraison gratuite à Sfax.', 120.00, 'video', '["https://images.unsplash.com/photo-1555396273-367ea4eb4db5"]', 'accepted', 1, 0, '2026-11-01', '2026-11-30', 'Route de Téniour Km 2.5, Sfax'),
(2, 'Lancement Collection Hiver Bella Moda', 'إطلاق تشكيلة الشتاء الفاخرة', 'lancement-collection-hiver', 'Boutique Bella Moda', '+216 24 555 888', 'Spot vidéo TikTok et Reels pour promouvoir la nouvelle collection de manteaux.', 90.00, 'sponsoring', '["https://images.unsplash.com/photo-1441986300917-64674bd600d8"]', 'accepted', 1, 0, '2026-11-05', '2026-11-25', 'Avenue Habib Bourguiba, Sfax'),
(3, 'Offre Buffet Déjeuner Médina', 'عرض الغداء المفتوح - مطعم المدينة', 'offre-buffet-medina', 'Mohamed Fakhfakh', '+216 97 456 123', 'Annonce sponsorisée pour attirer les familles le week-end avec formule buffet.', 75.00, 'marketing', '["https://images.unsplash.com/photo-1544025162-d76694265947"]', 'pending', 0, 0, '2026-11-10', '2026-12-10', 'Bab Diwan, Médina de Sfax');

-- --------------------------------------------------------
-- Table: notifications (Centre des Notifications & Alertes)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `recipient_name` VARCHAR(100) NULL,
  `recipient_phone` VARCHAR(30) NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('ad_status', 'order', 'system', 'message') DEFAULT 'system',
  `ad_id` INT NULL,
  `order_id` INT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `recipient_name`, `recipient_phone`, `title`, `message`, `type`, `ad_id`, `is_read`) VALUES
(1, 'Patisserie Ben Salem', '+216 98 123 456', 'Votre annonce a été acceptée et publiée !', 'Félicitations, votre annonce a été validée par Rayen Masmoudi.', 'ad_status', 1, 1),
(2, 'Mohamed Fakhfakh', '+216 97 456 123', 'Demande d\'annonce en cours d\'examen', 'Votre demande est en cours de révision par notre équipe.', 'ad_status', 3, 0);

-- --------------------------------------------------------
-- Table: content_blocks (CMS - Gestion de Contenu sans Code)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `content_blocks`;
CREATE TABLE `content_blocks` (
  `id` VARCHAR(50) PRIMARY KEY,
  `section_key` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `title_ar` VARCHAR(150) NULL,
  `content` TEXT NOT NULL,
  `content_ar` TEXT NULL,
  `badge` VARCHAR(100) NULL,
  `order_index` INT DEFAULT 1,
  `is_visible` TINYINT(1) DEFAULT 1,
  `media_url` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `content_blocks` (`id`, `section_key`, `title`, `title_ar`, `content`, `content_ar`, `badge`, `order_index`, `is_visible`) VALUES
('block_hero_title', 'hero', 'Titre Principal Hero', 'العنوان الرئيسي للموقع', 'مش خدمات فقط... نتائج تُقاس.', 'مش خدمات فقط... نتائج تُقاس.', 'Digital Marketing & Video Ads', 1, 1),
('block_hero_desc', 'hero', 'Description Hero', 'الوصف التعريفي للوكالة', 'نساعدك على تطوير مشروعك، جذب الحرفاء، وزيادة مبيعاتك عبر الحلول الرقمية الحديثة.', 'نساعدك على تطوير مشروعك، جذب الحرفاء، وزيادة مبيعاتك عبر الحلول الرقمية الحديثة.', NULL, 2, 1);

-- --------------------------------------------------------
-- Table: services (Nos 9 Services Officiels)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `title_ar` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `description_ar` TEXT NOT NULL,
  `price_dt` DECIMAL(10,2) NOT NULL,
  `old_price_dt` DECIMAL(10,2) NULL,
  `is_on_demand` TINYINT(1) DEFAULT 0,
  `category` VARCHAR(50) NOT NULL,
  `delivery_time` VARCHAR(50) DEFAULT '48h - 72h',
  `features_json` JSON,
  `image_url` VARCHAR(255) NULL,
  `is_popular` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`id`, `title`, `title_ar`, `slug`, `description`, `description_ar`, `price_dt`, `old_price_dt`, `category`, `delivery_time`, `is_popular`, `sort_order`) VALUES
(1, 'Digital Marketing', 'التسويق الرقمي المتكامل', 'digital-marketing', 'Stratégie marketing globale, génération de leads ciblés et acquisition de nouveaux clients.', 150.00, 200.00, 'marketing', '3 - 5 jours', 1, 1),
(2, 'Sponsoring Facebook & Instagram', 'تمويل إعلانات فيسبوك وانستغرام', 'sponsoring-meta', 'Campagnes publicitaires ultra-ciblées sur Facebook et Instagram avec optimisation du ROI.', 50.00, 75.00, 'ads', '24h - 48h', 1, 2),
(3, 'Montage Vidéo Professionnel', 'مونتاج فيديو احترافي وإعلاني', 'montage-video', 'Édition dynamique pour Reels, TikTok, YouTube et spots publicitaires.', 80.00, 120.00, 'video', '24h - 48h', 1, 3),
(4, 'Création Site Web', 'تصميم وإنشاء مواقع الواب', 'creation-site-web', 'Sites vitrines et e-commerce modernes, ultra-rapides et responsives (Basic 300 DT, Business 500 DT, Premium 800 DT, E-Commerce dès 700 DT).', 300.00, 450.00, 'web', '3 - 7 jours', 1, 4),
(5, 'Création Application Mobile', 'تطوير تطبيقات الهواتف الذكية', 'application-mobile', 'Applications mobiles Android & iOS sur mesure (Basic 500 DT, Business 800 DT, Premium 1200 DT, Cross-Platform dès 1500 DT).', 500.00, 750.00, 'app', '7 - 15 jours', 1, 5),
(6, 'Création Logo', 'تصميم لوجو وهوية بصرية', 'creation-logo', 'Conception de logos distinctifs et charte graphique complète.', 50.00, 90.00, 'design', '24h - 48h', 0, 6),
(7, 'Design Affiche Publicitaire', 'تصميم لافتات وملصقات إعلانية', 'design-affiche', 'Affiches promotionnelles percutantes pour réseaux sociaux et impressions.', 30.00, 45.00, 'design', '24h', 0, 7),
(8, 'Gestion Page Facebook', 'إدارة ومتابعة صفحات فيسبوك', 'gestion-page-facebook', 'Animation complète de votre page avec publications régulières et modération.', 100.00, 140.00, 'social', 'Mensuel', 1, 8),
(9, 'Publicité Digitale', 'إعلانات رقمية متعددة المنصات', 'publicite-digitale', 'Campagnes omnicanales Google Ads, TikTok Ads et YouTube.', 120.00, 180.00, 'ads', '48h', 0, 9),
(10, 'Rayen Shop Store — Kick Growth Premium', 'Rayen Shop Store — باقة Kick Growth Premium', 'rayen-shop-kick-growth', 'Pack mensuel exclusif pour streamers : chaîne Kick clé en main, OBS + Scenes + Overlays, 30 jours de contenu, clips TikTok/Reels/Shorts et stratégie de croissance.', 500.00, 750.00, 'video', 'Abonnement mensuel', 1, 10),
(11, 'Pack Combo Site Web + Application', 'باقة موقع إلكتروني + تطبيق جوال', 'combo-site-application', 'Solution complète d\'envergure : Votre Site Web professionnel + Votre Application Mobile (Android & iOS) synchronisés.', 1500.00, 2200.00, 'web', '15 - 20 jours', 1, 11);

-- --------------------------------------------------------
-- Table: prices (Packages & Tarifs Fixes)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `prices`;
CREATE TABLE `prices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `plan_name` VARCHAR(100) NOT NULL,
  `plan_name_ar` VARCHAR(100) NOT NULL,
  `price_dt` DECIMAL(10,2) NOT NULL,
  `old_price_dt` DECIMAL(10,2) NULL,
  `billing_cycle` VARCHAR(50) DEFAULT 'Par projet',
  `badge` VARCHAR(50) NULL,
  `category` VARCHAR(50) DEFAULT 'starter',
  `description` TEXT,
  `features_json` JSON,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `prices` (`id`, `plan_name`, `plan_name_ar`, `price_dt`, `old_price_dt`, `billing_cycle`, `badge`, `category`, `description`, `is_featured`) VALUES
(1, 'Rayen Shop Store — Kick Growth Premium', 'Rayen Shop Store — باقة Kick Growth Premium', 500.00, 750.00, '500 د.ت / شهر', 'Kick Growth Premium 🟢', 'kick', 'الحزمة المتكاملة لصناع المحتوى والستريمرز: بناء وتكبير قناة Kick مع إنتاج الـClips وخطة 30 يوم من المحتوى.', 1),
(2, 'Site Web Basic', 'موقع إلكتروني Basic', 300.00, 400.00, '300 د.ت', 'Basic 🟢', 'web', 'موقع إلكتروني تعريفي حديث وأنيق مصمم لعرض خدماتك وجلب الحرفاء في صفاقس وتونس.', 0),
(3, 'Site Web Business', 'موقع إلكتروني Business', 500.00, 700.00, '500 د.ت', 'Business 🔵', 'web', 'موقع أعمال متقدم ومتكامل للشركات والمؤسسات مع لوحة تحكم ديناميكية لإدارة المحتوى.', 1),
(4, 'Site Web Premium', 'موقع إلكتروني Premium', 800.00, 1150.00, '800 د.ت', 'Premium 🔴', 'web', 'موقع فخم بمستوى الشركات العالمية بتصميم 3D متطور وتجربة مستخدم فاخرة.', 0),
(5, 'Boutique E-Commerce', 'متجر إلكتروني متكامل', 700.00, 950.00, 'من 700 د.ت', 'E-Commerce 🛒', 'web', 'متجر إلكتروني متكامل لبيع منتجاتك عبر الإنترنت مع سلة الشراء وتتبع الطلبات.', 1),
(6, 'Application Mobile Basic', 'تطبيق موبايل Basic', 500.00, 700.00, '500 د.ت', 'Basic 🟢', 'app', 'تطبيق موبايل خفيف وسريع لعرض الخدمات والمنتجات والتواصل الفوري مع الزبائن.', 0),
(7, 'Application Mobile Business', 'تطبيق موبايل Business', 800.00, 1100.00, '800 د.ت', 'Business 🔵', 'app', 'تطبيق متطور للشركات والمشاريع مع نظام الحسابات وقاعدة بيانات سحابية.', 1),
(8, 'Application Mobile Premium', 'تطبيق موبايل Premium', 1200.00, 1600.00, '1,200 د.ت', 'Premium 🔴', 'app', 'تطبيق متكامل بمواصفات عالية مع أنظمة التتبع المباشر وأعلى درجات الأمان.', 0),
(9, 'Application Android + iPhone', 'تطبيق Android + iPhone موحد', 1500.00, 2000.00, 'من 1,500 د.ت', 'Cross-Platform 📱', 'app', 'تطبيق بنظام Cross-Platform يعمل بكفاءة تامة على كل هواتف Android وأجهزة iPhone (iOS).', 1),
(10, 'Pack Combo Site + Application', 'باقة موقع إلكتروني + تطبيق', 1500.00, 2200.00, 'من 1,500 د.ت', 'Pack Combo VIP ⭐', 'combo', 'الحل الرقمي الشامل: موقع إلكتروني احترافي + تطبيق هاتف ذكي متزامنان معاً مع توفير استثنائي.', 1),
(11, 'Pack Starter Affiche', 'باقة البداية (تصميم إعلاني)', 30.00, 45.00, '30 د.ت', '30 DT', 'starter', 'تصميم بوستر إعلاني احترافي للمنتج أو العرض لنشره على منصات التواصل.', 0),
(12, 'Pack Boost Social & Logo', 'باقة الانطلاق (سبونسورينغ أو لوجو)', 50.00, 75.00, '500 د.ت', '50 DT', 'starter', 'إطلاق حملة ممولة أو تصميم لوجو احترافي لعلامتك التجارية.', 0),
(13, 'Pack Croissance Pro', 'باقة النمو الاحترافي (فيديو + تمويل)', 100.00, 150.00, '100 د.ت', '100 DT', 'starter', 'مونتاج فيديو إعلاني تفاعلي + إدارة إعلان ممول مع استهداف دقيق.', 0),
(14, 'Pack Visibilité Plus', 'باقة الظهور الشامل', 150.00, 220.00, '150 د.ت', '150 DT', 'starter', 'استراتيجية رقمية متعددة القنوات تشمل الفيديوهات والتصاميم وإدارة الحملات.', 0),
(15, 'Pack Agence Elite', 'باقة النخبة المتكاملة', 250.00, 380.00, '250 د.ت', '250 DT', 'starter', 'حزمة تسويق وهوية شاملة 360 درجة للشركات وأصحاب المشاريع.', 0);

-- --------------------------------------------------------
-- Table: clients
-- --------------------------------------------------------
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `city` VARCHAR(50) DEFAULT 'Sfax',
  `company_name` VARCHAR(100) NULL,
  `total_orders` INT DEFAULT 0,
  `total_spent_dt` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_order_at` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `clients` (`id`, `full_name`, `phone`, `email`, `city`, `total_orders`, `total_spent_dt`) VALUES
('1', 'Ahmed Ben Salem', '+216 98 123 456', 'ahmed.bensalem@gmail.com', 'Sfax', 2, 200.00),
('2', 'Sonia Louati', '+216 24 555 888', 'sonia.louati@outlook.com', 'Sfax', 1, 130.00),
('3', 'Karim Drira', '+216 52 333 444', 'karim.drira@gmail.com', 'Tunis', 1, 250.00),
('4', 'Amira Karray', '+216 29 777 111', 'amira.karray@yahoo.fr', 'Sfax', 1, 50.00);

-- --------------------------------------------------------
-- Table: orders (Commandes avec Suivi Réel)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(20) NOT NULL UNIQUE,
  `client_id` INT NULL,
  `client_name` VARCHAR(100) NOT NULL,
  `client_phone` VARCHAR(30) NOT NULL,
  `client_email` VARCHAR(100) NULL,
  `service_id` INT NULL,
  `service_title` VARCHAR(100) NOT NULL,
  `price_dt` DECIMAL(10,2) NOT NULL,
  `discount_dt` DECIMAL(10,2) DEFAULT 0.00,
  `total_dt` DECIMAL(10,2) NOT NULL,
  `details` TEXT,
  `status` ENUM('en_attente', 'en_cours', 'validee', 'livree', 'annulee') DEFAULT 'en_attente',
  `payment_status` ENUM('non_paye', 'acompte_recu', 'paye') DEFAULT 'non_paye',
  `promo_code_used` VARCHAR(50) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`id`, `order_code`, `client_name`, `client_phone`, `service_title`, `price_dt`, `total_dt`, `status`, `payment_status`) VALUES
(1, 'RMD-2026-001', 'Ahmed Ben Salem', '+216 98 123 456', 'Gestion Page Facebook', 100.00, 100.00, 'en_cours', 'paye'),
(2, 'RMD-2026-002', 'Sonia Louati', '+216 24 555 888', 'Digital Marketing', 150.00, 130.00, 'validee', 'acompte_recu'),
(3, 'RMD-2026-003', 'Karim Drira', '+216 52 333 444', 'Création Site Web', 250.00, 250.00, 'en_attente', 'non_paye');

-- --------------------------------------------------------
-- Table: messages (Formulaire de Contact)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_name` VARCHAR(100) NOT NULL,
  `sender_phone` VARCHAR(30) NOT NULL,
  `sender_email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(150) DEFAULT 'Demande d\'information',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: portfolio (Galerie des Réalisations)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `portfolio`;
CREATE TABLE `portfolio` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `client_name` VARCHAR(100) NOT NULL,
  `category` ENUM('video', 'sponsoring', 'logo', 'affiche', 'web', 'app') NOT NULL,
  `description` TEXT,
  `media_url` VARCHAR(255) NOT NULL,
  `results_metric` VARCHAR(100) NULL,
  `is_featured` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `portfolio` (`id`, `title`, `client_name`, `category`, `description`, `media_url`, `results_metric`) VALUES
(1, 'Spot Publicitaire Vidéo - Restaurant Le Gourmet', 'Le Gourmet Sfax', 'video', 'Montage dynamique 9:16 avec sound design percutant pour campagne Reels.', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', '185K Vues & +40% Résas'),
(2, 'Campagne Meta Ads Haute Conversion', 'Boutique Bella Moda', 'sponsoring', 'Génération de 420 commandes directes via WhatsApp.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8', '+240% Ventes');

-- --------------------------------------------------------
-- Table: promotions (Codes Promos)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('percentage', 'fixed_dt') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_dt` DECIMAL(10,2) DEFAULT 0.00,
  `valid_until` DATE NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `promotions` (`id`, `code`, `discount_type`, `discount_value`, `min_order_dt`, `valid_until`) VALUES
(1, 'SFAX2026', 'percentage', 20.00, 50.00, '2026-12-31'),
(2, 'BOOST50', 'fixed_dt', 50.00, 200.00, '2026-12-31');

COMMIT;
