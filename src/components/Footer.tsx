import React from 'react';
import { Settings } from '../types';
import { Shield, Phone, Mail, MapPin, MessageCircle, Facebook, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: Settings;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigateAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#030509] border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/30 bg-slate-900 flex items-center justify-center p-0.5">
                <img
                  src="/assets/aistudio/618809252_122152568102903553_3023622513410630720_n__2__f340369a.jpg"
                  alt="Rayen Masmoudi Digital Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight">
                  RAYEN MASMOUDI
                </span>
                <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
                  DIGITAL AGENCY · SFAX
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-['Cairo'] max-w-sm">
              "مش خدمات فقط... نتائج تُقاس."
              <br />
              Agence digitale leader à Sfax spécialisée dans la création de campagnes publicitaires à fort impact, le montage vidéo dynamique et l'acquisition de clients.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:bg-emerald-600 flex items-center justify-center transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={settings.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 hover:text-white hover:bg-blue-600 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.email}`}
                className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Navigation
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Nos 9 Services
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-white transition-colors">
                  Grille des Tarifs en DT
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors">
                  Portfolio &amp; Réalisations
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contactez l'Agence
                </a>
              </li>
            </ul>
          </div>

          {/* Core Services */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Prestations Clés
            </div>
            <ul className="space-y-2 text-xs">
              <li>Digital Marketing</li>
              <li>Sponsoring Meta (FB &amp; IG)</li>
              <li>Montage Vidéo Professionnel</li>
              <li>Création Site Web</li>
              <li>Création Logo &amp; Branding</li>
            </ul>
          </div>

          {/* Contact Details & Admin */}
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Coordonnées
            </div>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{settings.email}</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-slate-900">
              <button
                onClick={onNavigateAdmin}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Espace Gérant (/admin)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} {settings.agency_name} · Tous droits réservés. Sfax, Tunisie.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Haut de page</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
