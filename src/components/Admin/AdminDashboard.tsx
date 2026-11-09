import React, { useState, useEffect } from 'react';
import {
  AppData,
  Order,
  Service,
  PricePlan,
  Client,
  Message,
  PortfolioItem,
  Promotion,
  Settings,
  OrderStatus,
  PaymentStatus,
  AdItem,
  AdApprovalStatus,
  NotificationItem,
  WorkingHoursConfig,
  ContentBlock,
  AdCustomElement,
} from '../../types';
import { api } from '../../services/api';
import {
  LayoutDashboard,
  Megaphone,
  CheckCircle2,
  Clock,
  KeyRound,
  FileText,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Percent,
  UserCheck,
  Settings as SettingsIcon,
  Bell,
  Database,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Play,
  Pause,
  XCircle,
  Download,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  MapPin,
  Video,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar,
  Upload,
  X,
  ExternalLink,
  Film,
} from 'lucide-react';

export const SFAX_DISTRICTS = [
  { name: 'Sfax - Centre-Ville / Bab Bhar', address: 'Centre-Ville, Bab Bhar, Sfax', lat: 34.7406, lng: 10.7603 },
  { name: 'Sfax - El Jadida / Nouvelle Ville', address: 'Sfax El Jadida, Sfax', lat: 34.7350, lng: 10.7550 },
  { name: 'Sfax - Route de Téniour (Km 0 - 5)', address: 'Route de Téniour, Sfax', lat: 34.7600, lng: 10.7450 },
  { name: 'Sfax - Route de Gremda (Km 0 - 6)', address: 'Route de Gremda, Sfax', lat: 34.7500, lng: 10.7300 },
  { name: 'Sfax - Route de l\'Aéroport / Sokra', address: 'Route de l\'Aéroport, Sfax', lat: 34.7300, lng: 10.7100 },
  { name: 'Sfax - Route de Tunis (Km 0 - 7)', address: 'Route de Tunis, Sfax', lat: 34.7700, lng: 10.7500 },
  { name: 'Sfax - Route de Gabès / Port', address: 'Route de Gabès, Sfax', lat: 34.7100, lng: 10.7400 },
  { name: 'Sfax - Route de Menzel Chaker', address: 'Route de Menzel Chaker, Sfax', lat: 34.7350, lng: 10.7200 },
  { name: 'Sfax - Sakiet Ezzit (Technopôle)', address: 'Sakiet Ezzit, Sfax', lat: 34.8000, lng: 10.7700 },
  { name: 'Sfax - Sakiet Eddaïer', address: 'Sakiet Eddaïer, Sfax', lat: 34.7800, lng: 10.8000 },
  { name: 'Sfax - Sidi Mansour / Plage', address: 'Sidi Mansour, Sfax', lat: 34.8100, lng: 10.8600 },
  { name: 'Sfax - Thyna / Zone Industrielle', address: 'Thyna, Sfax', lat: 34.6600, lng: 10.6800 },
];

export function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return null;
}

interface AdminDashboardProps {
  data: AppData;
  onRefreshData: () => Promise<void>;
  onCloseAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onRefreshData,
  onCloseAdmin,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('rmd_admin_auth') === 'true';
  });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active module tab
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'ads'
    | 'ad_approvals'
    | 'schedule'
    | 'security'
    | 'cms'
    | 'services'
    | 'prices'
    | 'orders'
    | 'clients'
    | 'messages'
    | 'portfolio'
    | 'promotions'
    | 'notifications'
    | 'settings'
    | 'xampp'
  >('overview');

  // Action status message
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Search and filter states
  const [adSearch, setAdSearch] = useState('');
  const [adFilterStatus, setAdFilterStatus] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals and editing states
  const [editingAd, setEditingAd] = useState<Partial<AdItem> | null>(null);
  const [reviewingAd, setReviewingAd] = useState<AdItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingPrice, setEditingPrice] = useState<Partial<PricePlan> | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<Partial<PortfolioItem> | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Partial<Promotion> | null>(null);
  const [editingBlock, setEditingBlock] = useState<Partial<ContentBlock> | null>(null);

  // In-app Confirmation Modal state (prevents iframe alert/confirm issues)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Security Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityNotice, setSecurityNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Working Hours Form state
  const [workingHoursForm, setWorkingHoursForm] = useState<WorkingHoursConfig>(
    data.working_hours || {
      timezone: 'Africa/Tunis',
      schedule_note: 'Ouvert du Lundi au Samedi.',
      schedule_note_ar: 'مفتوح من الاثنين إلى السبت.',
      emergency_support_247: true,
      ramadan_hours: '09:00 - 15:30',
      days: [],
    }
  );

  useEffect(() => {
    if (data.working_hours) {
      setWorkingHoursForm(data.working_hours);
    }
  }, [data.working_hours]);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Settings>(data.settings);
  useEffect(() => {
    if (data.settings) setSettingsForm(data.settings);
  }, [data.settings]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await api.login(username, password);
      if (res.success) {
        setIsAuthenticated(true);
        localStorage.setItem('rmd_admin_auth', 'true');
      } else {
        setLoginError(res.message || 'Identifiants invalides');
      }
    } catch {
      if ((username === 'admin' || username === 'rayen') && password === 'admin123') {
        setIsAuthenticated(true);
        localStorage.setItem('rmd_admin_auth', 'true');
      } else {
        setLoginError('Nom d\'utilisateur ou mot de passe incorrect.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rmd_admin_auth');
  };

  // ==========================================
  // ADS CRUD & CONTROLS
  // ==========================================
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    try {
      if (editingAd.id) {
        await api.updateAd(editingAd.id, editingAd);
        showNotice('Annonce mise à jour avec succès.');
      } else {
        await api.createAd(editingAd);
        showNotice('Nouvelle annonce créée et enregistrée.');
      }
      setEditingAd(null);
      await onRefreshData();
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingAd) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setEditingAd((prev) => {
            if (!prev) return prev;
            const currentImages = prev.images || [];
            return { ...prev, images: [...currentImages, dataUrl] };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!editingAd) return;
    const currentImages = editingAd.images || [];
    setEditingAd({
      ...editingAd,
      images: currentImages.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddCustomElement = () => {
    if (!editingAd) return;
    const current = editingAd.custom_elements || [];
    setEditingAd({
      ...editingAd,
      custom_elements: [
        ...current,
        { id: 'el_' + Date.now(), type: 'badge', label: 'Caractéristique', value: 'Valeur' },
      ],
    });
  };

  const handleUpdateCustomElement = (id: string, field: 'label' | 'value' | 'type', val: string) => {
    if (!editingAd) return;
    const current = editingAd.custom_elements || [];
    setEditingAd({
      ...editingAd,
      custom_elements: current.map((el) => (el.id === id ? { ...el, [field]: val } : el)),
    });
  };

  const handleRemoveCustomElement = (id: string) => {
    if (!editingAd) return;
    const current = editingAd.custom_elements || [];
    setEditingAd({
      ...editingAd,
      custom_elements: current.filter((el) => el.id !== id),
    });
  };

  const handleDeleteAd = (adId: number, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: "Supprimer l'annonce publicitaire",
      message: `Êtes-vous absolument sûr de vouloir supprimer définitivement l'annonce "${title}" (#AD-${adId}) ? Cette action est irréversible et supprimera l'annonce directement de la base de données.`,
      confirmText: 'Supprimer définitivement',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.deleteAd(adId);
          await onRefreshData();
          showNotice('Annonce supprimée définitivement avec succès de la base de données.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleTogglePublish = async (adId: number) => {
    try {
      const res = await api.toggleAdPublish(adId);
      await onRefreshData();
      showNotice(res.message);
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  const handleTogglePause = async (adId: number) => {
    try {
      const res = await api.toggleAdPause(adId);
      await onRefreshData();
      showNotice(res.message);
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  const handleAdStatusChange = async (status: AdApprovalStatus) => {
    if (!reviewingAd) return;
    try {
      await api.updateAdStatus(reviewingAd.id, status, status === 'rejected' ? rejectionReasonInput : undefined);
      showNotice(`L'annonce a été marquée comme : ${status === 'accepted' ? 'Acceptée' : status === 'rejected' ? 'Refusée' : 'En attente'}`);
      setReviewingAd(null);
      setRejectionReasonInput('');
      await onRefreshData();
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  // Additional Entity Delete Handlers using In-App Confirmation Modal
  const handleDeleteService = (id: number, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer le service',
      message: `Voulez-vous vraiment supprimer définitivement le service "${title}" de la base de données ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.deleteService(id);
          await onRefreshData();
          showNotice('Service supprimé avec succès de la base de données.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleDeletePrice = (id: number, planName: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer le forfait tarifaire',
      message: `Voulez-vous vraiment supprimer le forfait "${planName}" de la grille des prix ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.deletePrice(id);
          await onRefreshData();
          showNotice('Forfait tarifaire supprimé avec succès.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleDeleteOrder = (id: number, code: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer la commande',
      message: `Voulez-vous supprimer définitivement la commande ${code} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.deleteOrder(id);
          await onRefreshData();
          showNotice('Commande supprimée avec succès.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleDeleteMessage = (id: number, sender: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer le message',
      message: `Supprimer définitivement le message de "${sender}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await fetch(`/api/messages/${id}`, { method: 'DELETE' });
          await onRefreshData();
          showNotice('Message supprimé.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleDeletePortfolio = (id: number, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer du portfolio',
      message: `Supprimer définitivement le projet "${title}" du portfolio ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
          await onRefreshData();
          showNotice('Projet supprimé du portfolio.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  const handleDeletePromotion = (id: number, code: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer la promotion',
      message: `Supprimer définitivement le code promo "${code}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
          await onRefreshData();
          showNotice('Code promotionnel supprimé.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  // ==========================================
  // SECURITY & PASSWORD CHANGE
  // ==========================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityNotice(null);

    if (newPassword !== confirmPassword) {
      setSecurityNotice({ type: 'error', text: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityNotice({ type: 'error', text: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await api.changePassword(oldPassword, newPassword);
      if (res.success) {
        setSecurityNotice({ type: 'success', text: 'Mot de passe administrateur changé et chiffré avec succès dans la base de données.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityNotice({ type: 'error', text: res.message || 'Erreur lors du changement de mot de passe.' });
      }
    } catch (err: any) {
      setSecurityNotice({ type: 'error', text: err.message || 'Erreur réseau.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleLogoutAllDevices = () => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Déconnexion globale',
      message: 'Voulez-vous vraiment révoquer toutes les sessions et déconnecter tous les appareils actifs ?',
      confirmText: 'Déconnecter tout',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.logoutAll();
          showNotice('Toutes les sessions distantes ont été révoquées.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  // ==========================================
  // WORKING HOURS ACTIONS
  // ==========================================
  const handleSaveWorkingHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateWorkingHours(workingHoursForm);
      await onRefreshData();
      showNotice('Horaires de travail et plannings mis à jour avec succès.');
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  // ==========================================
  // CMS CONTENT BLOCKS
  // ==========================================
  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;

    try {
      if (editingBlock.id) {
        await api.updateContentBlock(editingBlock.id, editingBlock);
        showNotice('Contenu mis à jour sur le site.');
      } else {
        await api.createContentBlock(editingBlock);
        showNotice('Nouveau bloc de texte ajouté.');
      }
      setEditingBlock(null);
      await onRefreshData();
    } catch (err: any) {
      showNotice(`Erreur : ${err.message}`);
    }
  };

  const handleDeleteBlock = (id: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      title: 'Supprimer ce bloc de contenu',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement ce bloc de texte du site ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        try {
          await api.deleteContentBlock(id);
          await onRefreshData();
          showNotice('Bloc de texte supprimé de la base de données.');
        } catch (err: any) {
          showNotice(`Erreur : ${err.message}`);
        }
      },
    });
  };

  // Stats calculation
  const totalAds = data.ads?.length || 0;
  const pendingAdsCount = (data.ads || []).filter((a) => a.status === 'pending').length;
  const acceptedAdsCount = (data.ads || []).filter((a) => a.status === 'accepted').length;
  const publishedAdsCount = (data.ads || []).filter((a) => a.is_published).length;
  const totalOrders = data.orders?.length || 0;
  const pendingOrdersCount = (data.orders || []).filter((o) => o.status === 'en_attente').length;
  const totalRevenueDt = (data.orders || []).reduce((acc, o) => {
    return o.status !== 'annulee' ? acc + (Number(o.total_dt) || 0) : acc;
  }, 0);
  const unreadNotificationsCount = (data.notifications || []).filter((n) => !n.is_read).length;

  // Filtered Ads
  const filteredAds = (data.ads || []).filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(adSearch.toLowerCase()) ||
      ad.advertiser_name.toLowerCase().includes(adSearch.toLowerCase()) ||
      ad.advertiser_phone.includes(adSearch);
    const matchesStatus = adFilterStatus === 'all' || ad.status === adFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtered Orders
  const filteredOrders = (data.orders || []).filter((o) => {
    const matchesSearch =
      o.client_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.order_code.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.client_phone.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070d] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="relative w-14 h-14 mx-auto mb-3 rounded-2xl overflow-hidden ring-1 ring-blue-500/30 bg-slate-950 p-0.5 flex items-center justify-center">
              <img
                src="/assets/aistudio/618809252_122152568102903553_3023622513410630720_n__2__f340369a.jpg"
                alt="Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Administration Sécurisée</h2>
            <p className="text-xs text-slate-400 mt-1">
              Rayen Masmoudi Digital · Sfax, Tunisie
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom d'utilisateur ou Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mot de Passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Défaut : <code className="text-blue-400">admin</code> / <code className="text-blue-400">admin123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-95 mt-2"
            >
              {loginLoading ? 'Connexion en cours...' : 'Se connecter au Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onCloseAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour au site public</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SIDEBAR NAVIGATION TABS
  // ==========================================
  const navTabs = [
    { id: 'overview', label: '1. Overview & KPIs', icon: LayoutDashboard },
    { id: 'ads', label: '2. Gestion des Annonces', icon: Megaphone, count: totalAds },
    { id: 'ad_approvals', label: '3. Approbations Annonces', icon: CheckCircle2, badge: pendingAdsCount },
    { id: 'schedule', label: '4. Horaires & Météo Pub', icon: Clock },
    { id: 'security', label: '5. Sécurité & Mot de Passe', icon: KeyRound },
    { id: 'cms', label: '6. Contenu du Site (CMS)', icon: FileText },
    { id: 'services', label: '7. Services & DT', icon: Briefcase },
    { id: 'prices', label: '8. Grille des Prix', icon: DollarSign },
    { id: 'orders', label: '9. Commandes Clients', icon: ShoppingCart, badge: pendingOrdersCount },
    { id: 'clients', label: '10. Répertoire Clients', icon: Users },
    { id: 'messages', label: '11. Boîte de Messages', icon: MessageSquare, badge: (data.messages || []).filter(m => !m.is_read).length },
    { id: 'portfolio', label: '12. Galerie Portfolio', icon: ImageIcon },
    { id: 'promotions', label: '13. Codes Promotions', icon: Percent },
    { id: 'notifications', label: '14. Centre Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'settings', label: '15. Paramètres Agence', icon: SettingsIcon },
    { id: 'xampp', label: '🗄️ SQL & Déploiement XAMPP', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onCloseAdmin}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voir le site</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-tight">
              RAYEN MASMOUDI DIGITAL
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-bold">
              PRO CMS &amp; ADS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 hover:bg-rose-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-800 bg-[#080d1a] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-3 hidden md:block">
            Modules d'Administration
          </div>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {'badge' in tab && tab.badge ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-blue-900' : 'bg-amber-500/30 text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {actionNotice && (
            <div className="mb-6 p-3.5 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-200 text-xs font-medium flex items-center justify-between shadow-lg">
              <span>{actionNotice}</span>
              <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* ==================================================== */}
          {/* 1. OVERVIEW & KPIS */}
          {/* ==================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Tableau de Bord Global</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Suivi en temps réel de vos campagnes, annonces publicitaires, approbations et revenus.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400">Total Annonces</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
                    {totalAds}
                  </div>
                  <div className="text-[11px] text-blue-400 mt-1 font-medium">{publishedAdsCount} publiées en direct</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/30">
                  <div className="text-xs font-semibold text-amber-300">En Attente d'Approbation</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 tabular-nums">
                    {pendingAdsCount}
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-1 font-medium">À valider ou rejeter</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400">Total Commandes</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1 tabular-nums">
                    {totalOrders}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">{pendingOrdersCount} en attente</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/40 bg-gradient-to-br from-slate-900 to-blue-950/40">
                  <div className="text-xs font-semibold text-blue-300">Revenus Estimés</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tabular-nums">
                    {totalRevenueDt} <span className="text-base text-cyan-400">DT</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">Transactions réelles</div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('ads')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Gérer les Annonces</div>
                    <div className="text-[11px] text-slate-400">Ajouter, publier, masquer ou éditer</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('ad_approvals')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-amber-600/20 text-amber-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Modération &amp; Approbations</div>
                    <div className="text-[11px] text-slate-400">{pendingAdsCount} annonce(s) à examiner</div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 flex items-center gap-3 text-left transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sécurité du Mot de Passe</div>
                    <div className="text-[11px] text-slate-400">Changer le mot de passe admin</div>
                  </div>
                </button>
              </div>

              {/* Recent Notifications feed */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Activités Récentes &amp; Notifications</h3>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Voir tout ({data.notifications?.length || 0}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {(data.notifications || []).slice(0, 4).map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white">{n.title}</div>
                        <div className="text-slate-400 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Destinataire : {n.recipient_name} ({n.recipient_phone}) · {new Date(n.created_at).toLocaleString('fr-TN')}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${n.is_read ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white'}`}>
                        {n.is_read ? 'Lu' : 'Nouveau'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. ADS MANAGEMENT (إدارة الإعلانات) */}
          {/* ==================================================== */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Gestion Complète des Annonces</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ajoutez, modifiez, masquez, republiez, mettez en pause ou programmez vos campagnes publicitaires.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingAd({
                      title: '',
                      title_ar: '',
                      advertiser_name: '',
                      advertiser_phone: '+216 ',
                      description: '',
                      description_ar: '',
                      price_dt: 50,
                      category: 'marketing',
                      images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'],
                      video_url: '',
                      status: 'accepted',
                      is_published: true,
                      is_paused: false,
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
                      map_address: 'Sfax, Tunisie',
                      latitude: 34.7406,
                      longitude: 10.7603,
                      map_enabled: false,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle Annonce</span>
                </button>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Rechercher par titre, annonceur, numéro..."
                    value={adSearch}
                    onChange={(e) => setAdSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={adFilterStatus}
                  onChange={(e) => setAdFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="all">Tous les états</option>
                  <option value="accepted">Acceptée</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Refusée</option>
                </select>
              </div>

              {/* Ads Table */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5">Visuel &amp; Titre</th>
                        <th className="p-3.5">Annonceur</th>
                        <th className="p-3.5">Prix DT</th>
                        <th className="p-3.5">Période</th>
                        <th className="p-3.5">État Modération</th>
                        <th className="p-3.5">Visibilité Site</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredAds.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500">
                            Aucune annonce trouvée.
                          </td>
                        </tr>
                      ) : (
                        filteredAds.map((ad) => (
                          <tr key={ad.id} className="hover:bg-slate-800/40">
                            <td className="p-3.5 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-black overflow-hidden shrink-0 border border-slate-800">
                                <img
                                  src={ad.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                                  alt={ad.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{ad.title}</span>
                                <span className="text-[11px] text-cyan-400 uppercase">{ad.category}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-white block">{ad.advertiser_name}</span>
                              <span className="text-[11px] text-slate-400 block">{ad.advertiser_phone}</span>
                            </td>
                            <td className="p-3.5 font-bold text-white tabular-nums">
                              {ad.price_dt} DT
                            </td>
                            <td className="p-3.5 text-slate-400">
                              <span className="block text-[11px]">Du : {ad.start_date}</span>
                              <span className="block text-[11px]">Au : {ad.end_date}</span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                                  ad.status === 'accepted'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : ad.status === 'rejected'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {ad.status === 'accepted'
                                  ? 'Acceptée'
                                  : ad.status === 'rejected'
                                  ? 'Refusée'
                                  : 'En attente'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleTogglePublish(ad.id)}
                                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                                    ad.is_published
                                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                  title={ad.is_published ? 'Cliquez pour masquer' : 'Cliquez pour publier'}
                                >
                                  {ad.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span>{ad.is_published ? 'Publié' : 'Masqué'}</span>
                                </button>

                                <button
                                  onClick={() => handleTogglePause(ad.id)}
                                  className={`p-1 rounded text-xs ${
                                    ad.is_paused ? 'text-amber-400' : 'text-slate-400'
                                  }`}
                                  title={ad.is_paused ? 'Campagne en pause (Reprendre)' : 'Campagne active (Mettre en pause)'}
                                >
                                  {ad.is_paused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingAd(ad)}
                                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                                  title="Modifier l'annonce"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAd(ad.id, ad.title)}
                                  className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit / Add Ad Modal */}
              {editingAd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
                  <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {editingAd.id ? `Modifier l'Annonce #AD-${editingAd.id}` : 'Créer une Nouvelle Annonce'}
                          </h3>
                          <span className="text-xs text-slate-400">
                            Configurez les visuels, prix en DT, vidéo, dates et coordonnées géographiques Sfax
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingAd(null)}
                        className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAd} className="space-y-6">
                      
                      {/* Section 1: Titre & Catégorie */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          1. Titre &amp; Catégorie
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Titre de l'Annonce (FR) *
                            </label>
                            <input
                              type="text"
                              required
                              value={editingAd.title || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="Ex: Campagne Promo Restaurant Sfax"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Titre en Arabe (AR)
                            </label>
                            <input
                              type="text"
                              value={editingAd.title_ar || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, title_ar: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-['Cairo'] focus:border-blue-500 focus:outline-none"
                              placeholder="عنوان الإعلان بالعربية"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Catégorie de la Campagne
                            </label>
                            <select
                              value={editingAd.category || 'marketing'}
                              onChange={(e) => setEditingAd({ ...editingAd, category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                            >
                              <option value="marketing">Digital Marketing Global</option>
                              <option value="sponsoring">Sponsoring Meta (FB &amp; IG)</option>
                              <option value="video">Montage Vidéo Ads &amp; Reels</option>
                              <option value="web">Création Site Web</option>
                              <option value="branding">Design Logo &amp; Affiche</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Statut de Modération
                            </label>
                            <select
                              value={editingAd.status || 'pending'}
                              onChange={(e) => setEditingAd({ ...editingAd, status: e.target.value as AdApprovalStatus })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold"
                            >
                              <option value="pending" className="text-amber-400">En attente (Pending)</option>
                              <option value="accepted" className="text-emerald-400">Acceptée &amp; Validée (Accepted)</option>
                              <option value="rejected" className="text-rose-400">Refusée (Rejected)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Annonceur & Contact */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          2. Coordonnées de l'Annonceur
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Nom ou Enseigne *
                            </label>
                            <input
                              type="text"
                              required
                              value={editingAd.advertiser_name || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, advertiser_name: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="Ex: Pâtisserie Orientale"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Téléphone (Tunisie) *
                            </label>
                            <input
                              type="tel"
                              required
                              value={editingAd.advertiser_phone || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, advertiser_phone: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="+216 44 203 500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Email de Contact
                            </label>
                            <input
                              type="email"
                              value={editingAd.advertiser_email || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, advertiser_email: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="client@gmail.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Prix DT & Promo */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          3. Tarification en Dinars Tunisiens (DT)
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Prix Actuel (DT) *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                required
                                value={editingAd.price_dt || 50}
                                onChange={(e) => setEditingAd({ ...editingAd, price_dt: Number(e.target.value) })}
                                className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:border-blue-500 focus:outline-none"
                              />
                              <span className="absolute right-3 top-2 text-xs font-extrabold text-blue-400">DT</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Ancien Prix (Barre de Promo)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={editingAd.old_price_dt || ''}
                                onChange={(e) => setEditingAd({ ...editingAd, old_price_dt: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                                placeholder="Ex: 80"
                              />
                              <span className="absolute right-3 top-2 text-xs font-extrabold text-slate-500">DT</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                              <input
                                type="checkbox"
                                checked={editingAd.is_published ?? true}
                                onChange={(e) => setEditingAd({ ...editingAd, is_published: e.target.checked })}
                                className="w-4 h-4 rounded text-blue-600"
                              />
                              <span className="font-semibold text-white">Publier sur le site</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                              <input
                                type="checkbox"
                                checked={editingAd.is_paused ?? false}
                                onChange={(e) => setEditingAd({ ...editingAd, is_paused: e.target.checked })}
                                className="w-4 h-4 rounded text-amber-500"
                              />
                              <span className="font-semibold text-amber-400">En pause</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Dates & Calendrier */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>4. Dates &amp; Programmation de Diffusion</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Date de Début
                            </label>
                            <input
                              type="date"
                              value={editingAd.start_date || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, start_date: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Date de Fin
                            </label>
                            <input
                              type="date"
                              value={editingAd.end_date || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, end_date: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Publication Programmée (Date &amp; Heure)
                            </label>
                            <input
                              type="datetime-local"
                              value={editingAd.scheduled_publish_time || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, scheduled_publish_time: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Gestionnaire Multi-Photos */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>5. Photos Multiples de l'Annonce ({editingAd.images?.length || 0})</span>
                          </div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Importer depuis l'appareil</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Image URLs text input */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] text-slate-400">
                              Ou saisissez des URLs d'images (séparées par des virgules) :
                            </label>
                            {editingAd.images && editingAd.images.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setEditingAd({ ...editingAd, images: [] })}
                                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Supprimer toutes les photos</span>
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={editingAd.images ? editingAd.images.join(', ') : ''}
                            onChange={(e) =>
                              setEditingAd({
                                ...editingAd,
                                images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="https://image1.jpg, https://image2.jpg"
                          />
                        </div>

                        {/* Image Preview Gallery */}
                        {editingAd.images && editingAd.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                            {editingAd.images.map((img, i) => (
                              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-950">
                                <img src={img} alt={`ad-${i}`} className="w-full h-full object-cover" />
                                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  i === 0 ? 'bg-blue-600 text-white shadow' : 'bg-black/70 text-slate-300'
                                }`}>
                                  {i === 0 ? 'Principale' : `#${i + 1}`}
                                </span>
                                {i > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!editingAd || !editingAd.images) return;
                                      const imgs = [...editingAd.images];
                                      const [selected] = imgs.splice(i, 1);
                                      setEditingAd({ ...editingAd, images: [selected, ...imgs] });
                                    }}
                                    className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-blue-600/90 hover:bg-blue-600 text-[9px] text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Définir comme photo principale"
                                  >
                                    ★ En tête
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(i)}
                                  className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-80 group-hover:opacity-100 hover:bg-rose-500 transition-opacity"
                                  title="Supprimer cette image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 6: Vidéo de l'Annonce */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5" />
                          <span>6. Vidéo Publicitaire (YouTube, Vimeo, ou lien MP4)</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={editingAd.video_url || ''}
                            onChange={(e) => setEditingAd({ ...editingAd, video_url: e.target.value })}
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/... ou https://.../video.mp4"
                          />
                          {editingAd.video_url && (
                            <button
                              type="button"
                              onClick={() => setEditingAd({ ...editingAd, video_url: '' })}
                              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                              title="Supprimer la vidéo de l'annonce"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer vidéo</span>
                            </button>
                          )}
                        </div>

                        {/* Interactive Video Embed Preview */}
                        {editingAd.video_url && (
                          <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-w-md mx-auto">
                            {getEmbedUrl(editingAd.video_url) ? (
                              <iframe
                                src={getEmbedUrl(editingAd.video_url)!}
                                title="Aperçu vidéo"
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={editingAd.video_url}
                                controls
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Section 7: Emplacement Sfax & Google Maps Readiness */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>7. Quartier / Route de Sfax (Prêt pour Google Maps)</span>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Sélection rapide du quartier ou route à Sfax :
                          </label>
                          <select
                            onChange={(e) => {
                              const selected = SFAX_DISTRICTS.find((d) => d.name === e.target.value);
                              if (selected) {
                                setEditingAd({
                                  ...editingAd,
                                  map_address: selected.address,
                                  latitude: selected.lat,
                                  longitude: selected.lng,
                                });
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>-- Choisir un secteur à Sfax --</option>
                            {SFAX_DISTRICTS.map((district) => (
                              <option key={district.name} value={district.name}>
                                {district.name} ({district.lat}, {district.lng})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Adresse exacte</label>
                            <input
                              type="text"
                              placeholder="Adresse (ex: Sfax, Téniour)"
                              value={editingAd.map_address || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, map_address: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Latitude</label>
                            <input
                              type="number"
                              step="0.0001"
                              placeholder="Latitude (34.7406)"
                              value={editingAd.latitude || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, latitude: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">Longitude</label>
                            <input
                              type="number"
                              step="0.0001"
                              placeholder="Longitude (10.7603)"
                              value={editingAd.longitude || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, longitude: Number(e.target.value) })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 8: Badges & Éléments Personnalisés (Custom Elements) */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>8. Badges &amp; Éléments Visuels Personnalisés ({editingAd.custom_elements?.length || 0})</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddCustomElement}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:bg-blue-600/50 text-xs font-semibold"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter un badge</span>
                          </button>
                        </div>

                        {editingAd.custom_elements && editingAd.custom_elements.length > 0 ? (
                          <div className="space-y-2">
                            {editingAd.custom_elements.map((el) => (
                              <div key={el.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                                <select
                                  value={el.type}
                                  onChange={(e) => handleUpdateCustomElement(el.id, 'type', e.target.value)}
                                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                >
                                  <option value="badge">Badge</option>
                                  <option value="highlight">Point Fort</option>
                                  <option value="spec">Spécification</option>
                                </select>
                                <input
                                  type="text"
                                  placeholder="Intitulé (ex: Livraison)"
                                  value={el.label}
                                  onChange={(e) => handleUpdateCustomElement(el.id, 'label', e.target.value)}
                                  className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Valeur (ex: Gratuite à Sfax)"
                                  value={el.value}
                                  onChange={(e) => handleUpdateCustomElement(el.id, 'value', e.target.value)}
                                  className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCustomElement(el.id)}
                                  className="p-1 rounded-md text-rose-400 hover:bg-rose-950/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Aucun élément personnalisé. Cliquez sur "Ajouter un badge" pour insérer des points forts ("-25% de remise", "Livraison express", etc.).
                          </p>
                        )}
                      </div>

                      {/* Section 9: Description & Contenu */}
                      <div className="space-y-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          9. Description &amp; Détails de l'Offre
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Description en Français
                            </label>
                            <textarea
                              rows={3}
                              value={editingAd.description || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
                              placeholder="Détails complets de la campagne..."
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Description en Arabe
                            </label>
                            <textarea
                              rows={3}
                              value={editingAd.description_ar || ''}
                              onChange={(e) => setEditingAd({ ...editingAd, description_ar: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-['Cairo'] resize-none focus:border-blue-500 focus:outline-none"
                              placeholder="تفاصيل العرض والمزايا بالعربية..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
                        <button
                          type="button"
                          onClick={() => setEditingAd(null)}
                          className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all active:scale-95"
                        >
                          Enregistrer et Mettre à Jour l'Annonce
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. REVIEW & APPROVAL SYSTEM (نظام قبول أو رفض الإعلانات) */}
          {/* ==================================================== */}
          {activeTab === 'ad_approvals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Modération &amp; Approbations des Annonces</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Système à 3 statuts : <strong>Pending (En attente)</strong>, <strong>Accepted (Acceptée)</strong>, et <strong>Rejected (Refusée)</strong> avec motif et notification automatique.
                </p>
              </div>

              {/* Pending Queue Highlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200">
                  <div className="text-xs font-bold uppercase tracking-wider">En attente de revue</div>
                  <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">{pendingAdsCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200">
                  <div className="text-xs font-bold uppercase tracking-wider">Acceptées &amp; Actives</div>
                  <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">{acceptedAdsCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/40 text-rose-200">
                  <div className="text-xs font-bold uppercase tracking-wider">Refusées avec motif</div>
                  <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
                    {(data.ads || []).filter((a) => a.status === 'rejected').length}
                  </div>
                </div>
              </div>

              {/* Review List */}
              <div className="space-y-4">
                {(data.ads || []).map((ad) => (
                  <div
                    key={ad.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0 border border-slate-800">
                        <img
                          src={ad.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ad.status === 'accepted'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : ad.status === 'rejected'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {ad.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{ad.description}</p>
                        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-3">
                          <span>Annonceur : <strong className="text-slate-300">{ad.advertiser_name}</strong> ({ad.advertiser_phone})</span>
                          <span>Prix : <strong className="text-blue-400">{ad.price_dt} DT</strong></span>
                          <span>Période : {ad.start_date} → {ad.end_date}</span>
                        </div>
                        {ad.rejection_reason && (
                          <div className="mt-2 text-xs p-2 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300">
                            <strong>Motif de refus :</strong> {ad.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setReviewingAd(ad);
                          setRejectionReasonInput(ad.rejection_reason || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Examiner &amp; Statuer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review Modal */}
              {reviewingAd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      Décision sur l'annonce : {reviewingAd.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Annonceur : {reviewingAd.advertiser_name} ({reviewingAd.advertiser_phone})
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Motif de refus (optionnel si acceptée, obligatoire si rejetée)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ex : Visuel flou, non-respect de la charte de prix, description incomplète..."
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                      />
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => setReviewingAd(null)}
                        className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Annuler
                      </button>

                      <button
                        onClick={() => handleAdStatusChange('rejected')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Refuser l'annonce
                      </button>

                      <button
                        onClick={() => handleAdStatusChange('accepted')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Accepter &amp; Publier
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. SCHEDULE & WORKING HOURS (إدارة الوقت والمواعيد) */}
          {/* ==================================================== */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Gestion du Temps &amp; Horaires d'Ouverture</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Définissez vos heures d'ouverture à Sfax, les horaires spéciaux (Ramadan) et le support WhatsApp 24/7.
                </p>
              </div>

              <form onSubmit={handleSaveWorkingHours} className="space-y-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Horaires de Travail Hebdomadaires</h3>
                      <p className="text-xs text-slate-400">Visibles dans la section Contact et le pied de page.</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-cyan-400 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workingHoursForm.emergency_support_247}
                        onChange={(e) =>
                          setWorkingHoursForm({ ...workingHoursForm, emergency_support_247: e.target.checked })
                        }
                        className="rounded bg-slate-950 border-slate-700"
                      />
                      <span>Support WhatsApp 24/7 activé</span>
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    {workingHoursForm.days.map((day, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="w-28 font-bold text-white flex items-center gap-2">
                          <span>{day.day}</span>
                          <span className="text-slate-500 font-['Cairo']">({day.day_ar})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400">
                            <input
                              type="checkbox"
                              checked={day.is_open}
                              onChange={(e) => {
                                const newDays = [...workingHoursForm.days];
                                newDays[idx].is_open = e.target.checked;
                                setWorkingHoursForm({ ...workingHoursForm, days: newDays });
                              }}
                            />
                            <span>{day.is_open ? 'Ouvert' : 'Fermé'}</span>
                          </label>

                          {day.is_open && (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={day.open_time}
                                onChange={(e) => {
                                  const newDays = [...workingHoursForm.days];
                                  newDays[idx].open_time = e.target.value;
                                  setWorkingHoursForm({ ...workingHoursForm, days: newDays });
                                }}
                                className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-center text-xs"
                              />
                              <span>-</span>
                              <input
                                type="text"
                                value={day.close_time}
                                onChange={(e) => {
                                  const newDays = [...workingHoursForm.days];
                                  newDays[idx].close_time = e.target.value;
                                  setWorkingHoursForm({ ...workingHoursForm, days: newDays });
                                }}
                                className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-center text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Horaires Spéciaux (ex: Ramadan)
                      </label>
                      <input
                        type="text"
                        value={workingHoursForm.ramadan_hours || ''}
                        onChange={(e) =>
                          setWorkingHoursForm({ ...workingHoursForm, ramadan_hours: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        placeholder="Ex : 09:00 - 15:30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Note d'horaires
                      </label>
                      <input
                        type="text"
                        value={workingHoursForm.schedule_note || ''}
                        onChange={(e) =>
                          setWorkingHoursForm({ ...workingHoursForm, schedule_note: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Sauvegarder les Horaires
                </button>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* 5. SECURITY & ADMIN PASSWORD (إدارة كلمة سر لوحة التحكم) */}
          {/* ==================================================== */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Sécurité &amp; Mot de Passe Administrateur</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Modifiez votre mot de passe d'accès avec hachage sécurisé SHA-256 salé et gestion des sessions.
                </p>
              </div>

              {securityNotice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    securityNotice.type === 'success'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{securityNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ancien mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Saisissez votre mot de passe actuel"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Minimum 6 caractères"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="Répétez le mot de passe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={securityLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {securityLoading ? 'Chiffrement et mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </form>

              {/* Invalidate all sessions */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white">Déconnexion Forcée de Tous les Appareils</h4>
                <p className="text-xs text-slate-400">
                  En cas de doute ou de perte d'appareil, vous pouvez forcer la révocation immédiate de toutes les sessions actives.
                </p>
                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className="mt-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 font-bold text-xs transition-colors"
                >
                  Déconnecter toutes les sessions
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 6. CMS CONTENT BLOCKS (إدارة محتوى الموقع) */}
          {/* ==================================================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Gestion de Contenu du Site (CMS Sans Code)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Modifiez les textes, slogans, présentations et titres de sections affichés en direct sur le site.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingBlock({
                      section_key: 'custom',
                      title: '',
                      title_ar: '',
                      content: '',
                      content_ar: '',
                      badge: '',
                      order_index: (data.content_blocks || []).length + 1,
                      is_visible: true,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Bloc de Texte</span>
                </button>
              </div>

              <div className="space-y-4">
                {(data.content_blocks || []).map((block) => (
                  <div key={block.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase">{block.section_key}</span>
                        {block.badge && (
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold">
                            {block.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white">{block.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed font-['Cairo']">{block.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingBlock(block)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-2 rounded-lg bg-rose-950/40 text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Block Modal */}
              {editingBlock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      {editingBlock.id ? 'Modifier le Bloc de Texte' : 'Nouveau Bloc'}
                    </h3>

                    <form onSubmit={handleSaveBlock} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Titre du bloc *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingBlock.title || ''}
                          onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Contenu / Texte
                        </label>
                        <textarea
                          rows={4}
                          value={editingBlock.content || ''}
                          onChange={(e) => setEditingBlock({ ...editingBlock, content: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none font-['Cairo']"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBlock(null)}
                          className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl"
                        >
                          Sauvegarder
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 7. SERVICES (EXISTING) */}
          {/* ==================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Nos 9 Services</h2>
                <button
                  onClick={() =>
                    setEditingService({
                      title: '',
                      price_dt: 50,
                      category: 'marketing',
                      delivery_time: '48h',
                      features: ['Qualité HD', 'Support direct'],
                      is_active: true,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(data.services || []).map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-400 uppercase">{s.category}</span>
                        <span className="text-lg font-bold text-white tabular-nums">{s.price_dt} DT</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-white">{s.title}</h3>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">{s.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingService(s)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Modifier ce service"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id, s.title)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                        title="Supprimer ce service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Modal */}
              {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                  <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      {editingService.id ? 'Modifier le Service' : 'Nouveau Service'}
                    </h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!editingService) return;
                        if (editingService.id) {
                          await api.updateService(editingService.id, editingService);
                        } else {
                          await api.createService(editingService);
                        }
                        setEditingService(null);
                        await onRefreshData();
                        showNotice('Service enregistré.');
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        required
                        value={editingService.title || ''}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        placeholder="Titre du service"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                      <input
                        type="number"
                        required
                        value={editingService.price_dt || 50}
                        onChange={(e) => setEditingService({ ...editingService, price_dt: Number(e.target.value) })}
                        placeholder="Prix en DT"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                      <textarea
                        rows={3}
                        value={editingService.description || ''}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        placeholder="Description"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                      />
                      <div className="pt-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingService(null)} className="px-3 py-1.5 text-xs text-slate-400">
                          Annuler
                        </button>
                        <button type="submit" className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs">
                          Sauvegarder
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 8. PRICES & PACKS */}
          {/* ==================================================== */}
          {activeTab === 'prices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Grille des Tarifs &amp; Forfaits Officiels</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Kick Growth Premium (500 DT), Sites Web (300-800 DT), Applications (500-1500 DT), Pack Combo (1500 DT), et Packs Rapides.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold font-['Cairo']">
                    💵 الدفع قبل بداية الخدمة — 🚫 ممنوع الكريدي
                  </div>
                  <button
                    onClick={() =>
                      setEditingPrice({
                        plan_name: '',
                        plan_name_ar: '',
                        price_dt: 300,
                        billing_cycle: 'Par projet',
                        category: 'web',
                        badge: '',
                        description: '',
                        features: ['Support technique', 'Livraison rapide'],
                        is_featured: false,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un Forfait</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(data.prices || []).map((p) => (
                  <div
                    key={p.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between ${
                      p.category === 'kick'
                        ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-900/20'
                        : p.category === 'combo'
                        ? 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-400/60'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                            {p.badge || p.category}
                          </span>
                          <h3 className="text-base font-bold text-white font-['Cairo']">
                            {p.plan_name_ar || p.plan_name}
                          </h3>
                          <span className="text-xs text-slate-400 block">{p.plan_name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-extrabold text-white tabular-nums">{p.price_dt} DT</span>
                          <span className="text-[11px] text-slate-400 block font-['Cairo']">{p.billing_cycle}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-3 font-['Cairo'] line-clamp-2">{p.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div>
                        <span>{p.features?.length || 0} caractéristiques</span>
                        {p.is_featured && <span className="text-blue-400 font-bold ml-2">★ En vedette</span>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingPrice(p)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Modifier ce forfait"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrice(p.id, p.plan_name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                          title="Supprimer ce forfait"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Modal */}
              {editingPrice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
                  <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-lg font-bold text-white">
                        {editingPrice.id ? 'Modifier le Forfait' : 'Nouveau Forfait Tarifaire'}
                      </h3>
                      <button
                        onClick={() => setEditingPrice(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!editingPrice) return;
                        try {
                          if (editingPrice.id) {
                            await api.updatePrice(editingPrice.id, editingPrice);
                            showNotice('Forfait mis à jour dans la base de données.');
                          } else {
                            await api.createPrice(editingPrice);
                            showNotice('Nouveau forfait ajouté avec succès.');
                          }
                          setEditingPrice(null);
                          await onRefreshData();
                        } catch (err: any) {
                          showNotice(`Erreur : ${err.message}`);
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nom du pack (FR) *</label>
                          <input
                            type="text"
                            required
                            value={editingPrice.plan_name || ''}
                            onChange={(e) => setEditingPrice({ ...editingPrice, plan_name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                            placeholder="Site Web Business"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nom du pack (AR)</label>
                          <input
                            type="text"
                            value={editingPrice.plan_name_ar || ''}
                            onChange={(e) => setEditingPrice({ ...editingPrice, plan_name_ar: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-['Cairo']"
                            placeholder="موقع بيزنس"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Prix en DT *</label>
                          <input
                            type="number"
                            required
                            value={editingPrice.price_dt || 0}
                            onChange={(e) => setEditingPrice({ ...editingPrice, price_dt: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Catégorie</label>
                          <select
                            value={editingPrice.category || 'web'}
                            onChange={(e) => setEditingPrice({ ...editingPrice, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                          >
                            <option value="kick">Kick Growth</option>
                            <option value="web">Site Web</option>
                            <option value="app">Application</option>
                            <option value="combo">Pack Combo</option>
                            <option value="starter">Packs Rapides</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Cycle / Durée</label>
                          <input
                            type="text"
                            value={editingPrice.billing_cycle || 'Par projet'}
                            onChange={(e) => setEditingPrice({ ...editingPrice, billing_cycle: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                            placeholder="/ mois ou par projet"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Badge (ex: RECOMMANDÉ, PRO, STAR)</label>
                        <input
                          type="text"
                          value={editingPrice.badge || ''}
                          onChange={(e) => setEditingPrice({ ...editingPrice, badge: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                          placeholder="PREMIUM / BUSINESS / POPULAIRE"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={editingPrice.description || ''}
                          onChange={(e) => setEditingPrice({ ...editingPrice, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                          placeholder="Description du forfait"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Fonctionnalités incluses (une par ligne ou séparées par des virgules) :
                        </label>
                        <textarea
                          rows={3}
                          value={editingPrice.features ? editingPrice.features.join('\n') : ''}
                          onChange={(e) =>
                            setEditingPrice({
                              ...editingPrice,
                              features: e.target.value
                                .split('\n')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none"
                          placeholder="Design Responsive&#10;Hébergement inclus&#10;Support 30 jours"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="is_featured_price"
                          checked={editingPrice.is_featured || false}
                          onChange={(e) => setEditingPrice({ ...editingPrice, is_featured: e.target.checked })}
                          className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
                        />
                        <label htmlFor="is_featured_price" className="text-xs text-slate-300">
                          Mettre en vedette ce pack (badge spécial et contour illuminé)
                        </label>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPrice(null)}
                          className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                        >
                          Sauvegarder dans la Base de Données
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 9. ORDERS */}
          {/* ==================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Commandes Clients</h2>
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Service</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="p-3.5 font-mono text-cyan-400 font-bold">{o.order_code}</td>
                        <td className="p-3.5">
                          <span className="text-white font-semibold block">{o.client_name}</span>
                          <span className="text-slate-400 text-[11px] block">{o.client_phone}</span>
                        </td>
                        <td className="p-3.5">{o.service_title}</td>
                        <td className="p-3.5 font-bold text-white tabular-nums">{o.total_dt} DT</td>
                        <td className="p-3.5">
                          <select
                            value={o.status}
                            onChange={async (e) => {
                              try {
                                await api.updateOrderStatus(o.id, e.target.value);
                                await onRefreshData();
                                showNotice(`Statut de la commande ${o.order_code} mis à jour.`);
                              } catch (err: any) {
                                showNotice(`Erreur : ${err.message}`);
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                          >
                            <option value="en_attente">En attente</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminée</option>
                            <option value="annulee">Annulée</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteOrder(o.id, o.order_code)}
                            className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                            title="Supprimer cette commande"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 10. CLIENTS */}
          {/* ==================================================== */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Répertoire des Clients</h2>
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Nom</th>
                      <th className="p-3.5">Téléphone</th>
                      <th className="p-3.5">Commandes</th>
                      <th className="p-3.5">Total Dépensé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(data.clients || []).map((c) => (
                      <tr key={c.id}>
                        <td className="p-3.5 font-bold text-white">{c.full_name}</td>
                        <td className="p-3.5 text-cyan-400">{c.phone}</td>
                        <td className="p-3.5">{c.total_orders}</td>
                        <td className="p-3.5 font-bold text-emerald-400">{c.total_spent_dt} DT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 11. MESSAGES */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Messages Reçus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.messages || []).map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-white">{m.sender_name}</div>
                          <div className="text-xs text-cyan-400">{m.sender_phone} {m.sender_email ? `· ${m.sender_email}` : ''}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(m.id, m.sender_name)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Supprimer ce message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold text-slate-300 mt-2">{m.subject}</div>
                      <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2.5 rounded-lg">{m.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 12. PORTFOLIO & 13. PROMOTIONS */}
          {/* ==================================================== */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Portfolio de l'Agence</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.portfolio || []).map((p) => (
                  <div key={p.id} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between">
                    <img src={p.media_url} alt={p.title} className="w-full h-36 object-cover" />
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-white text-sm">{p.title}</div>
                        <div className="text-xs text-slate-400">{p.client_name}</div>
                      </div>
                      <button
                        onClick={() => handleDeletePortfolio(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                        title="Supprimer du portfolio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Codes Promotionnels</h2>
              <div className="space-y-3">
                {(data.promotions || []).map((promo) => (
                  <div key={promo.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-cyan-400">{promo.code}</span>
                      <span className="text-xs text-slate-400 ml-3">{promo.discount_value} {promo.discount_type === 'percentage' ? '%' : 'DT'} de remise</span>
                      <span className="text-xs text-slate-500 ml-4">Valide jusqu'au {promo.valid_until}</span>
                    </div>
                    <button
                      onClick={() => handleDeletePromotion(promo.id, promo.code)}
                      className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 transition-colors"
                      title="Supprimer ce code promo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 14. NOTIFICATIONS CENTER */}
          {/* ==================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Centre de Notifications</h2>
                <p className="text-xs text-slate-400 mt-1">Historique des alertes envoyées et reçues.</p>
              </div>

              <div className="space-y-3">
                {(data.notifications || []).map((notif) => (
                  <div key={notif.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                      <div className="text-[11px] text-slate-500 mt-2">
                        {notif.recipient_name} ({notif.recipient_phone}) · {new Date(notif.created_at).toLocaleString('fr-TN')}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await api.markNotificationRead(notif.id);
                        await onRefreshData();
                      }}
                      className="text-xs text-blue-400 hover:text-white"
                    >
                      {notif.is_read ? 'Marqué lu' : 'Marquer comme lu'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 15. SETTINGS */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-white">Paramètres Généraux</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await api.updateSettings(settingsForm);
                  await onRefreshData();
                  showNotice('Paramètres enregistrés.');
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={settingsForm.agency_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, agency_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                  Sauvegarder
                </button>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* XAMPP EXPORT & DATABASE.SQL */}
          {/* ==================================================== */}
          {activeTab === 'xampp' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Base de Données MySQL &amp; XAMPP</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Téléchargez le script SQL complet avec toutes les tables (ads, notifications, working_hours, content_blocks).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Fichier database.sql pour XAMPP</h4>
                    <p className="text-xs text-slate-400">
                      Prêt pour phpMyAdmin avec tables ads, working_hours, content_blocks, notifications, admins.
                    </p>
                  </div>
                </div>

                <a
                  href="/database.sql"
                  download="rayen_masmoudi_digital.sql"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger database.sql</span>
                </a>
              </div>
            </div>
          )}

        </main>

        {/* ==================================================== */}
        {/* IN-APP GLASSMORPHISM CONFIRMATION MODAL */}
        {/* ==================================================== */}
        {deleteConfirmModal && deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl shadow-rose-950/30 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white font-['Cairo']">
                  {deleteConfirmModal.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-['Cairo']">
                  {deleteConfirmModal.message}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {deleteConfirmModal.cancelText || 'Annuler'}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      await deleteConfirmModal.onConfirm();
                      setDeleteConfirmModal(null);
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>{deleteConfirmModal.confirmText || 'Confirmer'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
