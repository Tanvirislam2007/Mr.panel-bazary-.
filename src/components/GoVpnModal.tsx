import React, { useState, useEffect, useRef } from 'react';
import { store } from '../services/store';
import { Order } from '../types';
import { 
  Power, ShieldCheck, Zap, Globe, Gauge, Check, Lock, 
  Unlock, Clock, RefreshCw, X, ChevronRight, Wifi, 
  Download, Upload, AlertCircle, Sparkles, CheckCircle2,
  Server, Shield, Radio, Flame, ArrowUpRight, Activity,
  Smartphone, ArrowRight, CheckCircle, Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GoVpnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialStage?: 'install' | 'open';
  onExploreServices?: () => void;
  onInstallComplete?: () => void;
}

interface VpnServer {
  id: string;
  country: string;
  city: string;
  flag: string;
  ping: number;
  speed: string;
  protocol: string;
  isVip: boolean;
  load: number;
}

const VPN_SERVERS: VpnServer[] = [
  { id: 'bd-1', country: 'বাংলাদেশ (Bangladesh)', city: 'Dhaka Low-Ping VIP', flag: '🇧🇩', ping: 8, speed: '10 Gbps Express', protocol: 'UDP Gaming Safe', isVip: true, load: 18 },
  { id: 'sg-1', country: 'সিঙ্গাপুর (Singapore)', city: 'Singapore Central', flag: '🇸🇬', ping: 14, speed: '10 Gbps Turbo', protocol: 'WireGuard Ultra', isVip: true, load: 24 },
  { id: 'jp-1', country: 'জাপান (Tokyo)', city: 'Tokyo Lightning', flag: '🇯🇵', ping: 22, speed: '10 Gbps Ultra', protocol: 'WireGuard VIP', isVip: true, load: 31 },
  { id: 'in-1', country: 'ভারত (Mumbai)', city: 'Mumbai Pro', flag: '🇮🇳', ping: 24, speed: '5 Gbps Turbo', protocol: 'WireGuard Pro', isVip: true, load: 42 },
  { id: 'de-1', country: 'জার্মানি (Frankfurt)', city: 'Frankfurt Dedicated', flag: '🇩🇪', ping: 68, speed: '10 Gbps Line', protocol: 'WireGuard Ultra', isVip: true, load: 29 },
  { id: 'us-1', country: 'যুক্তরাষ্ট্র (USA)', city: 'Los Angeles Gaming', flag: '🇺🇸', ping: 76, speed: '10 Gbps Fiber', protocol: 'Turbo Shield', isVip: true, load: 35 },
];

export const GoVpnModal: React.FC<GoVpnModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  initialStage = 'open',
  onExploreServices,
  onInstallComplete,
}) => {
  // Installation State: User requirement ("vpn instol opson takby cod daoar por in stol hoby")
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    return localStorage.getItem('govpn_installed') === 'true';
  });
  const [installStep, setInstallStep] = useState<'prompt_code' | 'installing' | 'complete'>('prompt_code');
  const [installProgress, setInstallProgress] = useState(0);
  const [installLogText, setInstallLogText] = useState('প্যাকেজ ফাইল প্রস্তুত করা হচ্ছে...');

  // Screen Mode: 'installer' | 'app'
  const [modalMode, setModalMode] = useState<'installer' | 'app'>('app');

  // Unlocked / Authenticated State: User requirement ("pory instol kora vpn opn korar saty saty cod lagby cod dily pory vpn hom skin dakajaby")
  const [isHomeUnlocked, setIsHomeUnlocked] = useState(false);

  // Active code & Order state
  const [uniqueCode, setUniqueCode] = useState<string>(() => {
    return initialCode || localStorage.getItem('govpn_active_code') || '';
  });
  const [order, setOrder] = useState<Order | null>(null);
  const [codeInputValue, setCodeInputValue] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // VPN Connection state: 'disconnected' | 'connecting' | 'connected'
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>(() => {
    return (localStorage.getItem('govpn_connected') === 'true') ? 'connected' : 'disconnected';
  });
  const [connectedTimeSec, setConnectedTimeSec] = useState(0);

  // Selected Server
  const [selectedServer, setSelectedServer] = useState<VpnServer>(VPN_SERVERS[0]);
  const [isServerDrawerOpen, setIsServerDrawerOpen] = useState(false);

  // Active Tab inside VPN App: 'home' | 'speedtest' | 'servers'
  const [activeVpnTab, setActiveVpnTab] = useState<'home' | 'speedtest' | 'servers'>('home');

  // Real-time Speed Test State ("sppet tast takby vpn daky mony hoby onykak fast")
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [speedTestStep, setSpeedTestStep] = useState<'idle' | 'ping' | 'download' | 'upload' | 'done'>('idle');
  const [testPing, setTestPing] = useState(8);
  const [testDownload, setTestDownload] = useState(204.6);
  const [testUpload, setTestUpload] = useState(95.4);
  const [testJitter, setTestJitter] = useState(1);

  // Current local time for ticking plan countdown
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Sync mode whenever modal opens or initialStage changes
  useEffect(() => {
    if (!isOpen) return;

    const installed = localStorage.getItem('govpn_installed') === 'true';
    setIsInstalled(installed);

    // If explicit install stage or not installed yet, show installer first
    if (initialStage === 'install' || !installed) {
      setModalMode('installer');
      setInstallStep('prompt_code');
      setInstallProgress(0);
      setCodeInputValue(initialCode || uniqueCode || '');
      setCodeError('');
    } else {
      // Installed app opened!
      // User requirement: "pory instol kora vpn opn korar saty saty cod lagby"
      setModalMode('app');
      setIsHomeUnlocked(false); // Lock home screen immediately upon open
      setCodeInputValue(initialCode || uniqueCode || '');
      setCodeError('');
      setActiveVpnTab('home');
    }
  }, [isOpen, initialStage]);

  // Load Order if valid code is present
  useEffect(() => {
    if (!isOpen) return;
    const codeToTest = uniqueCode || initialCode;
    if (codeToTest) {
      const orders = store.getOrders();
      const matched = orders.find(
        o => o.uniqueCode.toUpperCase() === codeToTest.trim().toUpperCase() && o.status === 'activated'
      );
      if (matched) {
        setOrder(matched);
      }
    }
  }, [isOpen, uniqueCode, initialCode]);

  // Second ticker for countdown & connection duration
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      if (connectionState === 'connected') {
        setConnectedTimeSec(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, connectionState]);

  // Plan remaining time calculation ("plan onojae pory 1 h 2 h por of o hoby")
  const getRemainingTime = () => {
    if (!order || !order.expiresAt) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: false, totalSeconds: 0 };
    }
    const diff = new Date(order.expiresAt).getTime() - currentTime;
    if (diff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
    }

    const totalSeconds = Math.floor(diff / 1000);
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      isExpired: false,
      totalSeconds,
    };
  };

  const remaining = getRemainingTime();

  // Automatic Disconnect / Turn OFF when plan expires ("plan onojae pory 1 h 2 h por of o hoby")
  useEffect(() => {
    if (order && remaining.isExpired && connectionState === 'connected') {
      setConnectionState('disconnected');
      localStorage.setItem('govpn_connected', 'false');
    }
  }, [remaining.isExpired, connectionState, order]);

  // ==================== INSTALLATION HANDLER ====================
  // "vpn instol opson takby cod daoar por in stol hoby"
  const handleStartInstallation = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInputValue.trim().toUpperCase();
    if (!clean) {
      setCodeError('ইনস্টল করতে অনুগ্রহ করে আপনার কেনা ইউনিক কোডটি প্রদান করুন।');
      return;
    }

    setIsVerifyingCode(true);
    setCodeError('');

    setTimeout(() => {
      const res = store.verifyAndActivateService(clean);
      setIsVerifyingCode(false);

      if (res.success && res.order) {
        setOrder(res.order);
        setUniqueCode(res.order.uniqueCode);
        localStorage.setItem('govpn_active_code', res.order.uniqueCode);

        // Start Realistic Android Installation Progress
        setInstallStep('installing');
        setInstallProgress(10);
        setInstallLogText('প্যাকেজ ফাইল ভেরিফাই করা হচ্ছে (GO_VPN_v4.2.apk)...');

        setTimeout(() => {
          setInstallProgress(35);
          setInstallLogText('ডিভাইস আর্কিটেকচার ও সিকিউরিটি কনফিগারেশন চেক হচ্ছে...');
        }, 400);

        setTimeout(() => {
          setInstallProgress(65);
          setInstallLogText('সিস্টেম ডিরেক্টরিতে WireGuard Turbo 5G ফাইল কপি হচ্ছে...');
        }, 900);

        setTimeout(() => {
          setInstallProgress(90);
          setInstallLogText('অ্যাপ্লিকেশন পারমিশন ও ইউনিক কোড কি-স্টোর রেজিস্ট্রেশন হচ্ছে...');
        }, 1300);

        setTimeout(() => {
          setInstallProgress(100);
          setInstallLogText('অভিনন্দন! GO VPN ইনস্টল সফলভাবে সম্পন্ন হয়েছে।');
          setIsInstalled(true);
          localStorage.setItem('govpn_installed', 'true');
          setInstallStep('complete');
          if (onInstallComplete) onInstallComplete();

          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4', '#ec4899'],
          });
        }, 1700);
      } else {
        setCodeError(res.message || 'ভুল ইউনিক কোড! এই কোডটি সিস্টেমে পাওয়া যায়নি অথবা পেমেন্ট সম্পন্ন হয়নি।');
      }
    }, 500);
  };

  // Transition from complete install into opening the app
  const handleProceedToOpenInstalledVpn = () => {
    setModalMode('app');
    // "pory instol kora vpn opn korar saty saty cod lagby"
    setIsHomeUnlocked(false);
    setCodeInputValue(uniqueCode || '');
    setCodeError('');
  };

  // ==================== APP UNLOCK HANDLER ====================
  // "pory instol kora vpn opn korar saty saty cod lagby cod dily pory vpn hom skin dakajaby"
  const handleUnlockAppHomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInputValue.trim().toUpperCase();
    if (!clean) {
      setCodeError('ভিপিএন হোম স্ক্রিনে প্রবেশ করতে ইউনিক কোডটি প্রদান করুন।');
      return;
    }

    setIsVerifyingCode(true);
    setCodeError('');

    setTimeout(() => {
      const res = store.verifyAndActivateService(clean);
      setIsVerifyingCode(false);

      if (res.success && res.order) {
        setOrder(res.order);
        setUniqueCode(res.order.uniqueCode);
        localStorage.setItem('govpn_active_code', res.order.uniqueCode);
        
        // "cod dily pory vpn hom skin dakajaby"
        setIsHomeUnlocked(true);
        setCodeError('');

        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#ec4899'],
        });
      } else {
        setCodeError(res.message || 'ভুল ইউনিক কোড! এই কোডটি সঠিক নয় অথবা প্ল্যানের মেয়াদ শেষ হয়ে গেছে।');
      }
    }, 500);
  };

  // Handle Power Button click ("opn kortay voro vaton takby majkany on korar")
  const handleTogglePower = () => {
    if (!order) {
      setIsHomeUnlocked(false);
      return;
    }

    // Check if plan is expired
    if (remaining.isExpired) {
      setCodeError('আপনার এই প্ল্যানের মেয়াদ শেষ হয়ে গেছে! নতুন প্যাকেজ কিনে ইউনিক কোড দিন।');
      setIsHomeUnlocked(false);
      return;
    }

    // Toggle Connection
    if (connectionState === 'connected') {
      setConnectionState('disconnected');
      localStorage.setItem('govpn_connected', 'false');
    } else if (connectionState === 'disconnected') {
      setConnectionState('connecting');
      setTimeout(() => {
        setConnectionState('connected');
        localStorage.setItem('govpn_connected', 'true');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#06b6d4', '#ec4899'],
        });
      }, 1200);
    }
  };

  // Run Realistic Speed Test ("sppet tast takby vpn daky mony hoby onykak fast")
  const runSpeedTest = () => {
    if (isSpeedTesting) return;
    setIsSpeedTesting(true);
    setSpeedTestStep('ping');
    setTestPing(12);
    setTestDownload(0);
    setTestUpload(0);

    // Step 1: Ping (0 - 500ms)
    setTimeout(() => {
      setTestPing(selectedServer.ping || 8);
      setTestJitter(1);
      setSpeedTestStep('download');

      // Step 2: Download benchmark (climbing up to 215 Mbps)
      let dCurrent = 20;
      const dTarget = 195 + Math.floor(Math.random() * 25);
      const dInterval = setInterval(() => {
        dCurrent += Math.floor(Math.random() * 28) + 14;
        if (dCurrent >= dTarget) {
          dCurrent = dTarget;
          clearInterval(dInterval);
          setTestDownload(dTarget);
          setSpeedTestStep('upload');

          // Step 3: Upload benchmark (climbing up to 98 Mbps)
          let uCurrent = 15;
          const uTarget = 93 + Math.floor(Math.random() * 15);
          const uInterval = setInterval(() => {
            uCurrent += Math.floor(Math.random() * 18) + 9;
            if (uCurrent >= uTarget) {
              uCurrent = uTarget;
              clearInterval(uInterval);
              setTestUpload(uTarget);
              setSpeedTestStep('done');
              setIsSpeedTesting(false);
            } else {
              setTestUpload(uCurrent);
            }
          }, 80);
        } else {
          setTestDownload(dCurrent);
        }
      }, 70);
    }, 500);
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Mobile-Friendly Mockup Phone Shell */}
      <div className="relative w-full max-w-[420px] bg-slate-950 border-2 border-slate-800 rounded-3xl sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[94vh] max-h-[820px]">
        {/* Top Glow & Bezel Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-pink-500 z-30" />

        {/* Top Phone Status Bar (Time, WiFi, 5G, Battery) */}
        <div className="px-5 pt-3 pb-1 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 z-20 select-none">
          <span className="font-bold text-slate-300">10:45 AM</span>
          <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-1 rounded">5G</span>
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="w-4 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* ===================== VPN HEADER ===================== */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-850 bg-slate-900/70 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-white text-base tracking-wider uppercase font-mono">
                  GO VPN
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                  VIP 5G
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Superfast • v4.2 Turbo</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Lock status toggle if already unlocked */}
            {modalMode === 'app' && isHomeUnlocked && (
              <button
                type="button"
                onClick={() => {
                  setIsHomeUnlocked(false);
                  setCodeError('');
                }}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                title="ভিপিএন লক করুন"
              >
                <Lock className="w-3 h-3 text-pink-400" />
                <span>লক করুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================== VIEW 1: INSTALLER MODE ===================== */}
        {/* Requirement: "vpn instol opson takby cod daoar por in stol hoby" */}
        {modalMode === 'installer' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            <div className="space-y-5 text-center my-auto">
              <div className="relative mx-auto w-20 h-20">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center shadow-xl shadow-cyan-500/25">
                  <Smartphone className="w-10 h-10 text-slate-950" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-emerald-400">
                  <Download className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold inline-block mb-2">
                  প্যাকেজ ইনস্টলার • GO VPN Setup
                </span>
                <h3 className="text-xl font-black text-white">GO VPN প্যাকেজ ইনস্টলেশন</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  ভিপিএনটি ফোনে ইনস্টল করতে আপনার কেনা <span className="text-emerald-400 font-bold">ইউনিক কোডটি</span> প্রদান করুন। কোড দেওয়ার পরেই ইনস্টলেশন শুরু হবে।
                </p>
              </div>

              {/* INSTALL STEP 1: PROMPT CODE */}
              {installStep === 'prompt_code' && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 text-left">
                  {codeError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{codeError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStartInstallation} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        আপনার ইউনিক কোড (Unique Code)
                      </label>
                      <input
                        type="text"
                        required
                        value={codeInputValue}
                        onChange={(e) => setCodeInputValue(e.target.value.toUpperCase())}
                        placeholder="उदा. VIP-8492-BD"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono tracking-wider outline-none focus:border-cyan-400 text-center font-bold"
                      />
                    </div>

                    {/* Quick Fill Chip if code is available */}
                    {(initialCode || uniqueCode) && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setCodeInputValue(initialCode || uniqueCode)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                        >
                          কোড ব্যবহার করুন: {initialCode || uniqueCode}
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifyingCode}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                      {isVerifyingCode ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>কোড যাচাই হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>কোড দিয়ে ইনস্টল শুরু করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* INSTALL STEP 2: INSTALLING ANIMATION */}
              {installStep === 'installing' && (
                <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-4 text-left shadow-lg">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>অ্যাপ ইনস্টল হচ্ছে...</span>
                    </span>
                    <span className="font-mono text-cyan-400 text-sm font-black">{installProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-300 ease-out"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {installLogText}
                  </p>
                </div>
              )}

              {/* INSTALL STEP 3: COMPLETE */}
              {installStep === 'complete' && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4 text-center shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">ইনস্টলেশন সফল হয়েছে!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      GO VPN v4.2 Turbo 5G সফলভাবে আপনার সিস্টেমে সেটআপ হয়েছে। এবার ওপেন করার সাথে সাথে কোড ভেরিফাই করে হোম স্ক্রিনে যান।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToOpenInstalledVpn}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                  >
                    <Power className="w-4 h-4" />
                    <span>⚡ ইনস্টল করা GO VPN ওপেন করুন</span>
                  </button>
                </div>
              )}
            </div>

            {onExploreServices && (
              <div className="text-center pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreServices();
                  }}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  এখনো সার্ভিস কেনেননি? প্যাকেজ কিনুন ও ইউনিক কোড নিন →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 2: INSTALLED APP - CODE REQUIRED SCREEN ===================== */}
        {/* Requirement: "pory instol kora vpn opn korar saty saty cod lagby cod dily pory vpn hom skin dakajaby" */}
        {modalMode === 'app' && !isHomeUnlocked && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            <div className="space-y-5 text-center my-auto">
              {/* Neon Cyber Shield with Lock */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cyan-500/15 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-cyan-500/50 flex items-center justify-center shadow-xl shadow-cyan-950/50">
                  <Lock className="w-9 h-9 text-cyan-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold inline-block mb-2">
                  🔒 সিকিউরিটি ভেরিফিকেশন
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">GO VPN কোড এক্টিভেশন</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-xs mx-auto">
                  ভিপিএন ওপেন করার সাথে সাথে কোড ভেরিফিকেশন লাগবে। <span className="text-cyan-400 font-bold">হোম স্ক্রিনে প্রবেশ করতে</span> আপনার কেনা ইউনিক কোডটি প্রদান করুন।
                </p>
              </div>

              {/* Unique Code Form */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5 text-left shadow-xl">
                {codeError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{codeError}</span>
                  </div>
                )}

                <form onSubmit={handleUnlockAppHomeSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ইউনিক কোড দিন (Unique Code)
                    </label>
                    <input
                      type="text"
                      required
                      value={codeInputValue}
                      onChange={(e) => setCodeInputValue(e.target.value.toUpperCase())}
                      placeholder="उदा. VIP-9821-XYZ"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono tracking-wider outline-none focus:border-cyan-400 text-center font-bold"
                    />
                  </div>

                  {/* Convenient 1-Tap Chip */}
                  {(initialCode || uniqueCode) && (
                    <div className="text-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCodeInputValue(initialCode || uniqueCode)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                      >
                        আপনার কোড বসান: {initialCode || uniqueCode}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingCode}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {isVerifyingCode ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>যাচাই হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        <span>🔓 কোড দিয়ে হোম স্ক্রিনে যান</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Re-install Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('installer');
                    setInstallStep('prompt_code');
                    setInstallProgress(0);
                    setCodeError('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  🔄 পুনরায় প্যাকেজ ইনস্টল করতে চান?
                </button>
              </div>
            </div>

            {onExploreServices && (
              <div className="text-center pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreServices();
                  }}
                  className="text-xs text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                >
                  সার্ভিস কিনুন ও ইউনিক কোড পান →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 3: VPN HOME SCREEN (AFTER CODE IS GIVEN) ===================== */}
        {/* Requirement: "cod dily pory vpn hom skin dakajaby" */}
        {modalMode === 'app' && isHomeUnlocked && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* VPN Tab Navigation */}
            <div className="grid grid-cols-3 bg-slate-900/90 border-b border-slate-800 text-xs font-bold p-1 gap-1">
              <button
                type="button"
                onClick={() => setActiveVpnTab('home')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeVpnTab === 'home'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>হোম</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveVpnTab('speedtest')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeVpnTab === 'speedtest'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>স্পিড টেস্ট</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveVpnTab('servers')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeVpnTab === 'servers'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-pink-400" />
                <span>সার্ভার ({VPN_SERVERS.length})</span>
              </button>
            </div>

            {/* TAB 1: HOME (POWER BUTTON, PLAN TIMER, ACTIVE SERVER) */}
            {activeVpnTab === 'home' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between space-y-4">
                {/* Plan Remaining Time Banner ("vp ar hom pag a plan onogae taime o dakaby") */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{order ? order.serviceTitle : 'প্ল্যান যুক্ত'}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono ${
                      !order
                        ? 'bg-amber-500/20 text-amber-300'
                        : remaining.isExpired
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {!order ? 'কোড দিন' : remaining.isExpired ? 'মেয়াদ শেষ' : 'সক্রিয় প্ল্যান'}
                    </span>
                  </div>

                  {/* Big Live Countdown Display */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                    <span className="text-xs text-slate-400">অবশিষ্ট মেয়াদ:</span>
                    <span className={`text-xl font-mono font-black tracking-wider ${
                      remaining.isExpired ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {remaining.isExpired
                        ? '00:00:00 (EXPIRED)'
                        : `${remaining.hours.toString().padStart(2, '0')}:${remaining.minutes.toString().padStart(2, '0')}:${remaining.seconds.toString().padStart(2, '0')}`
                      }
                    </span>
                  </div>
                </div>

                {/* Status Header text */}
                <div className="text-center pt-1">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase transition-colors ${
                    connectionState === 'connected'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : connectionState === 'connecting'
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse'
                      : 'bg-slate-850 text-slate-400 border border-slate-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      connectionState === 'connected' ? 'bg-emerald-400 animate-ping' : connectionState === 'connecting' ? 'bg-cyan-400' : 'bg-slate-500'
                    }`} />
                    <span>
                      {connectionState === 'connected' ? 'সংযুক্ত (Connected)' : connectionState === 'connecting' ? 'কানেক্ট হচ্ছে...' : 'বন্ধ আছে (Disconnected)'}
                    </span>
                  </div>
                </div>

                {/* GIANT CENTRAL POWER BUTTON ("opn kortay voro vaton takby majkany on korar") */}
                <div className="my-auto py-2 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing Outer Rings */}
                    {connectionState === 'connected' && (
                      <>
                        <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 animate-ping pointer-events-none" />
                        <div className="absolute w-52 h-52 rounded-full bg-cyan-500/10 animate-pulse pointer-events-none" />
                      </>
                    )}

                    {connectionState === 'connecting' && (
                      <div className="absolute w-44 h-44 rounded-full border-2 border-cyan-400/40 border-t-transparent animate-spin pointer-events-none" />
                    )}

                    {/* Giant Power Button */}
                    <button
                      type="button"
                      onClick={handleTogglePower}
                      className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl transform active:scale-95 ${
                        connectionState === 'connected'
                          ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 border-emerald-300 text-slate-950 shadow-emerald-500/50 scale-105'
                          : connectionState === 'connecting'
                          ? 'bg-slate-900 border-cyan-400 text-cyan-400 shadow-cyan-500/30'
                          : 'bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white shadow-black/80'
                      }`}
                    >
                      <Power className={`w-14 h-14 transition-transform duration-300 ${
                        connectionState === 'connected' ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                      }`} />
                      <span className="text-xs font-black tracking-wider uppercase mt-1 font-mono">
                        {connectionState === 'connected' ? 'চালু আছে' : connectionState === 'connecting' ? 'সংযুক্ত হচ্ছে' : 'চালু করুন'}
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center mt-3 font-mono">
                    {connectionState === 'connected'
                      ? '✓ আল্ট্রা-ফাস্ট প্রোটোকল সচল রয়েছে'
                      : 'মাঝের বাটনে ট্যাপ করে ভিপিএন অন করুন'}
                  </p>
                </div>

                {/* Connection Duration timer if connected */}
                {connectionState === 'connected' && (
                  <div className="text-center font-mono text-xs text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>কানেকশন সময়: {formatTime(connectedTimeSec)}</span>
                  </div>
                )}

                {/* Selected Server Card ("sarbar list takby") */}
                <div 
                  onClick={() => setActiveVpnTab('servers')}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between shadow-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl p-1 rounded-xl bg-slate-950 border border-slate-800">
                      {selectedServer.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{selectedServer.country}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          {selectedServer.ping}ms
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{selectedServer.city} • {selectedServer.protocol}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-cyan-400 font-bold">
                    <span>সার্ভার বদলান</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Quick Bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900 font-mono">
                  <span>কোড: {uniqueCode || '—'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHomeUnlocked(false);
                      setCodeError('');
                    }}
                    className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer"
                  >
                    কোড পরিবর্তন / লক
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SPEED TEST ("sppet tast takby vpn daky mony hoby onykak fast") */}
            {activeVpnTab === 'speedtest' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="text-center space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    ⚡ 5G TURBO SPEED BENCHMARK
                  </span>
                  <h4 className="text-base font-black text-white">GO VPN রিয়েল-টাইম স্পিড টেস্ট</h4>
                  <p className="text-xs text-slate-400">
                    আমাদের আল্ট্রা-ফাস্ট ডেডিকেটেড সার্ভারের বর্তমান গতি ও পিং টেস্ট করুন
                  </p>
                </div>

                {/* Main Speedometer Gauge Display */}
                <div className="my-auto flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* Animated Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="72"
                        className="text-slate-800"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="72"
                        className="text-cyan-400 transition-all duration-300"
                        strokeWidth="8"
                        strokeDasharray={452}
                        strokeDashoffset={isSpeedTesting ? 120 : 40}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <Gauge className="w-6 h-6 text-cyan-400 mb-1" />
                      <span className="text-3xl font-mono font-black text-white tracking-tight">
                        {speedTestStep === 'upload' ? testUpload : testDownload}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Mbps
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold mt-0.5">
                        {speedTestStep === 'ping' ? 'টেস্টিং পিং...' : speedTestStep === 'download' ? 'ডাউনলোড স্পিড' : speedTestStep === 'upload' ? 'আপলোড স্পিড' : 'সুপারফাস্ট গতি'}
                      </span>
                    </div>
                  </div>

                  {/* Benchmark Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 w-full pt-4 mt-2 border-t border-slate-800 text-center">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-[10px] text-slate-400 block font-mono">PING</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{testPing} ms</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-[10px] text-slate-400 block font-mono">DOWNLOAD</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">{testDownload} M</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-850">
                      <span className="text-[10px] text-slate-400 block font-mono">UPLOAD</span>
                      <span className="text-sm font-black text-pink-400 font-mono">{testUpload} M</span>
                    </div>
                  </div>
                </div>

                {/* Speed Test Action Button */}
                <button
                  type="button"
                  onClick={runSpeedTest}
                  disabled={isSpeedTesting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-98 disabled:opacity-50"
                >
                  {isSpeedTesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>টেস্ট চলছে...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4" />
                      <span>পুনরায় স্পিড টেস্ট শুরু করুন</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: SERVERS LIST ("sarbar list takby") */}
            {activeVpnTab === 'servers' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-pink-400" />
                    <span>আল্ট্রা-ফাস্ট ভিপিএন সার্ভারসমূহ</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {VPN_SERVERS.length}টি অ্যাক্টিভ
                  </span>
                </div>

                <div className="space-y-2">
                  {VPN_SERVERS.map((server) => {
                    const isSelected = selectedServer.id === server.id;

                    return (
                      <div
                        key={server.id}
                        onClick={() => {
                          setSelectedServer(server);
                          setActiveVpnTab('home');
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-slate-900 to-indigo-950/60 border-cyan-400 shadow-md shadow-cyan-950/40'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-1 rounded-xl bg-slate-950 border border-slate-850">
                            {server.flag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{server.country}</span>
                              {server.isVip && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-500/15 text-pink-400 font-bold border border-pink-500/20">
                                  VIP 5G
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">{server.city} • {server.protocol}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-emerald-400 block">
                            {server.ping} ms
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {server.load}% লোড
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
