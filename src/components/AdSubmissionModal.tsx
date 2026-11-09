import React, { useState } from 'react';
import { api } from '../services/api';
import { AdItem } from '../types';
import { X, CheckCircle2, Megaphone, MapPin, Video, AlertCircle, Sparkles, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const SFAX_ZONES = [
  'Sfax - Centre-Ville / Bab Bhar',
  'Sfax - Route de Téniour',
  'Sfax - Route de Gremda',
  'Sfax - Route de l\'Aéroport / Sokra',
  'Sfax - Route de Tunis',
  'Sfax - Route de Gabès',
  'Sfax - Route de Menzel Chaker',
  'Sfax - Sakiet Ezzit',
  'Sfax - Sakiet Eddaïer',
  'Sfax - Sidi Mansour',
  'Sfax - Thyna',
];

interface AdSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  lang: 'fr' | 'ar';
  onAdCreated: (ad: AdItem) => void;
}

export const AdSubmissionModal: React.FC<AdSubmissionModalProps> = ({
  isOpen,
  onClose,
  currency,
  lang,
  onAdCreated,
}) => {
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [advertiserPhone, setAdvertiserPhone] = useState('+216 ');
  const [advertiserEmail, setAdvertiserEmail] = useState('');
  const [description, setDescription] = useState('');
  const [priceDt, setPriceDt] = useState(50);
  const [category, setCategory] = useState('marketing');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mapAddress, setMapAddress] = useState('Sfax, Tunisie');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAd, setCreatedAd] = useState<AdItem | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setUploadedImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setUploadedImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !advertiserName.trim() || !advertiserPhone.trim()) {
      setError('Veuillez remplir le titre, votre nom et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    setError(null);

    const finalImages = uploadedImages.length > 0
      ? uploadedImages
      : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'];

    try {
      const res = await api.createAd({
        title,
        title_ar: titleAr || title,
        advertiser_name: advertiserName,
        advertiser_phone: advertiserPhone,
        advertiser_email: advertiserEmail,
        description,
        price_dt: Number(priceDt) || 50,
        category,
        images: finalImages,
        video_url: videoUrl,
        map_address: mapAddress,
        status: 'pending',
        is_published: false,
        is_paused: false,
      });

      if (res.success && res.ad) {
        setCreatedAd(res.ad);
        onAdCreated(res.ad);
        try {
          confetti({ particleCount: 70, spread: 60 });
        } catch {}
      } else {
        setError(res.message || 'Une erreur est survenue.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {createdAd ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-amber-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">
              {lang === 'ar' ? 'تم استلام طلب الإعلان بنجاح !' : 'Demande d\'Annonce Reçue !'}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 font-['Cairo']">
              {lang === 'ar'
                ? 'إعلانك حالياً في حالة (Pending - قيد المراجعة). سيقوم فريق Rayen Masmoudi Digital بفحصه وقبوله لإطلاقه على الموقع والرعايات.'
                : 'Votre annonce est actuellement enregistrée avec le statut Pending (En attente d\'examen). Notre équipe va la valider sous 24h.'}
            </p>

            <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Numéro de suivi :</span>
                <span className="font-mono text-cyan-400 font-bold">AD-{createdAd.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Titre :</span>
                <span className="text-white font-medium">{createdAd.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Statut initial :</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-bold">En attente (Pending)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {lang === 'ar' ? 'إيداع إعلان ترويجي جديد' : 'Déposer une Campagne Publicitaire'}
                </h3>
                <p className="text-xs text-slate-400">
                  Soumettez votre publicité pour examen et diffusion à Sfax
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Titre de l'Annonce *
              </label>
              <input
                type="text"
                required
                placeholder="Ex : Offre spéciale Restaurant Le Gourmet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Votre Nom ou Enseigne *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Ahmed Ben Salem"
                  value={advertiserName}
                  onChange={(e) => setAdvertiserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Numéro de Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+216 44 203 500"
                  value={advertiserPhone}
                  onChange={(e) => setAdvertiserPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Budget Prévu (DT)
                </label>
                <input
                  type="number"
                  value={priceDt}
                  onChange={(e) => setPriceDt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="marketing">Digital Marketing</option>
                  <option value="sponsoring">Sponsoring Meta</option>
                  <option value="video">Vidéo / Reels</option>
                  <option value="web">Site Web / Promo</option>
                </select>
              </div>
            </div>

            {/* Photos & Visuals Upload */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Photos du Projet ou de l'Offre ({uploadedImages.length})</span>
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:bg-blue-600/50 text-[11px] font-semibold transition-all">
                  <Upload className="w-3 h-3" />
                  <span>Choisir photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL add fallback */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou collez une URL d'image (https://...)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Ajouter
                </button>
              </div>

              {/* Thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-square">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 p-1 rounded bg-rose-600/90 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Retirer cette photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lien de la Vidéo (YouTube / TikTok / Google Drive / MP4) - optionnel
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Localisation à Sfax (Tunisie)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) setMapAddress(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>-- Sélectionner une zone de Sfax --</option>
                {SFAX_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Ex : Sfax, Route de Téniour Km 3"
                value={mapAddress}
                onChange={(e) => setMapAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description et détails de l'offre
              </label>
              <textarea
                rows={3}
                placeholder="Expliquez ce que vous souhaitez promouvoir..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs resize-none focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {loading ? 'Transmission...' : 'Envoyer pour Examen (Pending)'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
