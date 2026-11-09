import React, { useState } from 'react';
import { AdItem } from '../types';
import { Megaphone, Calendar, MapPin, Video, ExternalLink, Sparkles, CheckCircle2, ChevronRight, Tag } from 'lucide-react';

interface AdsShowcaseSectionProps {
  ads: AdItem[];
  lang: 'fr' | 'ar';
  currency: string;
  onOpenAdSubmission: () => void;
  onOpenStatusCheck: () => void;
}

export const AdsShowcaseSection: React.FC<AdsShowcaseSectionProps> = ({
  ads,
  lang,
  currency,
  onOpenAdSubmission,
  onOpenStatusCheck,
}) => {
  // Only show active, published and non-paused ads on the public website
  const publishedAds = ads.filter((ad) => ad.is_published && !ad.is_paused && ad.status === 'accepted');
  const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

  return (
    <section id="annonces" className="py-20 bg-[#060a14] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
              <Megaphone className="w-3.5 h-3.5" />
              <span>CAMPAGNES &amp; ANNONCES ACTIVES · SFAX &amp; TN</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'ar' ? 'الإعلانات والحملات الممولة النشطة' : 'Campagnes Publicitaires à la Une'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl font-['Cairo']">
              {lang === 'ar'
                ? 'استعرض أحدث الإعلانات المعتمدة التي تديرها وكالتنا، أو أرسل إعلانك الخاص لمراجعته ونشره فوراً.'
                : 'Découvrez les annonces sponsorisées en cours gérées par notre régie. Visibilité maximale garantie.'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenStatusCheck}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              {lang === 'ar' ? 'تتبع حالة إعلاني' : 'Suivi de mon annonce'}
            </button>
            <button
              onClick={onOpenAdSubmission}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة إعلان جديد' : 'Déposer une annonce'}</span>
            </button>
          </div>
        </div>

        {/* Ads Cards Grid */}
        {publishedAds.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">Aucune campagne en cours d'affichage</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Soyez le premier à publier votre annonce sponsorisée sur Rayen Masmoudi Digital !
            </p>
            <button
              onClick={onOpenAdSubmission}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Créer votre première annonce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedAds.map((ad) => (
              <div
                key={ad.id}
                className="group relative rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-xl"
              >
                {/* Media Image Showcase with Multi-image indicator */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={ad.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Multi-image indicator badge */}
                  {ad.images && ad.images.length > 1 && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-slate-300 text-[10px] font-bold">
                      +{ad.images.length - 1} photos
                    </div>
                  )}

                  {/* Video indicator */}
                  {ad.video_url && (
                    <a
                      href={ad.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-500 transition-colors shadow-md flex items-center gap-1 text-[11px] font-bold"
                      title="Regarder la vidéo"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Vidéo</span>
                    </a>
                  )}

                  {/* Category */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    {ad.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Par : <strong className="text-white">{ad.advertiser_name}</strong></span>
                      <span className="font-bold text-blue-400 tabular-nums">{ad.price_dt} {currency}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {lang === 'ar' && ad.title_ar ? ad.title_ar : ad.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed font-['Cairo']">
                      {lang === 'ar' && ad.description_ar ? ad.description_ar : ad.description}
                    </p>

                    {/* Custom Elements Badges */}
                    {ad.custom_elements && ad.custom_elements.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {ad.custom_elements.map((el) => (
                          <span
                            key={el.id}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/60 border border-blue-800/40 text-blue-300"
                          >
                            {el.label}: {el.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Info: Map location & Dates */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate max-w-[180px]">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{ad.map_address || 'Sfax, Tunisie'}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Jusqu'au {ad.end_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
