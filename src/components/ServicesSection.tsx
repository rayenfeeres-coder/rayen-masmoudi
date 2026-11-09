import React, { useState } from 'react';
import { Service } from '../types';
import { Check, ArrowRight, Clock, Star, Flame } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  lang: 'fr' | 'ar';
  currency: string;
  onSelectService: (service: Service) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  lang,
  currency,
  onSelectService,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: lang === 'ar' ? `جميع الخدمات (${services.length})` : `Tous nos services (${services.length})` },
    { id: 'marketing', label: lang === 'ar' ? 'تسويق وإعلانات' : 'Marketing & Ads' },
    { id: 'video', label: lang === 'ar' ? 'مونتاج فيديو و Kick' : 'Montage & Kick' },
    { id: 'web', label: lang === 'ar' ? 'مواقع وتطبيقات' : 'Web & Mobile' },
    { id: 'design', label: lang === 'ar' ? 'تصميم وهوية' : 'Design & Branding' },
  ];

  const filteredServices = services.filter((s) => {
    if (!s.is_active) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'marketing') return s.category === 'marketing' || s.category === 'ads' || s.category === 'social';
    if (activeCategory === 'video') return s.category === 'video' || s.category === 'kick';
    if (activeCategory === 'web') return s.category === 'web' || s.category === 'app' || s.category === 'combo';
    if (activeCategory === 'design') return s.category === 'design';
    return true;
  });

  return (
    <section id="services" className="py-20 bg-[#05070d] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">
            <span>EXPERTISE DIGITALE · SFAX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {lang === 'ar' ? 'خدماتنا الرقمية المتكاملة' : 'Nos Services Professionnels'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-['Cairo']">
            {lang === 'ar'
              ? 'حلول تسويقية وإنتاجية متطورة مصممة لمضاعفة مبيعاتك وجذب حرفاء ذوي قيمة عالية في صفاقس وكامل تونس.'
              : 'Des solutions sur mesure conçues pour générer des résultats mesurables, accroître votre visibilité et convertir vos prospects.'}
          </p>

          {/* Interactive Category Filter Pills (Button tabs allowed per design guide §1.A) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl max-w-2xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Services Grid (3 Columns on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, idx) => (
            <div
              key={service.id}
              className="group relative rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-blue-500/50 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-900/20"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Popular or Delivery Time Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {service.is_popular && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-xs font-bold">
                      <Flame className="w-3 h-3" />
                      <span>Recommandé</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-slate-300 text-xs font-medium">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{service.delivery_time}</span>
                  </div>
                </div>

                {/* Price Sticker */}
                <div className="absolute bottom-3 right-3 text-right">
                  {service.old_price_dt && (
                    <span className="block text-xs line-through text-slate-400 font-semibold tabular-nums">
                      {service.old_price_dt} {currency}
                    </span>
                  )}
                  <div className="inline-block px-3 py-1 rounded-lg bg-blue-600/90 text-white font-extrabold text-sm sm:text-base tabular-nums shadow-lg">
                    {service.price_dt} {currency}
                  </div>
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed category metadata with separator */}
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
                    <span>{`0${idx + 1}`}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    <span>{service.category.toUpperCase()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {lang === 'ar' && service.title_ar ? service.title_ar : service.title}
                  </h3>

                  <p className="mt-2.5 text-sm text-slate-400 line-clamp-3 leading-relaxed font-['Cairo']">
                    {lang === 'ar' && service.description_ar ? service.description_ar : service.description}
                  </p>

                  {/* Feature Highlights */}
                  {service.features && service.features.length > 0 && (
                    <ul className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Commander Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => onSelectService(service)}
                    className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center justify-center gap-2 group/btn active:scale-95 shadow-md shadow-blue-600/20"
                  >
                    <span>{lang === 'ar' ? 'اطلب هذه الخدمة' : 'Commander'}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
