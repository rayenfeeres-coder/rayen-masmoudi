# 🚀 RAYEN MASMOUDI DIGITAL - Guide de Déploiement XAMPP

Ce projet est prêt à être exécuté localement avec **XAMPP (Apache + MySQL / MariaDB + PHP 8+)**.

---

## 📋 Prérequis

1. Téléchargez et installez **XAMPP** avec **PHP 8.0+** et **MySQL**.
2. Lancez le **XAMPP Control Panel** et démarrez les services :
   - `Apache` -> Cliquez sur **Start**
   - `MySQL` -> Cliquez sur **Start**

---

## 🗄️ Étape 1 : Importer la Base de Données dans phpMyAdmin

1. Ouvrez votre navigateur et accédez à : `http://localhost/phpmyadmin`
2. Cliquez sur l'onglet **Importer** (Import) dans le menu supérieur.
3. Cliquez sur **Choisir un fichier** et sélectionnez le fichier `database.sql` situé à la racine du projet.
4. Cliquez sur le bouton **Exécuter** (Go) en bas de page.
5. La base de données `rayen_masmoudi_digital` sera créée avec toutes les tables :
   - `admins` (identifiants d'accès)
   - `services` (les 9 services officiels avec prix en DT)
   - `prices` (packs & forfaits en DT)
   - `orders` (commandes en attente et terminées)
   - `clients` (annuaire des clients)
   - `messages` (messages du formulaire de contact)
   - `portfolio` (réalisations et métriques de performance)
   - `promotions` (codes promos)
   - `settings` (coordonnées, Sfax, Tunisie, téléphone, WhatsApp)

---

## 💻 Étape 2 : Déploiement des Fichiers dans htdocs

1. Copiez le dossier du projet dans le répertoire `htdocs` de votre installation XAMPP :
   ```
   C:\xampp\htdocs\rayen-masmoudi-digital
   ```
2. Vérifiez la configuration dans `php-backend/db.php` :
   - Hôte : `localhost`
   - Utilisateur : `root`
   - Mot de passe : `""` (vide par défaut sous XAMPP)
   - Base de données : `rayen_masmoudi_digital`

---

## 🔐 Identifiants d'Accès Administrateur par Défaut

- **Lien du tableau de bord** : `http://localhost:3000/admin` (ou `/admin` dans l'application)
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `admin123`
- **Email** : `rayen.masmoudi.digital@gmail.com`

---

## 📞 Support & Contact

- **Agence** : RAYEN MASMOUDI DIGITAL
- **Ville** : Sfax, Tunisie
- **Téléphone / WhatsApp** : +216 44 203 500
- **Email** : rayen.masmoudi.digital@gmail.com
