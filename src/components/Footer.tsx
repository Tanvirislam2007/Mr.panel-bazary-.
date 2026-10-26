import React from 'react';
import { Sparkles, Shield, Heart, MessageCircle } from 'lucide-react';
import { PaymentConfig, SiteBrandingConfig } from '../types';
import { WhatsAppIcon } from './WhatsAppModal';

interface FooterProps {
  paymentConfig: PaymentConfig;
  onNavigateToSection: (id: string) => void;
  onOpenWhatsApp?: () => void;
  branding?: SiteBrandingConfig;
}

export const Footer: React.FC<FooterProps> = ({
  paymentConfig,
  onNavigateToSection,
  onOpenWhatsApp,
  branding,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-850 pt-12 pb-8 text-slate-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              {branding?.logoUrl ? (
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 p-0.5 flex items-center justify-center">
                  <img src={branding.logoUrl} alt={branding.siteName} className="w-full h-full object-contain rounded-lg" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <span className="text-xl font-black text-white">
                {branding?.siteName || 'সেবাপে'}
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              অনলাইন ডিজিটাল সার্ভিস ও প্রিমিয়াম ঘন্টা-ভিত্তিক প্যাকেজ প্ল্যাটফর্ম। বিকাশ ও নগদ নিরাপদ পেমেন্টে প্রাপ্ত ইউনিক কোড দিয়ে ৩টি এপিকে ডাউনলোড ও লাইভ সার্ভিস অ্যাক্টিভেশন।
            </p>
            <div className="flex items-center gap-4 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
                ● লাইভ সিস্টেম সক্রিয়
              </span>
              {onOpenWhatsApp && (
                <button
                  type="button"
                  onClick={onOpenWhatsApp}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>২৪/৭ হোয়াটসঅ্যাপ সহায়তা</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-sm">প্রয়োজনীয় লিঙ্ক</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToSection('services-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  সার্ভিস সমূহ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToSection('setup-section')}
                  className="hover:text-pink-400 transition-colors cursor-pointer"
                >
                  সেটআপ ও ৩টি এপিকে
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateToSection('purchases-section')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  আমার কেনা সার্ভিস (লাইভ টাইমার)
                </button>
              </li>
              {onOpenWhatsApp && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenWhatsApp}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Supported Gateways */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm">পেমেন্ট মেথড</h4>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-[#e2136e]/15 border border-[#e2136e]/30 text-pink-300 font-bold text-xs">
                bKash বিকাশ
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#f7941d]/15 border border-[#f7941d]/30 text-amber-300 font-bold text-xs">
                Nagad নগদ
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * বিকাশ ও নগদ সেন্ড মানি যাচাই করে ৩টি এপিকে সেকশনে কোড দিয়ে তাৎক্ষণিক সার্ভিস চালু করুন।
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} সেবা পে (ShebaPay). সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div className="flex items-center gap-1">
            <span>নিরাপদ ও নির্ভরযোগ্য ডিজিটাল সার্ভিস প্ল্যাটফর্ম</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
