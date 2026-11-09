import React, { useState } from 'react';
import { AdItem, NotificationItem } from '../types';
import { X, Search, CheckCircle2, Clock, XCircle, AlertCircle, Phone, Calendar } from 'lucide-react';

interface AdStatusTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ads: AdItem[];
  notifications: NotificationItem[];
  lang: 'fr' | 'ar';
}

export const AdStatusTrackerModal: React.FC<AdStatusTrackerModalProps> = ({
  isOpen,
  onClose,
  ads,
  notifications,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();
  const matchedAds = ads.filter((ad) => {
    if (!cleanQuery) return false;
    return (
      ad.advertiser_phone.includes(cleanQuery) ||
      ad.advertiser_name.toLowerCase().includes(cleanQuery) ||
      `ad-${ad.id}`.toLowerCase().includes(cleanQuery) ||
      ad.id.toString() === cleanQuery
    );
  });

  const matchedNotifs = notifications.filter((n) => {
    if (!cleanQuery) return false;
    return (n.recipient_phone && n.recipient_phone.includes(cleanQuery)) ||
           (n.recipient_name && n.recipient_name.toLowerCase().includes(cleanQuery));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">
          {lang === 'ar' ? 'تتبع حالة طلب الإعلان' : 'Suivi de Votre Demande d\'Annonce'}
        </h3>
        <p className="text-xs text-slate-400 mb-5 font-['Cairo']">
          {lang === 'ar'
            ? 'أدخل رقم هاتفك أو كود الإعلان لمعرفة هل تمت مراجعته (Pending / Accepted / Rejected).'
            : 'Saisissez votre numéro de téléphone ou l\'identifiant de l\'annonce (ex : +216 98 123 456 ou AD-1).'}
        </p>

        {/* Search input */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Ex : +216 98 123 456 ou AD-1..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setHasSearched(true);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setHasSearched(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Vérifier
          </button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {matchedAds.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                Aucune annonce trouvée avec ce critère. Vérifiez votre numéro ou contactez l'agence.
              </div>
            ) : (
              matchedAds.map((ad) => (
                <div key={ad.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-xs">AD-{ad.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                        ad.status === 'accepted'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : ad.status === 'rejected'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {ad.status === 'accepted' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Acceptée &amp; Publiée</span>
                        </>
                      ) : ad.status === 'rejected' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refusée</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>En attente de revue (Pending)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{ad.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ad.description}</p>
                  </div>

                  {ad.status === 'rejected' && ad.rejection_reason && (
                    <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/40 text-xs text-rose-300">
                      <strong>Motif communiqué par l'administrateur :</strong>
                      <p className="mt-0.5 text-[11px]">{ad.rejection_reason}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80 flex justify-between">
                    <span>Créée le : {new Date(ad.created_at).toLocaleDateString('fr-TN')}</span>
                    <span>Annonceur : {ad.advertiser_name}</span>
                  </div>
                </div>
              ))
            )}

            {/* Notifications history */}
            {matchedNotifs.length > 0 && (
              <div className="pt-2">
                <h5 className="text-xs font-bold text-slate-300 mb-2">Historique des notifications reçues :</h5>
                <div className="space-y-2">
                  {matchedNotifs.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="font-bold text-white">{n.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
