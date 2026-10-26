import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { store } from '../services/store';
import { 
  Clock, Sparkles, CheckCircle2, AlertCircle, Copy, 
  Check, RefreshCw, ShoppingCart, 
  Download, Hourglass, ArrowRight, MessageCircle, AlertTriangle
} from 'lucide-react';
import { BkashLogo, NagadLogo } from './PaymentLogos';
import { WhatsAppIcon } from './WhatsAppModal';

interface MyPurchasedServicesProps {
  onBuyService: () => void;
  onGoToSetupAndApk: (code: string) => void;
  onOpenWhatsApp?: (customMsg?: string) => void;
}

export const MyPurchasedServices: React.FC<MyPurchasedServicesProps> = ({
  onBuyService,
  onGoToSetupAndApk,
  onOpenWhatsApp,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => store.getOrders());
  const [searchId, setSearchId] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRefresh = () => {
    setOrders(store.getOrders());
  };

  // Filter orders by search ID if provided
  const displayedOrders = searchId.trim()
    ? orders.filter(
        o =>
          o.customerId.toLowerCase().includes(searchId.toLowerCase()) ||
          o.uniqueCode.toLowerCase().includes(searchId.toLowerCase()) ||
          o.senderNumber.includes(searchId) ||
          o.trxId.toLowerCase().includes(searchId.toLowerCase())
      )
    : orders;

  // Helper to calculate countdown time
  const calculateRemaining = (expiresAt?: string) => {
    if (!expiresAt) {
      return { totalSeconds: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false };
    }
    const diffMs = new Date(expiresAt).getTime() - currentTime;
    if (diffMs <= 0) {
      return { totalSeconds: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { totalSeconds, hours, minutes, seconds, isExpired: false };
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-3">
            <Hourglass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>লাইভ কাউন্টডাউন ও প্যাকেজ ট্র্যাকার</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            আমার কেনা সার্ভিস সমূহ
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
            প্যাকেজ কেনার পর <span className="text-pink-400 font-bold">"৩টি এপিকে"</span> সেকশনে ইউনিক কোড সাবমিট করলে এখান থেকে আপনার সার্ভিসের লাইভ কাউন্টডাউন টাইমার শুরু হবে।
          </p>
        </div>

        {/* Search by Customer ID or Unique Code */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="আইডি বা ইউনিক কোড দিয়ে খুঁজুন..."
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer shrink-0"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders List with Live Countdown */}
      {displayedOrders.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">এখনও কোনো সার্ভিস কেনা হয়নি</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            আপনার পছন্দ অনুযায়ী ১ ঘন্টা, ৩ ঘন্টা বা ২৪ ঘন্টার যেকোনো প্রিমিয়াম সার্ভিস কিনতে নিচের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={onBuyService}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 cursor-pointer transition-all"
          >
            সার্ভিস ব্রাউজ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedOrders.map((order) => {
            const hasStarted = order.status === 'activated' && !!order.expiresAt;
            const { hours, minutes, seconds, isExpired } = calculateRemaining(order.expiresAt);

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-750 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all"
              >
                {/* Top: Service info & Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.serviceImage}
                        alt={order.serviceTitle}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded border border-pink-500/20">
                            {order.durationHours} ঘন্টা প্যাকেজ
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {order.orderNumber}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                          {order.serviceTitle}
                        </h4>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          ● মেয়াদ শেষ (Expired)
                        </span>
                      ) : order.status === 'activated' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                          ● সার্ভিস চালু আছে
                        </span>
                      ) : order.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                          ⏳ যাচাই অপেক্ষমাণ
                        </span>
                      ) : order.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          ✕ বাতিল
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
                          ✓ পেমেন্ট অনুমোদিত
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ===================== COUNTDOWN / STATUS BOX ===================== */}
                  {/* Requirement: "আমার কেনা সার্ভিস এখানে টাইমিং শুরু হবে তিনটি এপিকে এখানে ইউনিক কোড দেওয়ার পর আমার কিনা সার্ভিসের টাইমিং শুরু হবে" */}
                  <div className={`p-4 rounded-2xl border-2 transition-all ${
                    isExpired
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : hasStarted
                      ? 'bg-gradient-to-r from-emerald-950/30 via-slate-950/70 to-teal-950/30 border-emerald-500/40 shadow-inner'
                      : order.status === 'pending'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : order.status === 'rejected'
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-indigo-950/20 border-indigo-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${hasStarted ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
                        <span>সার্ভিস টাইমার স্ট্যাটাস:</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        মোট মেয়াদ: {order.durationHours} ঘন্টা
                      </span>
                    </div>

                    {/* Case 1: Expired */}
                    {isExpired ? (
                      <div className="py-2 text-center text-rose-300 font-bold text-sm">
                        ⚠️ এই সার্ভিসের {order.durationHours} ঘন্টার মেয়াদ শেষ হয়ে গেছে।
                      </div>
                    ) : hasStarted ? (
                      /* Case 2: Actively Counting Down */
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3 py-1.5 text-white font-mono">
                          {/* Hours */}
                          <div className="text-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 min-w-[64px]">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                              {String(hours).padStart(2, '0')}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-sans">ঘন্টা</div>
                          </div>
                          <span className="text-2xl font-black text-emerald-500/60">:</span>

                          {/* Minutes */}
                          <div className="text-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 min-w-[64px]">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                              {String(minutes).padStart(2, '0')}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-sans">মিনিট</div>
                          </div>
                          <span className="text-2xl font-black text-emerald-500/60">:</span>

                          {/* Seconds */}
                          <div className="text-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 min-w-[64px]">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-300 animate-pulse">
                              {String(seconds).padStart(2, '0')}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-sans">সেকেন্ড</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-center text-emerald-400/90 font-medium">
                          ● লাইভ কাউন্টডাউন চলছে। ৩টি এপিকে এখনই ডাউনলোড ও ব্যবহার করতে পারবেন।
                        </p>
                      </div>
                    ) : order.status === 'pending' ? (
                      /* Case 3: Pending verification */
                      <div className="py-2 text-center space-y-1">
                        <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                          <Hourglass className="w-4 h-4 animate-spin text-amber-400" />
                          <span>পেমেন্ট যাচাই প্রক্রিয়াধীন</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          এডমিন আপনার বিকাশ/নগদ TrxID কনফার্ম করার পর ৩টি এপিকে সেকশনে কোড দিলেই টাইমার শুরু হবে।
                        </p>
                      </div>
                    ) : order.status === 'rejected' ? (
                      /* Case 4: Rejected */
                      <div className="py-2 text-center text-rose-300 text-xs">
                        ❌ ভুল TrxID বা অসঙ্গতির কারণে এই অর্ডারটি বাতিল করা হয়েছে।
                      </div>
                    ) : (
                      /* Case 5: Verified, NOT YET STARTED -> "তিনটি এপিকে এখানে ইউনিক কোড দেওয়ার পর আমার কিনা সার্ভিসের টাইমিং শুরু হবে" */
                      <div className="py-2.5 px-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-center space-y-1.5">
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>টাইমার এখনও শুরু হয়নি (অপেক্ষমাণ)</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          পেমেন্ট নিশ্চিত হয়েছে! নিচের <span className="text-emerald-400 font-mono font-bold">ইউনিক কোডটি</span> নিয়ে <span className="text-pink-400 font-bold">"৩টি এপিকে"</span> সেকশনে সাবমিট করলেই আপনার <span className="text-white font-bold">{order.durationHours} ঘন্টার</span> লাইভ কাউন্টডাউন টাইমার শুরু হবে।
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer ID & Unique Code Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px]">আপনার আইডি নাম্বার:</span>
                      <span className="text-pink-400 font-mono font-bold text-sm truncate block mt-0.5">
                        {order.customerId}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">ইউনিক কোড:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.uniqueCode, order.id)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCodeId === order.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeId === order.id ? 'কপি হয়েছে' : 'কপি'}</span>
                        </button>
                      </div>
                      <span className="text-emerald-300 font-mono font-extrabold text-sm block mt-0.5 tracking-wider">
                        {order.uniqueCode}
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      {order.paymentMethod === 'bkash' ? (
                        <BkashLogo className="w-4 h-4 shrink-0" />
                      ) : (
                        <NagadLogo className="w-4 h-4 shrink-0" />
                      )}
                      <span className="uppercase font-semibold text-slate-300">
                        {order.paymentMethod} • Trx: {order.trxId}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm">
                      ৳ {order.amount.toLocaleString('bn-BD')}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions based on status */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  {isExpired ? (
                    <button
                      type="button"
                      onClick={onBuyService}
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>আবার নতুন করে কিনুন</span>
                    </button>
                  ) : hasStarted ? (
                    <button
                      type="button"
                      onClick={() => onGoToSetupAndApk(order.uniqueCode)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>৩টি এপিকে ডাউনলোড ও সেটাপ পেজ →</span>
                    </button>
                  ) : order.status === 'pending' ? (
                    <div className="flex w-full gap-2">
                      <button
                        type="button"
                        onClick={handleRefresh}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>স্ট্যাটাস রিফ্রেশ</span>
                      </button>
                      {onOpenWhatsApp && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(`পেমেন্ট অর্ডার: ${order.orderNumber}, TrxID: ${order.trxId}`)}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-500/40"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-300" />
                          <span>হোয়াটসঅ্যাপ সহায়তা</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Verified, ready to activate in 3 APKs */
                    <button
                      type="button"
                      onClick={() => onGoToSetupAndApk(order.uniqueCode)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-pink-600/20 transition-all cursor-pointer group"
                    >
                      <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>৩টি এপিকে সেকশনে কোড দিন ও টাইমার চালু করুন →</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
