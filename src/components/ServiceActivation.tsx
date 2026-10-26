import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { ActivationCheckResult, Order } from '../types';
import { 
  KeyRound, CheckCircle2, XCircle, AlertTriangle, 
  Sparkles, ShieldCheck, ArrowRight, RefreshCw, 
  Copy, Check, Clock, Zap, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ServiceActivationProps {
  initialCode?: string;
  onExploreServices: () => void;
  onGoToApkDownload?: (code: string) => void;
}

export const ServiceActivation: React.FC<ServiceActivationProps> = ({
  initialCode = '',
  onExploreServices,
  onGoToApkDownload,
}) => {
  const [uniqueCode, setUniqueCode] = useState(initialCode);
  const [result, setResult] = useState<ActivationCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setUniqueCode(initialCode);
      handleVerifyCode(initialCode);
    }
  }, [initialCode]);

  const handleVerifyCode = (codeToVerify: string) => {
    const clean = codeToVerify.trim().toUpperCase();
    if (!clean) {
      setResult({
        success: false,
        message: 'অনুগ্রহ করে আপনার ইউনিক কোডটি প্রদান করুন।',
        errorType: 'NOT_FOUND',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const res = store.verifyAndActivateService(clean);
      setResult(res);
      setIsLoading(false);

      if (res.success) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#059669'],
        });
      }
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyCode(uniqueCode);
  };

  return (
    <div id="activation-section" className="py-10 sm:py-16 bg-slate-950/90 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-4">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>ইউনিক কোড দিয়ে সার্ভিস চালু পোর্টাল</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            শুধুমাত্র ইউনিক কোড দিয়ে সার্ভিস চালু করুন
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            পেমেন্টের পর প্রাপ্ত <span className="text-emerald-400 font-bold">ইউনিক কোড</span> লিখলেই আপনার সার্ভিস ও লাইভ কাউন্টডাউন চালু হয়ে যাবে।
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 backdrop-blur-xl">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-2">
                আপনার ইউনিক অ্যাক্টিভেশন কোড (Unique Code) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  placeholder="उदा. ACT-7841-BD"
                  className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-500 text-lg font-mono font-bold tracking-widest uppercase outline-none transition-all"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  <KeyRound className="w-6 h-6 text-emerald-400/70" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                * পেমেন্ট সম্পন্ন করার পর প্রাপ্ত ইউনিক কোডটি প্রদান করে সার্ভিস চালু করুন।
              </p>
            </div>

            {/* Submit Verification Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>ইউনিক কোড যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>সার্ভিস চালু ও যাচাই করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ===================== RESULT DISPLAY ===================== */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-800 transition-all">
              {result.success && result.order ? (
                /* SUCCESS STATE */
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 border-2 border-emerald-500/60 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>সার্ভিস সফলভাবে চালু হয়েছে</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        আপনার সার্ভিস সক্রিয় রয়েছে!
                      </h3>
                      <p className="text-sm text-emerald-200 mt-1">
                        প্যাকেজ: {result.order.durationHours} ঘন্টা এক্সেস
                      </p>
                    </div>
                  </div>

                  {/* Active Service Details Card */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-slate-400">সার্ভিসের নাম:</span>
                      <span className="text-white font-bold text-right text-base">
                        {result.order.serviceTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-slate-400">ইউনিক অ্যাক্টিভেশন কোড:</span>
                      <span className="text-emerald-400 font-mono font-bold tracking-wider">
                        {result.order.uniqueCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-slate-400">বর্তমান স্ট্যাটাস:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        চালু আছে ({result.order.durationHours} ঘন্টা লাইভ)
                      </span>
                    </div>
                  </div>

                  {/* Action: Go directly to 3 APK Downloads with this code */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {onGoToApkDownload && (
                      <button
                        type="button"
                        onClick={() => onGoToApkDownload(result.order!.uniqueCode)}
                        className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <Download className="w-5 h-5" />
                        <span>এই কোড দিয়ে ৩টি এপিকে ডাউনলোড করুন</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onExploreServices}
                      className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                    >
                      আরও সার্ভিস দেখুন
                    </button>
                  </div>
                </div>
              ) : (
                /* ERROR STATE */
                <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/40 border-2 border-rose-500/50 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0">
                      <XCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>সার্ভিস চালু করা সম্ভব হয়নি</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        ভুল ইউনিক কোড অথবা পেমেন্ট সম্পন্ন হয়নি!
                      </h3>
                      <p className="text-sm text-rose-200 mt-1">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onExploreServices}
                      className="py-3 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>সার্ভিস কিনুন ও ইউনিক কোড পান</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
