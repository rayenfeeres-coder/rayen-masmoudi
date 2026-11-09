import React, { useState } from 'react';
import { Phone, Shield, MessageCircle, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenOrder: (serviceId?: number) => void;
  onNavigateAdmin: () => void;
  lang: 'fr' | 'ar';
  setLang: (l: 'fr' | 'ar') => void;
  phone: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOrder,
  onNavigateAdmin,
  lang,
  setLang,
  phone
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#05070d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark & Official Logo */}
        <a href="#" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden ring-1 ring-blue-500/30 bg-slate-900 flex items-center justify-center p-0.5">
            <img
              src="/assets/aistudio/618809252_122152568102903553_3023622513410630720_n__2__f340369a.jpg"
              alt="Rayen Masmoudi Digital Logo"
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Graceful fallback if image path isn't reached
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold tracking-tight text-white whitespace-nowrap">
              RAYEN MASMOUDI
            </span>
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase -mt-0.5 whitespace-nowrap">
              DIGITAL AGENCY
            </span>
          </div>
        </a>

        {/* Zone 2: 4–5 Clean Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#annonces" className="hover:text-cyan-400 transition-colors whitespace-nowrap">
            {lang === 'ar' ? 'الإعلانات' : 'Annonces'}
          </a>
          <a href="#services" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            {lang === 'ar' ? 'الخدمات' : 'Nos Services'}
          </a>
          <a href="#tarifs" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            {lang === 'ar' ? 'الأسعار' : 'Tarifs & Packs'}
          </a>
          <a href="#portfolio" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            {lang === 'ar' ? 'أعمالنا' : 'Portfolio'}
          </a>
          <a href="#contact" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            {lang === 'ar' ? 'اتصل بنا' : 'Contact'}
          </a>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Toggle (FR / AR) */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white hover:border-blue-500 transition-colors whitespace-nowrap"
            title="Changer la langue / تغيير اللغة"
          >
            {lang === 'fr' ? '🇹🇳 عربي' : '🇫🇷 FR'}
          </button>

          {/* Quick WhatsApp contact */}
          <a
            href="https://wa.me/21644203500"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-lg hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Admin Dashboard Entry Link */}
          <button
            onClick={onNavigateAdmin}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Espace Administration (/admin)"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Primary CTA Button */}
          <button
            onClick={() => onOpenOrder()}
            className="px-4 py-2.5 text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all duration-200 whitespace-nowrap active:scale-95"
          >
            {lang === 'ar' ? 'اطلب الآن' : 'Commander maintenant'}
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#080d1a] px-4 pt-3 pb-5 space-y-3">
          <a
            href="#annonces"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-cyan-400 hover:bg-slate-800/80 rounded-lg"
          >
            {lang === 'ar' ? 'الإعلانات' : 'Annonces'}
          </a>
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg"
          >
            {lang === 'ar' ? 'الخدمات' : 'Nos Services'}
          </a>
          <a
            href="#tarifs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg"
          >
            {lang === 'ar' ? 'الأسعار' : 'Tarifs & Packs'}
          </a>
          <a
            href="#portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg"
          >
            {lang === 'ar' ? 'أعمالنا' : 'Portfolio'}
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 rounded-lg"
          >
            {lang === 'ar' ? 'اتصل بنا' : 'Contact'}
          </a>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800/60 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{phone}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAdmin();
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Accès Tableau de Bord Admin (/admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
