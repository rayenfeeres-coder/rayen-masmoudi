import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, PhoneCall, TrendingUp, Zap } from 'lucide-react';
import { ThreeHeroCanvas } from './ThreeHeroCanvas';
import { Settings, ContentBlock } from '../types';

interface HeroProps {
  settings: Settings;
  lang: 'fr' | 'ar';
  onOpenOrder: () => void;
  contentBlocks?: ContentBlock[];
}

export const Hero: React.FC<HeroProps> = ({ settings, lang, onOpenOrder, contentBlocks = [] }) => {
  const titleBlock = contentBlocks.find((b) => b.id === 'block_hero_title' && b.is_visible);
  const descBlock = contentBlocks.find((b) => b.id === 'block_hero_desc' && b.is_visible);

  const heroMotto = lang === 'ar'
    ? (titleBlock?.content_ar || titleBlock?.content || settings.tagline || 'مش خدمات فقط... نتائج تُقاس.')
    : (titleBlock?.content || settings.tagline || 'مش خدمات فقط... نتائج تُقاس.');

  const heroBadge = titleBlock?.badge || settings.sub_tagline || 'Digital Marketing & Video Ads';

  const heroDescription = lang === 'ar'
    ? (descBlock?.content_ar || descBlock?.content || settings.hero_description || 'نساعدك على تطوير مشروعك، جذب الحرفاء، وزيادة مبيعاتك عبر الحلول الرقمية الحديثة.')
    : (descBlock?.content || settings.hero_description || 'نساعدك على تطوير مشروعك، جذب الحرفاء، وزيادة مبيعاتك عبر الحلول الرقمية الحديثة.');
  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-20 border-b border-slate-800/60">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Announcement Banner */}
        {settings.announcement_active && settings.announcement_text && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs md:text-sm text-blue-200">
              <span className="font-medium">{settings.announcement_text}</span>
            </div>
          </div>
        )}

        {/* 2-Column Desktop Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call-to-Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-center lg:text-left">
            
            {/* Agency Badge */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-xs md:text-sm font-semibold text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>RAYEN MASMOUDI DIGITAL · SFAX, TUNISIE</span>
            </div>

            {/* Main Headline (User's Exact Motto, dynamic via CMS) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              <span className="block font-serif text-3xl sm:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white pb-2 font-['Cairo']">
                "{heroMotto}"
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-slate-100 font-bold mt-1">
                {heroBadge}
              </span>
            </h1>

            {/* Sub-Headline & Value Proposition */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-['Cairo']">
              {heroDescription}
            </p>

            {/* Key Deliverables Checkpoints */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Ciblage Précis Tunisie</span>
              </div>
              <span className="hidden sm:inline text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Montage Vidéo Ads Haute Conversion</span>
              </div>
              <span className="hidden sm:inline text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Tarifs Transparents en Dinars (DT)</span>
              </div>
            </div>

            {/* 3 User-Requested Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              {/* Button 1: Commander maintenant */}
              <button
                onClick={onOpenOrder}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>{lang === 'ar' ? 'اطلب خدمتك الآن' : 'Commander maintenant'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Button 2: Découvrir nos services */}
              <a
                href="#services"
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>{lang === 'ar' ? 'استكشف خدماتنا' : 'Découvrir nos services'}</span>
              </a>

              {/* Button 3: Contactez-nous */}
              <a
                href="#contact"
                className="w-full sm:w-auto px-5 py-3.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تواصل معنا' : 'Contactez-nous'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: 3D Rocket Space Canvas */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-[500px]">
              <ThreeHeroCanvas />
            </div>

            {/* Floating Luxury Spec Card at bottom-right of 3D scene */}
            <div className="absolute -bottom-4 right-2 sm:right-6 bg-slate-900/90 border border-blue-500/30 rounded-xl p-3 shadow-2xl backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-400">ROI Marketing Moyen</div>
                <div className="text-sm font-bold text-white tabular-nums">+240% Croissance Ventes</div>
              </div>
            </div>
          </div>

        </div>

        {/* Full-width Metrics Row (Placed below 2-column split according to design rules) */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">+180</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Projets Livrés en Tunisie</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tabular-nums">98.4%</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Taux de Satisfaction</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 tabular-nums">+2.4M</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Vues Vidéos Générées</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">Sfax &amp; TN</div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Agence 100% Tunisienne</div>
          </div>
        </div>

      </div>
    </section>
  );
};
