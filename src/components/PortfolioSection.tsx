import React, { useState } from 'react';
import { PortfolioItem } from '../types';
import { ExternalLink, Play, Eye, Award } from 'lucide-react';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
  lang: 'fr' | 'ar';
  onOrderSimilar: (item: PortfolioItem) => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolio,
  lang,
  onOrderSimilar,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const categories = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'Tous' },
    { id: 'video', label: lang === 'ar' ? 'فيديوهات ومونتاج' : 'Vidéos & Montage' },
    { id: 'sponsoring', label: lang === 'ar' ? 'سبونسورينغ' : 'Sponsoring' },
    { id: 'logo', label: lang === 'ar' ? 'لوجوهات' : 'Logos' },
    { id: 'affiche', label: lang === 'ar' ? 'ملصقات' : 'Affiches' },
    { id: 'web', label: lang === 'ar' ? 'مواقع ويب' : 'Sites Web' },
    { id: 'app', label: lang === 'ar' ? 'تطبيقات' : 'Applications' },
  ];

  const filteredItems = portfolio.filter((item) => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <section id="portfolio" className="py-20 bg-[#05070d] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
            <span>RÉSULTATS PROUVÉS · TUNISIE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {lang === 'ar' ? 'معرض أعمالنا وإنجازاتنا' : 'Notre Portfolio & Réalisations'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-['Cairo']">
            {lang === 'ar'
              ? 'نماذج حقيقية لحملات تسويقية، مونتاج فيديو، تصاميم، ومواقع إلكترونية صنعت الفارق لحرفائنا في صفاقس وكامل تونس.'
              : 'Des créations dynamiques et des campagnes qui génèrent de la visibilité, de l\'engagement et des conversions concrètes.'}
          </p>

          {/* Filter Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl max-w-3xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  filter === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col shadow-lg"
            >
              {/* Media Preview Container */}
              <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Category tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  {item.category}
                </div>

                {/* Metric badge if available */}
                {item.results_metric && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    <span>{item.results_metric}</span>
                  </div>
                )}

                {/* Hover Quick View Overlay */}
                <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-3 rounded-full bg-white text-slate-950 hover:bg-blue-400 hover:text-white transition-colors shadow-lg"
                    title="Voir les détails"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Information */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">
                    Client : <span className="text-slate-300 font-semibold">{item.client_name}</span>
                  </div>
                  <h3 className="mt-1.5 text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onOrderSimilar(item)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Commander un projet similaire</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Lightbox for item details */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="relative h-72 w-full bg-black">
                <img
                  src={selectedItem.media_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {selectedItem.category} · {selectedItem.client_name}
                  </span>
                  {selectedItem.results_metric && (
                    <span className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs font-bold">
                      {selectedItem.results_metric}
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-2xl font-bold text-white">{selectedItem.title}</h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed font-['Cairo']">
                  {selectedItem.description}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      const itm = selectedItem;
                      setSelectedItem(null);
                      onOrderSimilar(itm);
                    }}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-colors"
                  >
                    Commander ce type de service
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
