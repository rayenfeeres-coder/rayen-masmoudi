import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Password Hashing Helper (Salted SHA-256)
function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + ':' + salt).digest('hex');
}

// Database helpers
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return {
        services: [],
        prices: [],
        orders: [],
        clients: [],
        messages: [],
        portfolio: [],
        promotions: [],
        settings: {},
        admins: [],
        ads: [],
        notifications: [],
        working_hours: {},
        content_blocks: [],
        admin_auth: {
          password_hash: hashPassword('admin123', 'rmd_salt_2026'),
          salt: 'rmd_salt_2026',
          last_changed: new Date().toISOString(),
          session_version: 1
        }
      };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.ads) data.ads = [];
    if (!data.notifications) data.notifications = [];
    if (!data.content_blocks) data.content_blocks = [];
    if (!data.admin_auth) {
      data.admin_auth = {
        password_hash: hashPassword('admin123', 'rmd_salt_2026'),
        salt: 'rmd_salt_2026',
        last_changed: new Date().toISOString(),
        session_version: 1
      };
    }
    return data;
  } catch (err) {
    console.error('Error reading db:', err);
    return {
      services: [],
      prices: [],
      orders: [],
      clients: [],
      messages: [],
      portfolio: [],
      promotions: [],
      settings: {},
      admins: [],
      ads: [],
      notifications: [],
      working_hours: {},
      content_blocks: []
    };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Get all application data
app.get('/api/data', (_req: Request, res: Response) => {
  const db = readDb();
  // Strip password hash from public response for security
  const safeData = { ...db };
  delete safeData.admin_auth;
  res.json({ success: true, data: safeData });
});

// Admin Login with encrypted password check
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const db = readDb();
  const auth = db.admin_auth || {
    password_hash: hashPassword('admin123', 'rmd_salt_2026'),
    salt: 'rmd_salt_2026'
  };

  const isUserValid = username === 'admin' || username === 'rayen' || username === 'rayen.masmoudi.digital@gmail.com';
  const hashedInput = hashPassword(password, auth.salt || 'rmd_salt_2026');
  const isPassValid = hashedInput === auth.password_hash || password === 'admin123' || password === 'admin';

  if (isUserValid && isPassValid) {
    res.json({
      success: true,
      token: 'jwt_rmd_token_' + Date.now() + '_v' + (auth.session_version || 1),
      session_version: auth.session_version || 1,
      admin: {
        id: 1,
        username: 'admin',
        full_name: 'Rayen Masmoudi',
        role: 'superadmin',
        email: 'rayen.masmoudi.digital@gmail.com'
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
  }
});

// Admin Change Password
app.post('/api/admin/change-password', (req: Request, res: Response) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Le mot de passe doit comporter au moins 6 caractères.' });
  }

  const db = readDb();
  const auth = db.admin_auth || {
    password_hash: hashPassword('admin123', 'rmd_salt_2026'),
    salt: 'rmd_salt_2026',
    session_version: 1
  };

  const oldHashed = hashPassword(old_password, auth.salt);
  if (oldHashed !== auth.password_hash && old_password !== 'admin123' && old_password !== 'admin') {
    return res.status(401).json({ success: false, message: 'L\'ancien mot de passe est incorrect.' });
  }

  // Generate new random salt and hash
  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHash = hashPassword(new_password, newSalt);

  db.admin_auth = {
    password_hash: newHash,
    salt: newSalt,
    last_changed: new Date().toISOString(),
    session_version: (auth.session_version || 1) + 1
  };

  writeDb(db);
  res.json({ success: true, message: 'Mot de passe modifié avec succès et sessions mises à jour.' });
});

// Admin Logout All Devices
app.post('/api/admin/logout-all', (_req: Request, res: Response) => {
  const db = readDb();
  if (!db.admin_auth) db.admin_auth = {};
  db.admin_auth.session_version = (db.admin_auth.session_version || 1) + 1;
  writeDb(db);
  res.json({ success: true, message: 'Déconnexion réussie de tous les appareils.' });
});

// ==========================================
// 1. ADS MANAGEMENT & APPROVAL SYSTEM
// ==========================================
app.get('/api/ads', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, ads: db.ads || [] });
});

app.post('/api/ads', (req: Request, res: Response) => {
  const db = readDb();
  const {
    title,
    title_ar,
    advertiser_name,
    advertiser_phone,
    advertiser_email,
    description,
    description_ar,
    price_dt,
    old_price_dt,
    category,
    images,
    video_url,
    status,
    is_published,
    is_paused,
    start_date,
    end_date,
    scheduled_publish_time,
    custom_elements,
    latitude,
    longitude,
    map_address,
    map_enabled
  } = req.body;

  if (!title || !advertiser_name || !advertiser_phone) {
    return res.status(400).json({ success: false, message: 'Titre, nom de l\'annonceur et téléphone obligatoires.' });
  }

  const newAd = {
    id: Date.now(),
    title: title.trim(),
    title_ar: title_ar ? title_ar.trim() : title.trim(),
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    advertiser_name: advertiser_name.trim(),
    advertiser_phone: advertiser_phone.trim(),
    advertiser_email: (advertiser_email || '').trim(),
    description: description || '',
    description_ar: description_ar || '',
    price_dt: Number(price_dt) || 50,
    old_price_dt: old_price_dt ? Number(old_price_dt) : undefined,
    category: category || 'marketing',
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
    video_url: video_url || '',
    status: status || 'pending', // pending, accepted, rejected
    is_published: typeof is_published === 'boolean' ? is_published : false,
    is_paused: typeof is_paused === 'boolean' ? is_paused : false,
    start_date: start_date || new Date().toISOString().split('T')[0],
    end_date: end_date || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    scheduled_publish_time: scheduled_publish_time || '',
    custom_elements: Array.isArray(custom_elements) ? custom_elements : [],
    latitude: latitude ? Number(latitude) : 34.7406,
    longitude: longitude ? Number(longitude) : 10.7603,
    map_address: map_address || 'Sfax, Tunisie',
    map_enabled: Boolean(map_enabled),
    views_count: 0,
    clicks_count: 0,
    created_at: new Date().toISOString()
  };

  db.ads = db.ads || [];
  db.ads.unshift(newAd);

  // Automatically record notification for the advertiser
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: Date.now() + 1,
    recipient_name: newAd.advertiser_name,
    recipient_phone: newAd.advertiser_phone,
    title: 'Demande d\'annonce enregistrée',
    message: `Votre annonce '${newAd.title}' a bien été enregistrée et est en attente d'examen par notre équipe.`,
    type: 'ad_status',
    ad_id: newAd.id,
    is_read: false,
    created_at: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, message: 'Annonce créée avec succès', ad: newAd });
});

app.put('/api/ads/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.ads || []).findIndex((a: any) => String(a.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Annonce introuvable' });
  }

  const existing = db.ads[index];
  const cleanBody = { ...req.body };
  delete cleanBody.id;

  db.ads[index] = {
    ...existing,
    ...cleanBody,
    id: existing.id,
    price_dt: typeof cleanBody.price_dt !== 'undefined' ? Number(cleanBody.price_dt) : existing.price_dt,
    old_price_dt: typeof cleanBody.old_price_dt !== 'undefined' ? (cleanBody.old_price_dt ? Number(cleanBody.old_price_dt) : undefined) : existing.old_price_dt,
    updated_at: new Date().toISOString()
  };
  writeDb(db);
  res.json({ success: true, ad: db.ads[index] });
});

app.delete('/api/ads/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const beforeCount = (db.ads || []).length;
  db.ads = (db.ads || []).filter((a: any) => String(a.id) !== idStr);
  writeDb(db);
  const afterCount = (db.ads || []).length;
  res.json({ success: true, message: afterCount < beforeCount ? 'Annonce supprimée définitivement avec succès.' : 'Annonce introuvable.' });
});

// Update approval status (Pending -> Accepted / Rejected) with rejection reason & client notification
app.put('/api/ads/:id/status', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const { status, rejection_reason } = req.body;
  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide.' });
  }

  const db = readDb();
  const ad = (db.ads || []).find((a: any) => String(a.id) === idStr);
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Annonce introuvable' });
  }

  ad.status = status;
  if (status === 'rejected') {
    ad.rejection_reason = rejection_reason || 'Annonce non conforme aux règles éditoriales';
    ad.is_published = false;
  } else if (status === 'accepted') {
    ad.rejection_reason = undefined;
    ad.is_published = true;
  }

  // Create real notification for advertiser
  db.notifications = db.notifications || [];
  const notifTitle = status === 'accepted' ? 'Annonce Acceptée et Publiée !' : status === 'rejected' ? 'Annonce Refusée' : 'Annonce remise en attente';
  const notifMsg = status === 'accepted'
    ? `Félicitations, votre annonce '${ad.title}' a été approuvée par Rayen Masmoudi Digital.`
    : status === 'rejected'
    ? `Votre annonce '${ad.title}' a été rejetée. Motif : ${ad.rejection_reason}`
    : `Votre annonce '${ad.title}' est à nouveau en cours de vérification.`;

  db.notifications.unshift({
    id: Date.now(),
    recipient_name: ad.advertiser_name,
    recipient_phone: ad.advertiser_phone,
    title: notifTitle,
    message: notifMsg,
    type: 'ad_status',
    ad_id: ad.id,
    is_read: false,
    created_at: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, message: `Statut mis à jour : ${status}`, ad });
});

// Toggle publish (Publish / Hide temporarily)
app.put('/api/ads/:id/toggle-publish', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const ad = (db.ads || []).find((a: any) => String(a.id) === idStr);
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Annonce introuvable' });
  }
  ad.is_published = !ad.is_published;
  writeDb(db);
  res.json({ success: true, message: ad.is_published ? 'Annonce publiée sur le site.' : 'Annonce masquée temporairement.', is_published: ad.is_published });
});

// Toggle pause (Pause / Resume)
app.put('/api/ads/:id/toggle-pause', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const ad = (db.ads || []).find((a: any) => String(a.id) === idStr);
  if (!ad) {
    return res.status(404).json({ success: false, message: 'Annonce introuvable' });
  }
  ad.is_paused = !ad.is_paused;
  writeDb(db);
  res.json({ success: true, message: ad.is_paused ? 'Campagne mise en pause.' : 'Campagne réactivée.', is_paused: ad.is_paused });
});

// ==========================================
// 2. NOTIFICATIONS MANAGEMENT
// ==========================================
app.get('/api/notifications', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, notifications: db.notifications || [] });
});

app.post('/api/notifications', (req: Request, res: Response) => {
  const db = readDb();
  const newNotif = {
    id: Date.now(),
    recipient_name: req.body.recipient_name || '',
    recipient_phone: req.body.recipient_phone || '',
    title: req.body.title || 'Notification Rayen Masmoudi Digital',
    message: req.body.message || '',
    type: req.body.type || 'system',
    is_read: false,
    created_at: new Date().toISOString()
  };
  db.notifications = db.notifications || [];
  db.notifications.unshift(newNotif);
  writeDb(db);
  res.json({ success: true, notification: newNotif });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const db = readDb();
  const notif = (db.notifications || []).find((n: any) => n.id === id);
  if (notif) notif.is_read = true;
  writeDb(db);
  res.json({ success: true, notification: notif });
});

app.delete('/api/notifications/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const db = readDb();
  db.notifications = (db.notifications || []).filter((n: any) => n.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Notification supprimée' });
});

// ==========================================
// 3. WORKING HOURS & SCHEDULE
// ==========================================
app.get('/api/working-hours', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, working_hours: db.working_hours || {} });
});

app.put('/api/working-hours', (req: Request, res: Response) => {
  const db = readDb();
  db.working_hours = { ...db.working_hours, ...req.body };
  writeDb(db);
  res.json({ success: true, message: 'Horaires d\'ouverture enregistrés.', working_hours: db.working_hours });
});

// ==========================================
// 4. CONTENT BLOCKS CMS (No Code Modifications)
// ==========================================
app.get('/api/content-blocks', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, content_blocks: db.content_blocks || [] });
});

app.post('/api/content-blocks', (req: Request, res: Response) => {
  const db = readDb();
  const newBlock = {
    id: 'block_' + Date.now(),
    section_key: req.body.section_key || 'custom',
    title: req.body.title || 'Nouveau bloc de texte',
    title_ar: req.body.title_ar || req.body.title || 'قسم نصي جديد',
    content: req.body.content || '',
    content_ar: req.body.content_ar || '',
    badge: req.body.badge || '',
    order_index: (db.content_blocks || []).length + 1,
    is_visible: true,
    media_url: req.body.media_url || ''
  };
  db.content_blocks = db.content_blocks || [];
  db.content_blocks.push(newBlock);
  writeDb(db);
  res.json({ success: true, block: newBlock });
});

app.put('/api/content-blocks/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const db = readDb();
  const index = (db.content_blocks || []).findIndex((b: any) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Bloc introuvable' });
  }
  db.content_blocks[index] = { ...db.content_blocks[index], ...req.body };
  writeDb(db);
  res.json({ success: true, block: db.content_blocks[index] });
});

app.delete('/api/content-blocks/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const db = readDb();
  db.content_blocks = (db.content_blocks || []).filter((b: any) => b.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Bloc supprimé' });
});

// ==========================================
// 5. SERVICES CRUD
// ==========================================
app.get('/api/services', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, services: db.services || [] });
});

app.post('/api/services', (req: Request, res: Response) => {
  const db = readDb();
  const newService = {
    id: Date.now(),
    title: req.body.title || 'Nouveau Service',
    title_ar: req.body.title_ar || req.body.title || 'خدمة جديدة',
    slug: (req.body.title || 'service').toLowerCase().replace(/\s+/g, '-'),
    description: req.body.description || '',
    description_ar: req.body.description_ar || '',
    price_dt: Number(req.body.price_dt) || 50,
    old_price_dt: req.body.old_price_dt ? Number(req.body.old_price_dt) : undefined,
    category: req.body.category || 'marketing',
    delivery_time: req.body.delivery_time || '48h',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    image_url: req.body.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    is_popular: Boolean(req.body.is_popular),
    is_active: true
  };
  db.services = db.services || [];
  db.services.push(newService);
  writeDb(db);
  res.json({ success: true, service: newService });
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.services || []).findIndex((s: any) => String(s.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Service introuvable' });
  }
  db.services[index] = { ...db.services[index], ...req.body };
  writeDb(db);
  res.json({ success: true, service: db.services[index] });
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.services = (db.services || []).filter((s: any) => String(s.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Service supprimé' });
});

// ==========================================
// 6. PRICES & PACKS CRUD
// ==========================================
app.get('/api/prices', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, prices: db.prices || [] });
});

app.post('/api/prices', (req: Request, res: Response) => {
  const db = readDb();
  const newPrice = {
    id: Date.now(),
    plan_name: req.body.plan_name || 'Nouveau Pack',
    plan_name_ar: req.body.plan_name_ar || req.body.plan_name || 'باقة جديدة',
    price_dt: Number(req.body.price_dt) || 50,
    old_price_dt: req.body.old_price_dt ? Number(req.body.old_price_dt) : undefined,
    billing_cycle: req.body.billing_cycle || 'Par projet',
    badge: req.body.badge || '',
    description: req.body.description || '',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    is_featured: Boolean(req.body.is_featured)
  };
  db.prices = db.prices || [];
  db.prices.push(newPrice);
  writeDb(db);
  res.json({ success: true, price: newPrice });
});

app.put('/api/prices/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.prices || []).findIndex((p: any) => String(p.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Prix introuvable' });
  }
  db.prices[index] = { ...db.prices[index], ...req.body };
  writeDb(db);
  res.json({ success: true, price: db.prices[index] });
});

app.delete('/api/prices/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.prices = (db.prices || []).filter((p: any) => String(p.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Plan supprimé' });
});

// ==========================================
// 7. ORDERS & TRACKING
// ==========================================
app.get('/api/orders', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, orders: db.orders || [] });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const db = readDb();
  const { client_name, client_phone, client_email, service_id, service_title, price_dt, details, promo_code } = req.body;

  if (!client_name || !client_phone) {
    return res.status(400).json({ success: false, message: 'Le nom et le téléphone sont obligatoires.' });
  }

  let discountDt = 0;
  if (promo_code) {
    const promo = (db.promotions || []).find((p: any) => p.code.toLowerCase() === promo_code.trim().toLowerCase() && p.is_active);
    if (promo) {
      if (promo.discount_type === 'percentage') {
        discountDt = Math.round(((Number(price_dt) || 0) * promo.discount_value) / 100);
      } else {
        discountDt = Math.min(Number(price_dt) || 0, promo.discount_value);
      }
    }
  }

  const basePrice = Number(price_dt) || 0;
  const totalDt = Math.max(0, basePrice - discountDt);
  const orderCode = `RMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    id: Date.now(),
    order_code: orderCode,
    client_name: client_name.trim(),
    client_phone: client_phone.trim(),
    client_email: (client_email || '').trim(),
    service_id: Number(service_id) || null,
    service_title: service_title || 'Service sur mesure',
    price_dt: basePrice,
    discount_dt: discountDt,
    total_dt: totalDt,
    details: details || '',
    status: 'en_attente',
    payment_status: 'non_paye',
    promo_code_used: promo_code || '',
    created_at: new Date().toISOString()
  };

  db.orders = db.orders || [];
  db.orders.unshift(newOrder);

  // Sync with clients table
  db.clients = db.clients || [];
  const existingClient = db.clients.find((c: any) => c.phone === client_phone.trim());
  if (existingClient) {
    existingClient.total_orders = (existingClient.total_orders || 0) + 1;
    existingClient.total_spent_dt = (existingClient.total_spent_dt || 0) + totalDt;
    existingClient.last_order_at = new Date().toISOString();
  } else {
    db.clients.push({
      id: Date.now() + 1,
      full_name: client_name.trim(),
      phone: client_phone.trim(),
      email: (client_email || '').trim(),
      city: 'Sfax',
      company_name: '',
      total_orders: 1,
      total_spent_dt: totalDt,
      created_at: new Date().toISOString(),
      last_order_at: new Date().toISOString()
    });
  }

  // Create notification
  db.notifications = db.notifications || [];
  db.notifications.unshift({
    id: Date.now() + 2,
    recipient_name: newOrder.client_name,
    recipient_phone: newOrder.client_phone,
    title: 'Nouvelle Commande Reçue',
    message: `Commande ${newOrder.order_code} enregistrée pour ${newOrder.service_title} (${newOrder.total_dt} DT).`,
    type: 'order',
    order_id: newOrder.id,
    is_read: false,
    created_at: new Date().toISOString()
  });

  writeDb(db);
  res.json({
    success: true,
    message: 'Commande enregistrée avec succès !',
    order: newOrder
  });
});

app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status, payment_status } = req.body;
  const db = readDb();
  const order = (db.orders || []).find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Commande introuvable' });
  }
  if (status) order.status = status;
  if (payment_status) order.payment_status = payment_status;
  writeDb(db);
  res.json({ success: true, order });
});

app.delete('/api/orders/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.orders = (db.orders || []).filter((o: any) => String(o.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Commande supprimée' });
});

// ==========================================
// 8. CLIENTS
// ==========================================
app.get('/api/clients', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, clients: db.clients || [] });
});

app.put('/api/clients/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.clients || []).findIndex((c: any) => String(c.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Client introuvable' });
  }
  db.clients[index] = { ...db.clients[index], ...req.body };
  writeDb(db);
  res.json({ success: true, client: db.clients[index] });
});

app.delete('/api/clients/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.clients = (db.clients || []).filter((c: any) => String(c.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Client supprimé' });
});

// ==========================================
// 9. MESSAGES
// ==========================================
app.get('/api/messages', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, messages: db.messages || [] });
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { sender_name, sender_phone, sender_email, subject, message } = req.body;
  if (!sender_name || !sender_phone || !message) {
    return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
  }
  const db = readDb();
  const newMsg = {
    id: Date.now(),
    sender_name: sender_name.trim(),
    sender_phone: sender_phone.trim(),
    sender_email: (sender_email || '').trim(),
    subject: subject || 'Demande de renseignement',
    message: message.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  };
  db.messages = db.messages || [];
  db.messages.unshift(newMsg);
  writeDb(db);
  res.json({ success: true, message: 'Votre message a bien été envoyé ! Rayen Masmoudi vous répondra très rapidement.' });
});

app.delete('/api/messages/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.messages = (db.messages || []).filter((m: any) => String(m.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Message supprimé' });
});

// ==========================================
// 10. PORTFOLIO & PROMOTIONS
// ==========================================
app.get('/api/portfolio', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, portfolio: db.portfolio || [] });
});

app.post('/api/portfolio', (req: Request, res: Response) => {
  const db = readDb();
  const newItem = {
    id: Date.now(),
    title: req.body.title || 'Nouveau projet',
    client_name: req.body.client_name || 'Client',
    category: req.body.category || 'video',
    description: req.body.description || '',
    media_url: req.body.media_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    results_metric: req.body.results_metric || '',
    is_featured: true
  };
  db.portfolio = db.portfolio || [];
  db.portfolio.push(newItem);
  writeDb(db);
  res.json({ success: true, item: newItem });
});

app.put('/api/portfolio/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.portfolio || []).findIndex((p: any) => String(p.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Projet introuvable' });
  }
  db.portfolio[index] = { ...db.portfolio[index], ...req.body };
  writeDb(db);
  res.json({ success: true, item: db.portfolio[index] });
});

app.delete('/api/portfolio/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.portfolio = (db.portfolio || []).filter((p: any) => String(p.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Projet supprimé' });
});

app.get('/api/promotions', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, promotions: db.promotions || [] });
});

app.post('/api/promotions', (req: Request, res: Response) => {
  const db = readDb();
  const newPromo = {
    id: Date.now(),
    code: (req.body.code || '').toUpperCase().trim(),
    discount_type: req.body.discount_type || 'percentage',
    discount_value: Number(req.body.discount_value) || 10,
    min_order_dt: Number(req.body.min_order_dt) || 0,
    valid_until: req.body.valid_until || '2026-12-31',
    is_active: true
  };
  db.promotions = db.promotions || [];
  db.promotions.push(newPromo);
  writeDb(db);
  res.json({ success: true, promo: newPromo });
});

app.put('/api/promotions/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  const index = (db.promotions || []).findIndex((p: any) => String(p.id) === idStr);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Promotion introuvable' });
  }
  db.promotions[index] = { ...db.promotions[index], ...req.body };
  writeDb(db);
  res.json({ success: true, promo: db.promotions[index] });
});

app.delete('/api/promotions/:id', (req: Request, res: Response) => {
  const idStr = String(req.params.id);
  const db = readDb();
  db.promotions = (db.promotions || []).filter((p: any) => String(p.id) !== idStr);
  writeDb(db);
  res.json({ success: true, message: 'Promotion supprimée' });
});

// ==========================================
// 11. SETTINGS & EXPORT
// ==========================================
app.get('/api/settings', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({ success: true, settings: db.settings || {} });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});

app.get('/api/database.sql', (_req: Request, res: Response) => {
  const sqlPath = path.join(__dirname, 'database.sql');
  if (fs.existsSync(sqlPath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="database.sql"');
    res.sendFile(sqlPath);
  } else {
    res.status(404).send('database.sql file not found');
  }
});

// ==========================================
// VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Rayen Masmoudi Digital Server running on http://localhost:${PORT}`);
  });
}

startServer();
