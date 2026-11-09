import React, { useState } from 'react';
import { PricePlan } from '../types';
import { Check, ArrowRight, Tag, Sparkles, ShieldAlert, Monitor, Smartphone, Layers, Flame, Tv } from 'lucide-react';

interface PricingSectionProps {
  prices: PricePlan[];
  lang: 'fr' | 'ar';
  currency: string;
  onSelectPlan: (plan: PricePlan) => void;
  onOpenCustomQuote: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  prices,
  lang,
  currency,
  onSelectPlan,
  onOpenCustomQuote,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SFAX2026') {
      setDiscountPercent(20);
      setCouponMessage('Code SFAX2026 appliqué : -20% sur tous les forfaits !');
    } else if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponMessage('Code WELCOME10 appliqué : -10% de réduction de bienvenue !');
    } else {
      setDiscountPercent(0);
      setCouponMessage('Code promo invalide. Essayez SFAX2026.');
    }
  };

  const categories = [
    { id: 'all', label: lang === 'ar' ? 'جميع الباقات' : 'Toutes les Offres', icon: Layers },
    { id: 'kick', label: lang === 'ar' ? '🟢 Kick Growth Premium' : '🟢 Kick Growth', icon: Tv },
    { id: 'web', label: lang === 'ar' ? '🌐 مواقع إلكترونية (300 - 800 DT)' : '🌐 Sites Web', icon: Monitor },
    { id: 'app', label: lang === 'ar' ? '📱 تطبيقات جوال (500 - 1500 DT)' : '📱 Applications', icon: Smartphone },
    { id: 'combo', label: lang === 'ar' ? '⭐ باقة موقع + تطبيق (1500 DT)' : '⭐ Pack Combo', icon: Sparkles },
    { id: 'starter', label: lang === 'ar' ? '⚡ باقات سريعة (30 - 250 DT)' : '⚡ Packs Rapides', icon: Flame },
  ];

  const filteredPrices = prices.filter((plan) => {
    if (selectedCategory === 'all') return true;
    return plan.category === selectedCategory;
  });

  return (
    <section id="tarifs" className="py-20 bg-[#080d1a] relative border-b border-slate-800/80">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
            <span>PRIX OFFICIELS EN DINARS TUNISIENS (DT / TND)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {lang === 'ar' ? 'باقات وأسعار الخدمات الرسمية' : 'Nos Tarifs & Packs Clé en Main'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-['Cairo']">
            {lang === 'ar'
              ? 'أسعار واضحة ومحددة بالدينار التونسي DT لكافة خدمات المواقع، التطبيقات، وإدارة قنوات Kick، بدون أي تكاليف مخفية.'
              : 'Des formules claires adaptées aux créateurs, commerces et PME en Tunisie. Tarifs transparents en Dinars Tunisiens.'}
          </p>

          {/* Strict Terms Notice Banner (User's Exact Requirement) */}
          <div className="mt-8 p-3.5 sm:p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-center shadow-xl">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs sm:text-sm font-bold text-amber-200 font-['Cairo'] flex flex-wrap items-center justify-center gap-2">
              <span>💵 الدفع حسب الاتفاق وقبل بداية الخدمة / المشروع</span>
              <span className="hidden sm:inline text-amber-500">•</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold shadow-sm">
                🚫 ممنوع الكريدي
              </span>
            </div>
          </div>

          {/* Promo code bar */}
          <div className="mt-6 max-w-md mx-auto p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400 ml-2 shrink-0" />
            <input
              type="text"
              placeholder="Code Promo (ex: SFAX2026)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none flex-1 uppercase"
            />
            <button
              onClick={applyCoupon}
              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shrink-0"
            >
              Appliquer
            </button>
          </div>
          {couponMessage && (
            <p className={`mt-2 text-xs font-medium ${discountPercent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {couponMessage}
            </p>
          )}

          {/* Interactive Category Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-4xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrices.map((plan) => {
            const calculatedPrice = discountPercent > 0
              ? Math.round(plan.price_dt * (1 - discountPercent / 100))
              : plan.price_dt;

            const isKick = plan.category === 'kick';
            const isCombo = plan.category === 'combo';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl flex flex-col justify-between p-6 transition-all duration-300 hover:scale-[1.01] ${
                  isKick
                    ? 'bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/80 shadow-2xl shadow-emerald-900/30'
                    : isCombo
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-2xl shadow-amber-900/30'
                    : plan.is_featured
                    ? 'bg-gradient-to-b from-blue-950/70 to-slate-900 border-2 border-blue-500 shadow-xl shadow-blue-900/30'
                    : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Badge if featured or custom badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow whitespace-nowrap ${
                      isKick
                        ? 'bg-emerald-600 text-white border border-emerald-400'
                        : isCombo
                        ? 'bg-amber-500 text-slate-950 border border-amber-300'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1 mt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isKick ? 'Streaming & Growth' : isCombo ? 'Offre Combinée' : plan.category === 'web' ? 'Site Web' : plan.category === 'app' ? 'Application' : 'Service Rapide'}
                    </span>
                    {isKick && (
                      <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-[10px] font-extrabold animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white font-['Cairo']">
                    {lang === 'ar' && plan.plan_name_ar ? plan.plan_name_ar : plan.plan_name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 min-h-[34px] line-clamp-2 font-['Cairo']">
                    {plan.description}
                  </p>

                  {/* Price display with DT and discount */}
                  <div className="mt-5 pb-5 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                        {calculatedPrice}
                      </span>
                      <span className="text-sm font-bold text-cyan-400 uppercase">
                        {currency}
                      </span>
                      {isKick && <span className="text-xs text-slate-400 font-semibold">/ شهر</span>}
                    </div>

                    {(plan.old_price_dt || discountPercent > 0) && (
                      <div className="text-xs text-slate-500 line-through mt-0.5 tabular-nums">
                        Ancien prix : {plan.old_price_dt || plan.price_dt} {currency}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 mt-1 font-medium font-['Cairo']">
                      {plan.billing_cycle}
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-200 font-['Cairo']">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isKick ? 'text-emerald-400' : isCombo ? 'text-amber-400' : 'text-blue-400'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Select Button & Terms Reminder */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-2">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                      isKick
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                        : isCombo
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/30'
                        : plan.is_featured
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{lang === 'ar' ? 'طلب هذه الباقة' : 'Commander ce pack'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center text-[10px] text-slate-500 font-['Cairo']">
                    💵 الدفع مسبقاً — 🚫 بدون كريدي
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Custom Quote / Sur Mesure Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white font-['Cairo']">
                {lang === 'ar' ? 'هل لديك مشروع خاص أو متطلبات مخصصة ؟' : 'Besoin d\'un devis sur mesure ou d\'un pack personnalisé ?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 font-['Cairo'] mt-1">
                {lang === 'ar'
                  ? 'نوفر حلولاً مخصصة لأصحاب الشركات والمتاجر والستريمرز مع ضمان أعلى نتائج وجودة عالمية في صفاقس وكامل تونس.'
                  : 'Nous adaptons nos livrables à vos exigences spécifiques : spots publicitaires, sponsoring illimité, site sur mesure.'}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenCustomQuote}
            className="px-6 py-3.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all whitespace-nowrap active:scale-95 shadow-lg shadow-blue-600/30"
          >
            {lang === 'ar' ? 'طلب استشارة أو عرض سعر' : 'Demander un devis sur mesure'}
          </button>
        </div>

      </div>
    </section>
  );
};
