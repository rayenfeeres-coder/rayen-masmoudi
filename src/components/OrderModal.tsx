import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Service, PricePlan, Order } from '../types';
import { api } from '../services/api';
import { X, CheckCircle, Tag, ShoppingCart, MessageCircle, AlertCircle } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  prices: PricePlan[];
  selectedService?: Service | null;
  selectedPlan?: PricePlan | null;
  currency: string;
  lang: 'fr' | 'ar';
  onOrderCreated: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  services,
  prices,
  selectedService,
  selectedPlan,
  currency,
  lang,
  onOrderCreated,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [serviceTitle, setServiceTitle] = useState<string>('');
  const [basePrice, setBasePrice] = useState<number>(50);
  const [promoCode, setPromoCode] = useState('');
  const [discountDt, setDiscountDt] = useState<number>(0);
  const [promoFeedback, setPromoFeedback] = useState<string>('');
  const [details, setDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Sync initial state on open
  useEffect(() => {
    if (!isOpen) {
      setSuccessOrder(null);
      setError(null);
      return;
    }

    if (selectedService) {
      setServiceId(selectedService.id);
      setServiceTitle(selectedService.title);
      setBasePrice(selectedService.price_dt);
    } else if (selectedPlan) {
      setServiceId(999000 + selectedPlan.id);
      setServiceTitle(selectedPlan.plan_name);
      setBasePrice(selectedPlan.price_dt);
    } else if (services.length > 0) {
      setServiceId(services[0].id);
      setServiceTitle(services[0].title);
      setBasePrice(services[0].price_dt);
    }
  }, [isOpen, selectedService, selectedPlan, services]);

  // Recalculate price when service changes
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setServiceId(val);

    const s = services.find((item) => item.id === val);
    if (s) {
      setServiceTitle(s.title);
      setBasePrice(s.price_dt);
    } else {
      const p = prices.find((item) => 999000 + item.id === val);
      if (p) {
        setServiceTitle(p.plan_name);
        setBasePrice(p.price_dt);
      }
    }
  };

  // Promo code validation
  const checkPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SFAX2026') {
      const disc = Math.round(basePrice * 0.2);
      setDiscountDt(disc);
      setPromoFeedback(`Code SFAX2026 appliqué : -${disc} ${currency} (20%)`);
    } else if (code === 'BOOST50' && basePrice >= 100) {
      setDiscountDt(50);
      setPromoFeedback(`Code BOOST50 appliqué : -50 ${currency}`);
    } else if (code === 'WELCOME10') {
      const disc = Math.round(basePrice * 0.1);
      setDiscountDt(disc);
      setPromoFeedback(`Code WELCOME10 appliqué : -${disc} ${currency} (10%)`);
    } else {
      setDiscountDt(0);
      setPromoFeedback('Code promo non valide pour cette commande.');
    }
  };

  const finalPrice = Math.max(0, basePrice - discountDt);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setError('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createOrder({
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        service_id: typeof serviceId === 'number' ? serviceId : undefined,
        service_title: serviceTitle || 'Service Digital Marketing',
        price_dt: basePrice,
        details: details,
        promo_code: discountDt > 0 ? promoCode : undefined,
      });

      if (result.success && result.order) {
        setSuccessOrder(result.order);
        onOrderCreated(result.order);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'enregistrement.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successOrder ? (
          /* SUCCESS CONFIRMATION SCREEN */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-500/10">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">
              {lang === 'ar' ? 'تم تأكيد طلبك بنجاح !' : 'Commande Confirmée !'}
            </h3>

            <p className="mt-2 text-sm text-slate-300 font-['Cairo']">
              {lang === 'ar'
                ? 'شكراً لك، سيتواصل معك Rayen Masmoudi مباشرة لتأكيد التفاصيل وبدء التنفيذ فوراً.'
                : 'Merci pour votre confiance. Rayen Masmoudi va prendre contact avec vous très rapidement.'}
            </p>

            {/* Order Receipt Box */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Numéro de commande :</span>
                <span className="font-mono text-cyan-400 font-bold">{successOrder.order_code}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Service :</span>
                <span className="text-white font-medium">{successOrder.service_title}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Client :</span>
                <span className="text-white font-medium">{successOrder.client_name} ({successOrder.client_phone})</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total à régler :</span>
                <span className="text-blue-400 tabular-nums">{successOrder.total_dt} {currency}</span>
              </div>
            </div>

            {/* Direct WhatsApp button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`https://wa.me/21644203500?text=${encodeURIComponent(
                  `Bonjour Rayen, je viens de passer la commande ${successOrder.order_code} pour ${successOrder.service_title} (${successOrder.total_dt} DT). Nom: ${successOrder.client_name}, Tél: ${successOrder.client_phone}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Envoyer confirmation sur WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          /* ORDER FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'ar' ? 'طلب خدمة رقمية' : 'Commander un Service'}
                </h3>
                <p className="text-xs text-slate-400">
                  Rayen Masmoudi Digital · Sfax, Tunisie
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Service ou Pack souhaité *
              </label>
              <select
                value={serviceId}
                onChange={handleServiceChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <optgroup label="⭐ Services & Solutions Numériques">
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' && s.title_ar ? s.title_ar : s.title} — {s.price_dt} {currency}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="💎 Forfaits & Packs Tarifs">
                  {prices.map((p) => (
                    <option key={p.id} value={999000 + p.id}>
                      {lang === 'ar' && p.plan_name_ar ? p.plan_name_ar : p.plan_name} — {p.price_dt} {currency} {p.category === 'kick' ? '/ mois' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Client Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nom complet ou Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Ahmed Ben Salem / Patisserie Le Gourmet"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
              />
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Numéro de téléphone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+216 44 203 500"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Details / Brief */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Détails de votre demande ou objectif
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez votre activité, vos attentes, vos liens de page Facebook/Instagram..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none placeholder-slate-500 resize-none font-['Cairo']"
              />
            </div>

            {/* Coupon Code Section */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code promo (ex: SFAX2026)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs uppercase focus:outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={checkPromo}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Valider
                </button>
              </div>
              {promoFeedback && (
                <div className={`text-[11px] font-medium ${discountDt > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {promoFeedback}
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total estimé :</span>
                {discountDt > 0 && (
                  <span className="text-xs text-slate-500 line-through mr-2">
                    {basePrice} {currency}
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
                  {finalPrice} {currency}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-amber-300 block font-['Cairo']">💵 الدفع قبل بداية المشروع</span>
                <span className="text-[10px] text-rose-400 font-extrabold block font-['Cairo']">🚫 ممنوع الكريدي</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer la commande'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
