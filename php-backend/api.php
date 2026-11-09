<?php
/**
 * RAYEN MASMOUDI DIGITAL - Contrôleur API REST PHP 8+
 * Gère les requêtes CRUD pour les services, prix, commandes, clients, messages,
 * ainsi que le nouveau système d'annonces (Ads), approbations, horaires, CMS et sécurité.
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Récupération des données du corps de la requête JSON
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

    // ----------------------------------------------------
    // ADS MANAGEMENT & APPROVAL SYSTEM
    // ----------------------------------------------------
    case 'ads':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM ads ORDER BY created_at DESC");
            $ads = $stmt->fetchAll();
            foreach ($ads as &$a) {
                $a['images'] = json_decode($a['images_json'] ?? '[]', true);
                $a['custom_elements'] = json_decode($a['custom_elements_json'] ?? '[]', true);
            }
            echo json_encode(['success' => true, 'ads' => $ads], JSON_UNESCAPED_UNICODE);
        } elseif ($method === 'POST') {
            $title = sanitizeInput($input['title'] ?? '');
            $advName = sanitizeInput($input['advertiser_name'] ?? '');
            $advPhone = sanitizeInput($input['advertiser_phone'] ?? '');

            if (empty($title) || empty($advName) || empty($advPhone)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Champs obligatoires manquants']);
                exit();
            }

            $stmt = $pdo->prepare("INSERT INTO ads (title, title_ar, slug, advertiser_name, advertiser_phone, advertiser_email, description, description_ar, price_dt, category, images_json, video_url, status, is_published, is_paused, start_date, end_date, scheduled_publish_time, custom_elements_json, latitude, longitude, map_address, map_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $title,
                $input['title_ar'] ?? $title,
                strtolower(str_replace(' ', '-', $title)),
                $advName,
                $advPhone,
                $input['advertiser_email'] ?? '',
                $input['description'] ?? '',
                $input['description_ar'] ?? '',
                $input['price_dt'] ?? 50.0,
                $input['category'] ?? 'marketing',
                json_encode($input['images'] ?? []),
                $input['video_url'] ?? '',
                $input['status'] ?? 'pending',
                $input['is_published'] ? 1 : 0,
                $input['is_paused'] ? 1 : 0,
                $input['start_date'] ?? date('Y-m-d'),
                $input['end_date'] ?? date('Y-m-d', strtotime('+30 days')),
                $input['scheduled_publish_time'] ?? null,
                json_encode($input['custom_elements'] ?? []),
                $input['latitude'] ?? 34.7406,
                $input['longitude'] ?? 10.7603,
                $input['map_address'] ?? 'Sfax, Tunisie',
                $input['map_enabled'] ? 1 : 0
            ]);

            $adId = $pdo->lastInsertId();

            // Créer une notification automatique
            $nStmt = $pdo->prepare("INSERT INTO notifications (recipient_name, recipient_phone, title, message, type, ad_id) VALUES (?, ?, 'Demande d\'annonce enregistrée', ?, 'ad_status', ?)");
            $nStmt->execute([$advName, $advPhone, "Votre annonce '$title' est en cours d'examen.", $adId]);

            echo json_encode(['success' => true, 'id' => $adId, 'message' => 'Annonce enregistrée']);
        }
        break;

    // Changement de statut (Pending -> Accepted / Rejected)
    case 'ad_status':
        if ($method === 'PUT' || $method === 'POST') {
            $adId = (int)($input['id'] ?? $_GET['id'] ?? 0);
            $newStatus = sanitizeInput($input['status'] ?? '');
            $rejectionReason = sanitizeInput($input['rejection_reason'] ?? '');

            if (!in_array($newStatus, ['pending', 'accepted', 'rejected'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Statut invalide']);
                exit();
            }

            $stmt = $pdo->prepare("UPDATE ads SET status = ?, rejection_reason = ?, is_published = ? WHERE id = ?");
            $isPublished = ($newStatus === 'accepted') ? 1 : 0;
            $stmt->execute([$newStatus, $rejectionReason ?: null, $isPublished, $adId]);

            // Notification pour l'annonceur
            $aStmt = $pdo->prepare("SELECT title, advertiser_name, advertiser_phone FROM ads WHERE id = ?");
            $aStmt->execute([$adId]);
            $ad = $aStmt->fetch();

            if ($ad) {
                $notifTitle = ($newStatus === 'accepted') ? 'Annonce Acceptée !' : 'Annonce Refusée';
                $notifMsg = ($newStatus === 'accepted')
                    ? "Votre annonce '{$ad['title']}' a été validée et publiée."
                    : "Votre annonce '{$ad['title']}' a été refusée. Raison : $rejectionReason";

                $nStmt = $pdo->prepare("INSERT INTO notifications (recipient_name, recipient_phone, title, message, type, ad_id) VALUES (?, ?, ?, ?, 'ad_status', ?)");
                $nStmt->execute([$ad['advertiser_name'], $ad['advertiser_phone'], $notifTitle, $notifMsg, $adId]);
            }

            echo json_encode(['success' => true, 'message' => "Statut mis à jour : $newStatus"]);
        }
        break;

    // ----------------------------------------------------
    // NOTIFICATIONS
    // ----------------------------------------------------
    case 'notifications':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50");
            echo json_encode(['success' => true, 'notifications' => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
        }
        break;

    // ----------------------------------------------------
    // HORAIRES & DISPONIBILITÉ
    // ----------------------------------------------------
    case 'working_hours':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM working_hours ORDER BY sort_order ASC");
            echo json_encode(['success' => true, 'days' => $stmt->fetchAll()]);
        }
        break;

    // ----------------------------------------------------
    // CMS CONTENT BLOCKS
    // ----------------------------------------------------
    case 'content_blocks':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM content_blocks ORDER BY order_index ASC");
            echo json_encode(['success' => true, 'content_blocks' => $stmt->fetchAll()]);
        }
        break;

    // ----------------------------------------------------
    // CHANGEMENT MOT DE PASSE ADMIN
    // ----------------------------------------------------
    case 'change_password':
        if ($method === 'POST') {
            $oldPass = $input['old_password'] ?? '';
            $newPass = $input['new_password'] ?? '';

            if (empty($oldPass) || empty($newPass) || strlen($newPass) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nouveau mot de passe invalide (min 6 caractères)']);
                exit();
            }

            $stmt = $pdo->query("SELECT * FROM admins WHERE username = 'admin' LIMIT 1");
            $admin = $stmt->fetch();

            if ($admin && password_verify($oldPass, $admin['password'])) {
                $newHash = password_hash($newPass, PASSWORD_BCRYPT);
                $uStmt = $pdo->prepare("UPDATE admins SET password = ?, session_version = session_version + 1, last_password_change = NOW() WHERE id = ?");
                $uStmt->execute([$newHash, $admin['id']]);
                echo json_encode(['success' => true, 'message' => 'Mot de passe modifié avec succès']);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Ancien mot de passe incorrect']);
            }
        }
        break;

    // ----------------------------------------------------
    // SERVICES, PRIX, COMMANDES, MESSAGES (EXISTANTS)
    // ----------------------------------------------------
    case 'services':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
            $services = $stmt->fetchAll();
            foreach ($services as &$s) {
                $s['features'] = json_decode($s['features_json'] ?? '[]', true);
            }
            echo json_encode(['success' => true, 'data' => $services], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'prices':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM prices WHERE is_active = 1 ORDER BY price_dt ASC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()], JSON_UNESCAPED_UNICODE);
        }
        break;

    case 'orders':
        if ($method === 'POST') {
            $clientName  = sanitizeInput($input['client_name'] ?? '');
            $clientPhone = sanitizeInput($input['client_phone'] ?? '');
            $serviceName = sanitizeInput($input['service_title'] ?? 'Service sur mesure');
            $priceDt     = (float)($input['price_dt'] ?? 0.0);
            $orderCode   = 'RMD-' . date('Y') . '-' . strtoupper(substr(uniqid(), -4));

            $oStmt = $pdo->prepare("INSERT INTO orders (order_code, client_name, client_phone, service_title, price_dt, total_dt, status) VALUES (?, ?, ?, ?, ?, ?, 'en_attente')");
            $oStmt->execute([$orderCode, $clientName, $clientPhone, $serviceName, $priceDt, $priceDt]);

            echo json_encode(['success' => true, 'order_code' => $orderCode, 'total_dt' => $priceDt]);
        }
        break;

    default:
        echo json_encode([
            'agency' => 'RAYEN MASMOUDI DIGITAL',
            'status' => 'API PHP 8+ PDO Active & Ready',
            'city'   => 'Sfax, Tunisie',
            'phone'  => '+216 44 203 500'
        ]);
        break;
}
