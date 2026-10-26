import { 
  Sparkles, Home, Hourglass, 
  Download, MessageCircle, ExternalLink,
  Key, CreditCard
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppModal';

import { SiteBrandingConfig } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'purchases' | 'setup';
  onChangeTab: (tab: 'home' | 'purchases' | 'setup') => void;
  activeOrderCount: number;
  onOpenWhatsApp: () => void;
  branding?: SiteBrandingConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  activeOrderCount,
  onOpenWhatsApp,
  branding,
}) => {
  return (
    <>
      {/* Top Desktop & Mobile Header Bar (Clean, Public Storefront) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Logo and Dynamic Site Name */}
            <div 
              onClick={() => onChangeTab('home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {branding?.logoUrl ? (
                <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 p-0.5 shadow-lg shadow-pink-500/10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                  <img 
                    src={branding.logoUrl} 
                    alt={branding.siteName || 'Logo'} 
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
              ) : (
                <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                  </span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-pink-400 transition-colors">
                    {branding?.siteName || 'সেবাপে'}
                  </span>
                  {branding?.badgeText && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {branding.badgeText}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400">{branding?.tagline || 'অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন'}</p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850">
              <button
                onClick={() => onChangeTab('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>হোম পেজ</span>
              </button>

              <button
                onClick={() => onChangeTab('purchases')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer relative ${
                  currentTab === 'purchases'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Hourglass className="w-4 h-4" />
                <span>আমার কেনা সার্ভিস</span>
                {activeOrderCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-white font-mono font-bold animate-pulse">
                    {activeOrderCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onChangeTab('setup')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  currentTab === 'setup'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>এপিকে ডাউনলোড</span>
              </button>
            </nav>

            {/* WhatsApp Contact Action */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {/* WhatsApp Contact Button (Replaces code activation) */}
              <button
                type="button"
                onClick={onOpenWhatsApp}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 border border-emerald-400/30 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
                title="হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">হোয়াটসঅ্যাপে যোগাযোগ</span>
                <span className="sm:hidden">হোয়াটসঅ্যাপ</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              </button>

              {/* Quick Status Pill */}
              <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>সার্ভার লাইভ</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (5 Items matching reference screenshot) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-850 px-1 py-1.5 shadow-2xl">
        <div className="grid grid-cols-5 gap-0.5 max-w-md mx-auto">
          {/* Tab 1: Home */}
          <button
            onClick={() => {
              onChangeTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'text-pink-400 font-bold bg-pink-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] mt-0.5 font-semibold">Home</span>
          </button>

          {/* Tab 2: Add Fund / Packages */}
          <button
            onClick={() => {
              onChangeTab('home');
              setTimeout(() => {
                const el = document.getElementById('hourly-services');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-[9px] mt-0.5 font-semibold">Add Fund</span>
          </button>

          {/* Tab 3: My Order (Purchases & Timer) */}
          <button
            onClick={() => onChangeTab('purchases')}
            className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'purchases'
                ? 'text-indigo-400 font-bold bg-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hourglass className="w-4 h-4" />
            <span className="text-[9px] mt-0.5 font-semibold">My Order</span>
            {activeOrderCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          {/* Tab 4: My Keys / File & Setup */}
          <button
            onClick={() => onChangeTab('setup')}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer ${
              currentTab === 'setup'
                ? 'text-pink-400 font-bold bg-pink-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="text-[9px] mt-0.5 font-semibold">My Keys</span>
          </button>

          {/* Tab 5: WhatsApp / Support */}
          <button
            onClick={onOpenWhatsApp}
            className="flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all cursor-pointer text-emerald-400 hover:text-emerald-300 relative group"
          >
            <div className="relative">
              <WhatsAppIcon className="w-4 h-4 fill-emerald-400 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-[9px] mt-0.5 font-bold text-emerald-400">Support</span>
          </button>
        </div>
      </div>
    </>
  );
};
