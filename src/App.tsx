import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import { firebaseService } from './services/firebase';
import { Service, BannerConfig, PaymentConfig, SiteBrandingConfig, SetupTutorialConfig } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ServiceCard } from './components/ServiceCard';
import { CheckoutModal } from './components/CheckoutModal';
import { MyPurchasedServices } from './components/MyPurchasedServices';
import { SetupAndDownloads } from './components/SetupAndDownloads';
import { DisclaimerModal } from './components/DisclaimerModal';
import { AdminPanel } from './components/AdminPanel';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { WhatsAppModal, WhatsAppIcon } from './components/WhatsAppModal';
import { 
  Clock, Download, Hourglass, 
  MessageCircle, Sparkles, ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [services, setServices] = useState<Service[]>(() => store.getServices());
  const [banner, setBanner] = useState<BannerConfig>(() => store.getBanner());
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => store.getPaymentConfig());
  const [orders, setOrders] = useState(() => store.getOrders());
  const [branding, setBranding] = useState<SiteBrandingConfig>(() => store.getBranding());
  const [setupTutorial, setSetupTutorial] = useState<SetupTutorialConfig>(() => store.getSetupTutorial());

  // URL-based dedicated Admin detection (/admin, ?admin=true, #admin)
  const checkIsAdminUrl = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' || 
      path.startsWith('/admin') || 
      search.includes('admin') || 
      hash === '#admin'
    );
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminUrl());

  // Navigation tab state for public site: 'home' | 'purchases' | 'setup'
  // Requirement: "কোড একটি বেসন এটা দরকার নেই আর আমার কেনা সার্ভিস এখানে টাইমিং শুরু হবে তিনটি এপিকে এখানে ইউনিক কোড দেওয়ার পর"
  const [currentTab, setCurrentTab] = useState<'home' | 'purchases' | 'setup'>('home');

  // Terms Acceptance Disclaimer Modal state (Mandatory entry popup)
  const [termsAccepted, setTermsAccepted] = useState<boolean>(() => store.isTermsAccepted());

  // Buy Now modal state
  const [selectedServiceForBuy, setSelectedServiceForBuy] = useState<Service | null>(null);

  // WhatsApp Support Modal state - "কোড একটি বেসন এর জায়গায় হোয়াটসঅ্যাপে যোগাযোগ করার ব্যবস্থা রাখো"
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppSupportMsg, setWhatsAppSupportMsg] = useState('');

  // Unique Code passed across tabs (e.g. from checkout or purchased services to 3 APK download)
  const [activeUniqueCode, setActiveUniqueCode] = useState<string>('');

  // Dynamic browser title syncing with site name
  useEffect(() => {
    if (branding?.siteName) {
      document.title = `${branding.siteName} - ${branding.tagline || 'অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন'}`;
    }
  }, [branding]);

  // Real-time synchronization for Firebase Cloud Database across devices
  useEffect(() => {
    // 1. Subscribe to Orders in real-time across devices (Single Source of Truth)
    const unsubOrders = firebaseService.subscribeOrders((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
        store.setRemoteOrders(remoteOrders);
      }
    });

    // 2. Subscribe to Services in real-time
    const unsubServices = firebaseService.subscribeServices((remoteServices) => {
      if (remoteServices && remoteServices.length > 0) {
        setServices(remoteServices);
        store.setRemoteServices(remoteServices);
      }
    });

    // 3. Subscribe to Branding in real-time
    const unsubBranding = firebaseService.subscribeBranding((remoteBranding) => {
      if (remoteBranding?.siteName) {
        setBranding(remoteBranding);
      }
    });

    // 4. Subscribe to Payment Config in real-time
    const unsubPayment = firebaseService.subscribePaymentConfig((remotePayment) => {
      if (remotePayment?.bkashNumber) {
        setPaymentConfig(remotePayment);
      }
    });

    // 5. Subscribe to Top Banner in real-time
    const unsubBanner = firebaseService.subscribeBanner((remoteBanner) => {
      if (remoteBanner) {
        setBanner(remoteBanner);
      }
    });

    const handleBrandingUpdate = (e: any) => {
      if (e?.detail) {
        setBranding(e.detail);
      } else {
        setBranding(store.getBranding());
      }
    };
    const handleServicesUpdate = (e: any) => {
      if (e?.detail) {
        setServices(e.detail);
      } else {
        setServices(store.getServices());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shebapay_branding_v2') {
        setBranding(store.getBranding());
      } else if (e.key === 'shebapay_services_v2') {
        setServices(store.getServices());
      }
    };

    window.addEventListener('shebapay_branding_updated', handleBrandingUpdate);
    window.addEventListener('shebapay_services_updated', handleServicesUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      unsubOrders();
      unsubServices();
      unsubBranding();
      unsubPayment();
      unsubBanner();
      window.removeEventListener('shebapay_branding_updated', handleBrandingUpdate);
      window.removeEventListener('shebapay_services_updated', handleServicesUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Listen for browser navigation changes (/admin, #admin, popstate)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminUrl());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Keyboard shortcut for site owner: Ctrl+Shift+A or Cmd+Shift+A opens admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setIsAdminRoute(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const refreshAppData = () => {
    setServices(store.getServices());
    setBanner(store.getBanner());
    setPaymentConfig(store.getPaymentConfig());
    setOrders(store.getOrders());
    setBranding(store.getBranding());
    setSetupTutorial(store.getSetupTutorial());
  };

  const handleExitAdmin = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const handleAcceptTerms = () => {
    store.setTermsAccepted(true);
    setTermsAccepted(true);
  };

  const handleBuyNow = (service: Service) => {
    setSelectedServiceForBuy(service);
  };

  const handleGoToApkDownload = (uniqueCode: string) => {
    setActiveUniqueCode(uniqueCode);
    setCurrentTab('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWhatsApp = (customMsg?: string) => {
    if (customMsg) setWhatsAppSupportMsg(customMsg);
    setIsWhatsAppOpen(true);
  };

  // Services list
  const filteredServices = services;

  // Calculate active orders count
  const activeOrderCount = orders.filter(o => {
    if (o.status !== 'activated') return false;
    if (!o.expiresAt) return true;
    return new Date(o.expiresAt).getTime() > Date.now();
  }).length;

  // ===================== DEDICATED ADMIN ROUTE VIEW (/admin) =====================
  if (isAdminRoute) {
    return (
      <AdminPanel
        isOpen={true}
        onClose={handleExitAdmin}
        onDataUpdated={refreshAppData}
      />
    );
  }

  // ===================== PUBLIC MAIN STOREFRONT =====================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white relative">
      {/* 
        MANDATORY DISCLAIMER / ENTRY POPUP
      */}
      {!termsAccepted && (
        <DisclaimerModal
          isOpen={!termsAccepted}
          onAccept={handleAcceptTerms}
        />
      )}

      {/* Main Website Wrapper (blurred if terms not accepted yet) */}
      <div className={`flex flex-col min-h-screen transition-all duration-500 ${
        !termsAccepted ? 'filter blur-md pointer-events-none select-none' : ''
      }`}>
        {/* Top Navbar & Mobile Bottom Tab Bar (WhatsApp contact in place of code activation) */}
        <Navbar
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeOrderCount={activeOrderCount}
          onOpenWhatsApp={() => handleOpenWhatsApp()}
          branding={branding}
        />

        {/* Tab Content Router */}
        <main className="flex-1 pb-16 md:pb-0">
          {/* ===================== TAB 1: HOME PAGE ===================== */}
          {currentTab === 'home' && (
            <div>
              {/* Pure Banner */}
              <HeroBanner
                banner={banner}
                onExploreServices={() => {
                  const el = document.getElementById('hourly-services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* Hourly Services / Packages Section */}
              <section id="hourly-services" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Single Clean Title */}
                <div className="mb-6 sm:mb-8 flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                    <span className="w-2.5 h-7 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full inline-block"></span>
                    <span>{branding?.packagesTitle?.trim() || 'প্যাকেজ সমূহ'}</span>
                  </h2>
                </div>

                {/* Services Grid */}
                {services.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
                    <p className="text-slate-400 text-base">বর্তমানে কোনো প্যাকেজ পাওয়া যায়নি।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                    {services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBuyNow={handleBuyNow}
                        onFileSetup={() => {
                          setCurrentTab('setup');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* How it works simple guide */}
              <HowItWorks />
            </div>
          )}

          {/* ===================== TAB 2: MY PURCHASES WITH LIVE COUNTDOWN ===================== */}
          {/* Requirement: "আমার কেনা সার্ভিস এখানে টাইমিং শুরু হবে তিনটি এপিকে এখানে ইউনিক কোড দেওয়ার পর" */}
          {currentTab === 'purchases' && (
            <MyPurchasedServices
              onBuyService={() => setCurrentTab('home')}
              onGoToSetupAndApk={(code) => {
                setActiveUniqueCode(code);
                setCurrentTab('setup');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {/* ===================== TAB 3: APK INSTALL & FILE DOWNLOADS ===================== */}
          {/* Submitting code here activates service, starts countdown, and downloads APKs! */}
          {currentTab === 'setup' && (
            <SetupAndDownloads
              key={`apks-${setupTutorial.apks.length}`}
              initialCode={activeUniqueCode}
              onExploreServices={() => setCurrentTab('home')}
              onGoToPurchases={() => {
                setCurrentTab('purchases');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </main>

        {/* Public Clean Footer */}
        <Footer
          paymentConfig={paymentConfig}
          branding={branding}
          onNavigateToSection={(sectionId) => {
            if (sectionId === 'services-section') setCurrentTab('home');
            else if (sectionId === 'setup-section') setCurrentTab('setup');
            else if (sectionId === 'purchases-section') setCurrentTab('purchases');
            else setCurrentTab('home');
          }}
          onOpenWhatsApp={() => handleOpenWhatsApp()}
        />
      </div>

      {/* Floating Support Button matching user's screenshot ("সাহায্য লাগবে ?") */}
      <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleOpenWhatsApp()}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-slate-900 border border-slate-200 shadow-2xl text-[11px] sm:text-xs font-bold animate-bounce cursor-pointer hover:bg-slate-50 transition-all select-none"
        >
          <span>সাহায্য লাগবে ?</span>
        </button>

        <button
          type="button"
          onClick={() => handleOpenWhatsApp()}
          className="p-3 sm:p-3.5 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-2xl shadow-pink-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border-2 border-white/50 group relative"
          title="সাহায্য লাগবে? হোয়াটসঅ্যাপে যোগাযোগ করুন"
        >
          <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping"></span>
        </button>
      </div>

      {/* WhatsApp Support Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        paymentConfig={paymentConfig}
      />

      {/* Buy Now & Manual Payment Modal with Exit Option */}
      <CheckoutModal
        service={selectedServiceForBuy}
        paymentConfig={paymentConfig}
        isOpen={!!selectedServiceForBuy}
        onClose={() => setSelectedServiceForBuy(null)}
        onGoToApkDownload={handleGoToApkDownload}
      />
    </div>
  );
}
