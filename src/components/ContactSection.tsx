import React, { useState } from 'react';
import { Settings, WorkingHoursConfig } from '../types';
import { api } from '../services/api';
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle2, Globe, Facebook, Clock, ExternalLink } from 'lucide-react';

interface ContactSectionProps {
  settings: Settings;
  workingHours?: WorkingHoursConfig;
  lang: 'fr' | 'ar';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, workingHours, lang }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Veuillez remplir votre nom, téléphone et votre message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.sendMessage({
        sender_name: name,
        sender_phone: phone,
        sender_email: email,
        subject: subject || 'Prise de contact depuis le site',
        message: message,
      });

      if (res.success) {
        setSentSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(res.message || 'Une erreur est survenue.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const rawPhone = settings.phone.replace(/\s+/g, '');
  const lat = settings.default_latitude || 34.7406;
  const lng = settings.default_longitude || 10.7603;

  return (
    <section id="contact" className="py-20 bg-[#080d1a] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">
            <span>CONTACT RAPIDE · SFAX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {lang === 'ar' ? 'تواصل مع Rayen Masmoudi Digital' : 'Contactez Notre Agence'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-['Cairo']">
            {lang === 'ar'
              ? 'نحن هنا للإجابة عن جميع استفساراتك وتقديم استشارة مجانية حول أفضل حل رقمي يناسب مشروعك.'
              : 'Discutons ensemble de vos objectifs publicitaires et de croissance. Réponse garantie sous 24 heures.'}
          </p>
        </div>

        {/* 2-Column Split: Agency Contact Info + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Coordonnées & Horaires & 4 Direct Action Buttons */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Rayen Masmoudi Digital</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-['Cairo']">
                  Agence spécialisée en Digital Marketing, Video Ads, Sponsoring et Régie Publicitaire à Sfax, Tunisie.
                </p>
              </div>

              {/* Direct Info List */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Emplacement &amp; Agence</div>
                    <div className="text-sm font-semibold text-white">{settings.address}</div>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                      GPS: {lat}, {lng}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Téléphone Direct</div>
                    <a href={`tel:${rawPhone}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Email Officiel</div>
                    <a href={`mailto:${settings.email}`} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>

                {/* Working Hours Display */}
                {workingHours && (
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-cyan-400 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Horaires d'Ouverture</div>
                      <div className="text-xs font-semibold text-white mt-0.5">
                        Lun - Ven : 08:30 - 18:30 · Sam : 09:00 - 14:00
                      </div>
                      {workingHours.emergency_support_247 && (
                        <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          Support WhatsApp 24/7 disponible
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {settings.payment_terms_ar && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-bold font-['Cairo'] flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>{lang === 'ar' ? settings.payment_terms_ar : (settings.payment_terms || settings.payment_terms_ar)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4 User-Requested Quick Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Canaux Directs
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>

                <a
                  href={`tel:${rawPhone}`}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Appeler</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form + Google Maps Readiness Box */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-8 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {lang === 'ar' ? 'أرسل رسالة سريعة' : 'Envoyer un Message Direct'}
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-['Cairo']">
                  {lang === 'ar'
                    ? 'املأ النموذج التالي وسيقوم فريق العمل بالرد عليك ومساعدتك في اختيار الخدمة المثالية.'
                    : 'Remplissez le formulaire ci-dessous pour toute question, demande de partenariat ou devis.'}
                </p>

                {sentSuccess ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-white">Message Reçu !</h4>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-['Cairo']">
                      Merci pour votre message. Rayen Masmoudi a bien reçu vos coordonnées et prendra contact avec vous incessamment.
                    </p>
                    <button
                      onClick={() => setSentSuccess(false)}
                      className="mt-6 px-4 py-2 text-xs font-semibold text-blue-400 hover:text-white"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Votre Nom *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Mohamed Trabelsi"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
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
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Sujet
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Devis montage vidéo, Sponsoring..."
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Votre Message *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Comment pouvons-nous vous aider à développer votre activité à Sfax ou en Tunisie ?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500 resize-none font-['Cairo']"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Envoi...' : 'Envoyer le message'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Google Maps Readiness Box */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Localisation Géographique (Sfax, Tunisie)</div>
                  <div className="text-[11px] text-slate-400">
                    Coordonnées : Lat {lat} · Long {lng} · Structure prête pour Google Maps Platform
                  </div>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <span>Ouvrir sur la carte</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
