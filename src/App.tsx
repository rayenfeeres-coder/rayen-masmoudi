/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppData, Service, PricePlan, Order, AdItem } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AdsShowcaseSection } from './components/AdsShowcaseSection';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { AdSubmissionModal } from './components/AdSubmissionModal';
import { AdStatusTrackerModal } from './components/AdStatusTrackerModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');

  // Navigation state (Website vs Admin Dashboard)
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  // Modal states
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);

  const [isAdSubmissionOpen, setIsAdSubmissionOpen] = useState(false);
  const [isAdTrackerOpen, setIsAdTrackerOpen] = useState(false);

  // Sync route with URL
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    setIsAdminView(true);
    window.history.pushState(null, '', '/admin');
  };

  const navigateToSite = () => {
    setIsAdminView(false);
    window.history.pushState(null, '', '/');
  };

  // Fetch initial data from backend API
  const loadData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for modal triggers
  const handleOpenOrder = (serviceId?: number) => {
    if (data?.services && typeof serviceId === 'number') {
      const found = data.services.find((s) => s.id === serviceId);
      setSelectedService(found || null);
      setSelectedPlan(null);
    } else {
      setSelectedService(null);
      setSelectedPlan(null);
    }
    setIsOrderOpen(true);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedPlan(null);
    setIsOrderOpen(true);
  };

  const handleSelectPlan = (plan: PricePlan) => {
    setSelectedPlan(plan);
    setSelectedService(null);
    setIsOrderOpen(true);
  };

  const handleOrderCreated = (newOrder: Order) => {
    if (data) {
      setData({
        ...data,
        orders: [newOrder, ...(data.orders || [])],
      });
    }
  };

  const handleAdCreated = (newAd: AdItem) => {
    if (data) {
      setData({
        ...data,
        ads: [newAd, ...(data.ads || [])],
      });
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#05070d] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-300">
            Chargement de Rayen Masmoudi Digital...
          </span>
        </div>
      </div>
    );
  }

  // If viewing Admin Dashboard
  if (isAdminView) {
    return (
      <AdminDashboard
        data={data}
        onRefreshData={loadData}
        onCloseAdmin={navigateToSite}
      />
    );
  }

  // Public Agency Website
  return (
    <div className={`min-h-screen bg-[#05070d] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${lang === 'ar' ? 'font-[\'Cairo\']' : ''}`}>
      
      {/* Top Navbar */}
      <Navbar
        onOpenOrder={() => handleOpenOrder()}
        onNavigateAdmin={navigateToAdmin}
        lang={lang}
        setLang={setLang}
        phone={data.settings.phone}
      />

      {/* Hero with 3D Rocket Space Canvas */}
      <Hero
        settings={data.settings}
        contentBlocks={data.content_blocks}
        lang={lang}
        onOpenOrder={() => handleOpenOrder()}
      />

      {/* Active Ads & Campaigns Showcase */}
      <AdsShowcaseSection
        ads={data.ads || []}
        lang={lang}
        currency={data.settings.currency || 'DT'}
        onOpenAdSubmission={() => setIsAdSubmissionOpen(true)}
        onOpenStatusCheck={() => setIsAdTrackerOpen(true)}
      />

      {/* Nos Services (9 Core Services) */}
      <ServicesSection
        services={data.services || []}
        lang={lang}
        currency={data.settings.currency || 'DT'}
        onSelectService={handleSelectService}
      />

      {/* Pricing & Packages (30 DT, 50 DT, 100 DT, 150 DT, 250 DT) */}
      <PricingSection
        prices={data.prices || []}
        lang={lang}
        currency={data.settings.currency || 'DT'}
        onSelectPlan={handleSelectPlan}
        onOpenCustomQuote={() => handleOpenOrder()}
      />

      {/* Portfolio Showcase */}
      <PortfolioSection
        portfolio={data.portfolio || []}
        lang={lang}
        onOrderSimilar={() => handleOpenOrder()}
      />

      {/* Contact & Socials with Working Hours & Google Maps Readiness */}
      <ContactSection
        settings={data.settings}
        workingHours={data.working_hours}
        lang={lang}
      />

      {/* Footer */}
      <Footer
        settings={data.settings}
        onNavigateAdmin={navigateToAdmin}
      />

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        services={data.services || []}
        prices={data.prices || []}
        selectedService={selectedService}
        selectedPlan={selectedPlan}
        currency={data.settings.currency || 'DT'}
        lang={lang}
        onOrderCreated={handleOrderCreated}
      />

      {/* Ad Submission Modal (Pending workflow) */}
      <AdSubmissionModal
        isOpen={isAdSubmissionOpen}
        onClose={() => setIsAdSubmissionOpen(false)}
        currency={data.settings.currency || 'DT'}
        lang={lang}
        onAdCreated={handleAdCreated}
      />

      {/* Ad Status Tracker Modal */}
      <AdStatusTrackerModal
        isOpen={isAdTrackerOpen}
        onClose={() => setIsAdTrackerOpen(false)}
        ads={data.ads || []}
        notifications={data.notifications || []}
        lang={lang}
      />

    </div>
  );
}
