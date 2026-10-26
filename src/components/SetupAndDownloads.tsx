import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { SetupTutorialConfig, ApkDownloadItem, Order } from '../types';
import { 
  Download, CheckCircle2, ShieldCheck, 
  Smartphone, FileCode2, Sparkles, ExternalLink, 
  Layers, HardDrive, Check, Lock, Unlock, KeyRound, 
  AlertCircle, Clock, Hourglass, RefreshCw,
  Shield, Cloud, FileArchive, Globe, HelpCircle,
  ArrowRight, Radio, Info, Zap, Gauge, Power
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoVpnModal } from './GoVpnModal';

interface SetupAndDownloadsProps {
  initialCode?: string;
  onExploreServices: () => void;
  onGoToPurchases?: () => void;
}

export const SetupAndDownloads: React.FC<SetupAndDownloadsProps> = ({
  initialCode = '',
  onExploreServices,
  onGoToPurchases,
}) => {
  const [config, setConfig] = useState<SetupTutorialConfig>(() => store.getSetupTutorial());
  const [uniqueCodeInput, setUniqueCodeInput] = useState(initialCode);
  const [unlockedOrder, setUnlockedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isGoVpnOpen, setIsGoVpnOpen] = useState(false);
  const [vpnStage, setVpnStage] = useState<'install' | 'open'>('install');
  const [isVpnInstalled, setIsVpnInstalled] = useState<boolean>(() => {
    return localStorage.getItem('govpn_installed') === 'true';
  });

  const handleOpenVpnInstall = () => {
    setVpnStage('install');
    setIsGoVpnOpen(true);
  };

  const handleOpenVpnApp = () => {
    setVpnStage('open');
    setIsGoVpnOpen(true);
  };

  // Tick for countdown timer if order is unlocked
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // If initialCode is provided, auto verify
  useEffect(() => {
    if (initialCode) {
      setUniqueCodeInput(initialCode);
      verifyCode(initialCode);
    }
  }, [initialCode]);

  const verifyCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('অনুগ্রহ করে আপনার ইউনিক কোডটি প্রদান করুন।');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = store.verifyAndActivateService(clean);
      setIsVerifying(false);

      if (res.success && res.order) {
        setUnlockedOrder(res.order);
        setErrorMessage('');
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#3b82f6', '#ec4899'],
        });
      } else {
        setUnlockedOrder(null);
        setErrorMessage(res.message || 'ভুল ইউনিক কোড! এই কোডটি সিস্টেমে পাওয়া যায়নি বা পেমেন্ট সম্পন্ন হয়নি।');
      }
    }, 600);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(uniqueCodeInput);
  };

  const handleDownloadApk = (apk: ApkDownloadItem, useMirror: boolean = false) => {
    if (!unlockedOrder) {
      setErrorMessage('বড় জিপ ফাইল ও এপিকে ডাউনলোড করতে প্রথমে আপনার ইউনিক কোডটি প্রদান করুন!');
      const el = document.getElementById('unique-code-box');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const downloadTarget = useMirror ? (apk.mirrorUrl || apk.downloadUrl) : apk.downloadUrl;
    const downloadKey = apk.id + (useMirror ? '-mirror' : '');
    setDownloadingId(downloadKey);

    setTimeout(() => {
      // If external web URL (Google Drive, MediaFire, Mega, Telegram, etc.)
      if (downloadTarget && (downloadTarget.startsWith('http://') || downloadTarget.startsWith('https://')) && !downloadTarget.includes('sample-large-pack') && !downloadTarget.includes('sample-govpn')) {
        window.open(downloadTarget, '_blank', 'noopener,noreferrer');
      } else {
        // Trigger simulated/packaged file download
        const element = document.createElement('a');
        const fileContent = `ShebaPay Official Package: ${apk.title} ${apk.version}\n` +
          `File: ${apk.fileName}\n` +
          `File Size: ${apk.size}\n` +
          `Licensed to Unique Code: ${unlockedOrder.uniqueCode}\n` +
          `Customer ID: ${unlockedOrder.customerId}\n` +
          `Order Duration: ${unlockedOrder.durationHours} Hours\n` +
          `Instructions: ${apk.installInstructions || 'No additional instructions'}\n\n` +
          `Note: This is an official verified package from ShebaPay. Extract using ZArchiver or WinRAR.\n`;

        const file = new Blob([fileContent], { 
          type: (apk.fileName.endsWith('.zip') || apk.fileName.endsWith('.rar') || apk.isLargeFile)
            ? 'application/zip' 
            : 'application/vnd.android.package-archive' 
        });
        element.href = URL.createObjectURL(file);
        element.download = apk.fileName || 'VIP_Full_Package.zip';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

      setDownloadingId(null);
      setDownloadedIds(prev => prev.includes(apk.id) ? prev : [...prev, apk.id]);
    }, 800);
  };

  // Helper to calculate remaining time
  const calculateRemaining = () => {
    if (!unlockedOrder || !unlockedOrder.expiresAt) return { hours: 0, minutes: 0, seconds: 0, isExpired: false };
    const diff = new Date(unlockedOrder.expiresAt).getTime() - currentTime;
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isExpired: true };

    const totalSeconds = Math.floor(diff / 1000);
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      isExpired: false,
    };
  };

  const countdown = calculateRemaining();

  // Find the Large ZIP File item from config
  const largeZipItem: ApkDownloadItem = config.apks.find(a => 
    a.fileCategory === 'large_file' || 
    a.isLargeFile || 
    (a.fileName && (a.fileName.toLowerCase().endsWith('.zip') || a.fileName.toLowerCase().endsWith('.rar')))
  ) || {
    id: 'apk-large-zip-default',
    title: 'বড় ভিআইপি জিপ প্যাকেজ (VIP Complete ZIP Package)',
    version: 'v6.0 VIP Pack',
    size: '১.২ GB (বড় ফাইল)',
    description: 'বড় সাইজের সম্পূর্ণ ভিআইপি জিপ ফাইল। ইউনিক কোড দিলেই গুগল ড্রাইভ বা মিডিয়াফায়ার ক্লাউড থেকে সরাসরি হাই-স্পিডে ডাউনলোড করতে পারবেন। সাইজ অনেক বড় হওয়ায় ক্লাউড লিংকের মাধ্যমে নিরবচ্ছিন্নভাবে নামবে।',
    downloadUrl: 'https://drive.google.com/file/d/sample-large-pack/view',
    mirrorUrl: 'https://www.mediafire.com/file/sample-large-pack',
    fileName: 'VIP_Gaming_Complete_Resource_Pack.zip',
    iconType: 'large_file',
    fileCategory: 'large_file',
    isLargeFile: true,
    storageProvider: 'gdrive',
    installInstructions: 'ইউনিক কোড দিয়ে আনলক করার পর ক্লাউড লিংক থেকে সম্পূর্ণ জিপ ফাইল নামিয়ে নিন। এরপর ZArchiver বা RAR অ্যাপ দিয়ে এক্সট্রাক্ট করুন।',
    badge: '📦 বড় জিপ ফাইল (High-Speed ZIP)',
    isActive: true,
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold mb-3">
          <FileArchive className="w-3.5 h-3.5 text-amber-400" />
          <span>বড় জিপ ফাইল ও এপিকে ডাউনলোড</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          বড় জিপ ফাইল ও এপিকে ডাউনলোড পোর্টাল
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          সার্ভিস কেনার পর পাওয়া <span className="text-emerald-400 font-bold">ইউনিক কোড</span> দিয়ে আনলক করলেই ফুল সাইজের <span className="text-amber-400 font-bold">বড় ভিআইপি জিপ ফাইল (.zip)</span> ও এপিকে সরাসরি ডাউনলোড করতে পারবেন।
        </p>
      </div>

      {/* ===================== UNIQUE CODE GATE FOR APK & LARGE ZIP DOWNLOADS ===================== */}
      <div className="space-y-6">
        {/* UNLOCK BOX */}
        <div 
          id="unique-code-box"
          className={`p-6 sm:p-8 rounded-3xl border-2 transition-all shadow-2xl scroll-mt-24 ${
            unlockedOrder
              ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border-emerald-500/60'
              : 'bg-slate-900/90 border-pink-500/40'
          }`}
        >
          {unlockedOrder ? (
            /* UNLOCKED STATE */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center">
                    <Unlock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{config.apks.length > 0 ? `বড় জিপ ফাইল ও ${config.apks.length}টি এপিকে আনলক হয়েছে` : 'বড় জিপ ফাইল ও সার্ভিস সফলভাবে আনলক হয়েছে'}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      প্যাকেজ: {unlockedOrder.serviceTitle} ({unlockedOrder.durationHours} ঘন্টা)
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onGoToPurchases && (
                    <button
                      type="button"
                      onClick={onGoToPurchases}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>আমার কেনা সার্ভিসে লাইভ টাইমার দেখুন →</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setUnlockedOrder(null);
                      setUniqueCodeInput('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    অন্য ইউনিক কোড দিন
                  </button>
                </div>
              </div>

              {/* Live Countdown Inside APK Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-slate-300 font-semibold">
                    ইউনিক কোড: <span className="text-emerald-400 font-mono font-bold tracking-wider">{unlockedOrder.uniqueCode}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অবশিষ্ট সময়: {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          ) : (
            /* LOCKED STATE - ASKS FOR UNIQUE CODE ALONE */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold mb-1">
                    <span>সুরক্ষিত ডাউনলোড লিঙ্ক • কোড ভেরিফিকেশন</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    বড় জিপ ফাইল ও এপিকে ডাউনলোড করতে ইউনিক কোড দিন
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    সার্ভিস কেনার পর পাওয়া ইউনিক কোডটি প্রদান করলেই নিচের বড় জিপ ফাইল (.zip) ও এপিকে ডাউনলোড অপশন আনলক হবে।
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={uniqueCodeInput}
                      onChange={(e) => setUniqueCodeInput(e.target.value.toUpperCase())}
                      placeholder="আপনার ইউনিক কোড লিখুন (যেমন: ACT-7841-BD)"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-base font-bold placeholder-slate-600 outline-none focus:border-pink-500 uppercase tracking-wider"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>এপিকে আনলক করুন</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-slate-400">কোড নেই? প্রথমে সার্ভিস কিনুন।</span>
                  <button
                    type="button"
                    onClick={onExploreServices}
                    className="text-pink-400 font-bold hover:underline cursor-pointer"
                  >
                    সার্ভিস কিনুন ও কোড পান →
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ===================== APKS & FILES SECTION ===================== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Layers className="w-6 h-6 text-pink-400" />
                <span>প্রয়োজনীয় ভিপিএন, বড় ডাটা ফাইল ও এপিকে</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {unlockedOrder ? 'সবগুলো ফাইল একে একে ডাউনলোড করে নির্দেশনা অনুযায়ী সেটআপ করুন' : '🔒 ইউনিক কোড দিয়ে আনলক করার পর সরাসরি বা ক্লাউড থেকে ডাউনলোড করতে পারবেন'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>১০০% নিরাপদ ও ভেরিফাইড প্যাকেজ</span>
            </div>
          </div>

          {/* ===================== FEATURED LARGE VIP ZIP FILE CARD ===================== */}
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/30 to-purple-950/40 border-2 border-amber-500/40 p-5 sm:p-7 shadow-2xl shadow-amber-950/30 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <FileArchive className="w-3.5 h-3.5 text-amber-400" />
                    <span>📦 বড় ভিআইপি জিপ প্যাকেজ (Large ZIP)</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold font-mono">
                    {largeZipItem.version || 'v6.0 VIP Pack'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                    ⚡ সাইজ: {largeZipItem.size || '১.২ GB'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                      {largeZipItem.title}
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5">
                    {largeZipItem.description || 'বড় সাইজের সম্পূর্ণ ভিআইপি জিপ ফাইল। ইউনিক কোড দিয়ে আনলক করলেই গুগল ড্রাইভ বা মিডিয়াফায়ার ক্লাউড থেকে সরাসরি সর্বোচ্চ স্পিডে ডাউনলোড করতে পারবেন।'}
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <FileArchive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{largeZipItem.fileName || 'VIP_Package.zip'}</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">হাই-স্পিড ক্লাউড লিংক</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">১০০% ভাইরাস মুক্ত</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">অটো আনলক সিস্টেম</span>
                  </div>
                </div>

                {/* Extract Guide */}
                <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-amber-200/90 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>ফাইল খোলার নিয়ম:</strong> সাইজ বড় হওয়ায় এটি .zip ফাইলে রাখা হয়েছে। ডাউনলোড শেষে ফোনের <strong>ZArchiver</strong> বা <strong>RAR</strong> অ্যাপ দিয়ে জিপ ফাইলটি এক্সট্রাক্ট করুন।</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 shrink-0 lg:w-80">
                <button
                  type="button"
                  onClick={() => handleDownloadApk(largeZipItem, false)}
                  disabled={downloadingId === largeZipItem.id}
                  className={`w-full py-4 px-5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    !unlockedOrder
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white shadow-amber-500/25'
                  }`}
                >
                  {!unlockedOrder ? (
                    <>
                      <Lock className="w-5 h-5 text-rose-400" />
                      <span>🔒 ইউনিক কোড দিয়ে জিপ আনলক করুন</span>
                    </>
                  ) : downloadingId === largeZipItem.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>জিপ ডাউনলোড শুরু হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white" />
                      <span>📥 বড় জিপ ফাইল ডাউনলোড ({largeZipItem.size || '১.২ GB'})</span>
                    </>
                  )}
                </button>

                {/* Mirror download button if available or unlocked */}
                {unlockedOrder && largeZipItem.mirrorUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadApk(largeZipItem, true)}
                    disabled={downloadingId === `${largeZipItem.id}-mirror`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>বিকল্প মিরর লিংক (MediaFire / Google Drive)</span>
                  </button>
                )}

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                  {!unlockedOrder ? (
                    <span className="text-rose-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>ইউনিক কোড প্রবেশ করালে এই বাটনটি সক্রিয় হবে</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>কোড ভেরিফাইড • হাই-স্পিড ডাউনলোড প্রস্তুত</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===================== FEATURED GO VPN SUPERFAST HERO CARD ===================== */}
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/30 p-5 sm:p-7 shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
            {/* Background glowing ambient effects */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>⚡ GO VPN • SUPERFAST VIP</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold">
                    v4.2 Turbo 5G
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold">
                    🚀 200+ Mbps আল্ট্রা স্পিড
                  </span>
                </div>

                <div>
                  <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                    <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      GO VPN (সুপারফাস্ট ভিআইপি ভিপিএন)
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1.5">
                    মোবাইল-ফ্রেন্ডলি ফুলস্ক্রিন ইন্টারফেস। মাঝখানে বড় অন/অফ বাটন, সিঙ্গাপুর ও বাংলাদেশ লো-পিং সার্ভার লিস্ট, লাইভ স্পিড টেস্ট এবং ইউনিক কোড ও কেনা প্ল্যান অনুযায়ী রিয়েল-টাইম অটো-কাউন্টডাউন।
                  </p>
                </div>

                {/* Features Pill Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Power className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">মাঝখানে বড় বাটন</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">৬টি ভিআইপি সার্ভার</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="truncate">লাইভ স্পিড টেস্ট</span>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">প্ল্যান অটো-কাউন্টডাউন</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Status */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
                {!isVpnInstalled ? (
                  <button
                    type="button"
                    onClick={handleOpenVpnInstall}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Download className="w-5 h-5 text-slate-950" />
                    <span>📥 GO VPN ইনস্টল করুন</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenVpnApp}
                    className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Power className="w-5 h-5 text-slate-950 fill-current" />
                    <span>⚡ GO VPN ওপেন করুন</span>
                  </button>
                )}

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-center text-slate-400 flex flex-col items-center justify-center gap-1">
                  {!isVpnInstalled ? (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-pink-400" />
                      <span>কোড দেওয়ার পর ইনস্টল শুরু হবে</span>
                    </span>
                  ) : (
                    <>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>ইনস্টল সম্পন্ন • ওপেন করতে কোড লাগবে</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('govpn_installed');
                          setIsVpnInstalled(false);
                          handleOpenVpnInstall();
                        }}
                        className="text-[10px] text-slate-400 hover:text-cyan-400 underline cursor-pointer"
                      >
                        পুনরায় ইনস্টল করতে চান?
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {config.apks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-sm">নতুন এপিকে ফাইল শীঘ্রই যোগ করা হবে</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                এডমিন প্যানেল থেকে আপনার প্রয়োজনীয় ভিপিএন ও বড় ডাটা ফাইল কনফিগারেশন করা হচ্ছে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.apks.map((apk, index) => {
              const isVpn = apk.fileCategory === 'vpn' || apk.iconType === 'vpn';
              const isLarge = apk.isLargeFile || apk.fileCategory === 'large_file' || apk.iconType === 'large_file';
              const isDownloading = downloadingId === apk.id;
              const isDownloadingMirror = downloadingId === `${apk.id}-mirror`;
              const isDownloaded = downloadedIds.includes(apk.id);

              return (
                <div
                  key={apk.id || index}
                  className={`bg-slate-900/95 rounded-3xl border p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all group relative overflow-hidden ${
                    unlockedOrder 
                      ? isVpn 
                        ? 'border-cyan-500/40 hover:border-cyan-400 shadow-cyan-950/20' 
                        : isLarge 
                        ? 'border-amber-500/40 hover:border-amber-400 shadow-amber-950/20'
                        : 'border-slate-800 hover:border-emerald-500/40 shadow-emerald-950/20' 
                      : 'border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Category Badge & Version */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-slate-700 font-mono group-hover:text-slate-500 transition-colors">
                          ০{index + 1}
                        </span>
                        {isVpn ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>{apk.badge || 'কাস্টম ভিপিএন'}</span>
                          </span>
                        ) : isLarge ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            <span>{apk.badge || 'বড় ফাইল (ক্লাউড)'}</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                            {apk.badge || 'মেইন অ্যাপ'}
                          </span>
                        )}
                      </div>

                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold">
                        {apk.version}
                      </span>
                    </div>

                    {/* Visual Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                      !unlockedOrder
                        ? 'bg-slate-800 text-slate-400'
                        : isVpn
                        ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-cyan-600/25 ring-2 ring-cyan-500/20'
                        : isLarge
                        ? 'bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-600 shadow-amber-600/25 ring-2 ring-amber-500/20'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-600/20'
                    }`}>
                      {isVpn ? (
                        <Shield className="w-7 h-7 text-white" />
                      ) : isLarge ? (
                        <FileArchive className="w-7 h-7 text-white" />
                      ) : (
                        <FileCode2 className="w-7 h-7 text-white" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className={`text-base sm:text-lg font-bold text-white transition-colors ${
                        isVpn ? 'group-hover:text-cyan-300' : isLarge ? 'group-hover:text-amber-300' : 'group-hover:text-emerald-400'
                      }`}>
                        {apk.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                        {apk.description}
                      </p>
                    </div>

                    {/* Specific Installation / Setup Instructions Box if available */}
                    {apk.installInstructions && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{apk.installInstructions}</span>
                      </div>
                    )}

                    {/* File Size & Filename Meta */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span>সাইজ: {apk.size}</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[10px] truncate max-w-[130px]" title={apk.fileName}>
                        {apk.fileName}
                      </span>
                    </div>
                  </div>

                  {/* DOWNLOAD BUTTONS */}
                  <div className="space-y-2 pt-2">
                    {/* Direct GO VPN Launcher for VPN items */}
                    {isVpn && (
                      !isVpnInstalled ? (
                        <button
                          type="button"
                          onClick={handleOpenVpnInstall}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer transform active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>📥 GO VPN ইনস্টল করুন (কোড লাগবে)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenVpnApp}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer transform active:scale-95"
                        >
                          <Power className="w-3.5 h-3.5 fill-current" />
                          <span>⚡ GO VPN ওপেন করুন (কোড দিন)</span>
                        </button>
                      )
                    )}

                    {/* Primary Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadApk(apk, false)}
                      disabled={isDownloading || isDownloadingMirror}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        !unlockedOrder
                          ? 'bg-slate-800 text-slate-400 hover:bg-slate-750 border border-slate-700'
                          : isDownloaded
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          : isVpn
                          ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25'
                          : isLarge
                          ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-amber-600/25'
                          : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
                      }`}
                    >
                      {!unlockedOrder ? (
                        <>
                          <Lock className="w-4 h-4 text-rose-400" />
                          <span>কোড দিয়ে আনলক করুন</span>
                        </>
                      ) : isDownloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>ডাউনলোড শুরু হচ্ছে...</span>
                        </>
                      ) : isDownloaded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>ডাউনলোড সম্পন্ন (পুনরায় নামান)</span>
                        </>
                      ) : isLarge ? (
                        <>
                          <Cloud className="w-4 h-4 text-amber-200" />
                          <span>বড় ফাইল ডাউনলোড (ক্লাউড লিংক)</span>
                        </>
                      ) : isVpn ? (
                        <>
                          <Shield className="w-4 h-4 text-cyan-200" />
                          <span>ভিপিএন এপিকে নামান</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>এপিকে ডাউনলোড করুন</span>
                        </>
                      )}
                    </button>

                    {/* Optional Backup Mirror Link for Large Files or VPN */}
                    {unlockedOrder && apk.mirrorUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadApk(apk, true)}
                        disabled={isDownloading || isDownloadingMirror}
                        className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isDownloadingMirror ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>মিরর লিঙ্ক ওপেন হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3 text-pink-400" />
                            <span>বিকল্প মিরর ডাউনলোড লিংক (Google Drive / MediaFire)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Quick Step-by-Step Setup Guide Banner */}
          <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  ভিপিএন ও বড় ফাইল সেটআপের সহজ নিয়মাবলী
                </h4>
                <p className="text-xs text-slate-400">নিচের ৩টি সহজ ধাপে আপনার সার্ভিস সক্রিয় করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">১</span>
                  <span>ভিপিএন এপিকে ইনস্টল</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  আমাদের নিজস্ব ভিপিএন অ্যাপটি নামিয়ে ওপেন করুন এবং বাংলাদেশ অথবা সিঙ্গাপুর ফাস্ট সার্ভার কানেক্ট করুন।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">২</span>
                  <span>বড় ফাইল সেটআপ</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  বড় সাইজের ডাটা ফাইলটি ক্লাউড থেকে নামিয়ে ফোনের Android/obb বা নির্ধারিত ডিরেক্টরিতে পেস্ট করুন।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">৩</span>
                  <span>ইউনিক কোড দিয়ে সার্ভিস চালু</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  মেইন অ্যাপটি ওপেন করে কেনা ইউনিক কোড প্রদান করলেই আপনার সার্ভিস ফুল স্পিডে সচল হয়ে যাবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== GO VPN MODAL (SUPERFAST SIMULATOR & CLIENT) ===================== */}
      <GoVpnModal
        isOpen={isGoVpnOpen}
        onClose={() => setIsGoVpnOpen(false)}
        initialCode={unlockedOrder?.uniqueCode || uniqueCodeInput}
        initialStage={vpnStage}
        onExploreServices={onExploreServices}
        onInstallComplete={() => setIsVpnInstalled(true)}
      />
    </div>
  );
};
