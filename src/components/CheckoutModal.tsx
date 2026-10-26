import React, { useState, useEffect } from 'react';
import { Service, PaymentConfig, Order } from '../types';
import { store } from '../services/store';
import { 
  X, Check, Copy, ArrowRight, ShieldCheck, Sparkles, 
  Smartphone, QrCode, AlertCircle, CheckCircle2, 
  Info, Loader2, Clock, Hourglass, RefreshCw, AlertTriangle
} from 'lucide-react';
import { BkashLogo, NagadLogo } from './PaymentLogos';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  service: Service | null;
  paymentConfig: PaymentConfig;
  isOpen: boolean;
  onClose: () => void;
  onGoToApkDownload: (uniqueCode: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  service,
  paymentConfig,
  isOpen,
  onClose,
  onGoToApkDownload,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Poll order status if order is pending approval
  useEffect(() => {
    if (!completedOrder || completedOrder.status !== 'pending') return;

    const interval = setInterval(() => {
      const orders = store.getOrders();
      const current = orders.find(o => o.id === completedOrder.id);
      if (current && current.status !== completedOrder.status) {
        setCompletedOrder(current);
        if (current.status === 'activated') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#38bdf8', '#e2136e'],
          });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [completedOrder]);

  if (!isOpen || !service) return null;

  const currentNumber = paymentMethod === 'bkash' ? paymentConfig.bkashNumber : paymentConfig.nagadNumber;
  const currentType = paymentMethod === 'bkash' ? paymentConfig.bkashType : paymentConfig.nagadType;
  const currentQr = paymentMethod === 'bkash' ? paymentConfig.bkashQr : paymentConfig.nagadQr;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentNumber.replace(/[^0-9]/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExitAndClose = () => {
    setCompletedOrder(null);
    setSenderNumber('');
    setTrxId('');
    setErrorMessage('');
    setShowQr(false);
    onClose();
  };

  const handleManualCheckStatus = () => {
    if (!completedOrder) return;
    setIsCheckingStatus(true);
    setTimeout(() => {
      const orders = store.getOrders();
      const current = orders.find(o => o.id === completedOrder.id);
      if (current) {
        setCompletedOrder(current);
        if (current.status === 'activated') {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#38bdf8', '#e2136e'],
          });
        }
      }
      setIsCheckingStatus(false);
    }, 600);
  };

  // Submit Manual Payment with Strict Verification
  const handleSubmitManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanSender = senderNumber.trim().replace(/[^0-9]/g, '');
    const cleanTrx = trxId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const targetReceiver = currentNumber.replace(/[^0-9]/g, '');

    // 1. Strict 11-digit Bangladeshi mobile number validation
    const bdRegex = /^(013|014|015|016|017|018|019)\d{8}$/;
    if (!bdRegex.test(cleanSender)) {
      setErrorMessage('ভুল মোবাইল নম্বর! অনুগ্রহ করে ১১ ডিজিটের সঠিক ও সক্রিয় বাংলাদেশী বিকাশ/নগদ নম্বর দিন (যেমন: 017xxxxxxxx, 018xxxxxxxx)।');
      return;
    }

    // Prevent fake or dummy numbers
    const fakeNumbers = [
      '01700000000', '01711111111', '01712345678', '01812345678', '01912345678', 
      '01612345678', '01512345678', '01800000000', '01900000000', '01600000000',
      '01300000000', '01400000000', '01888888888', '01999999999', '01799999999'
    ];
    if (fakeNumbers.includes(cleanSender) || /^01\d(\d)\1{7}$/.test(cleanSender)) {
      setErrorMessage('অকার্যকর বা ভুয়া মোবাইল নম্বর গ্রহণযোগ্য নয়! অনুগ্রহ করে আপনার নিজস্ব প্রকৃত নম্বর দিন।');
      return;
    }

    // Prevent using receiver number as sender
    if (cleanSender === targetReceiver) {
      setErrorMessage('প্রাপক নম্বর এবং আপনার প্রেরক নম্বর একই হতে পারে না! আপনি যে ব্যক্তিগত অ্যাকাউন্ট থেকে টাকা পাঠিয়েছেন সেই নম্বরটি দিন।');
      return;
    }

    // 2. Strict Method-Specific TrxID Format Check
    if (paymentMethod === 'bkash') {
      if (cleanTrx.length !== 10 || !/[A-Z]/.test(cleanTrx) || !/[0-9]/.test(cleanTrx)) {
        setErrorMessage('ভুল বিকাশ TrxID! বিকাশ ট্রানজেকশন আইডি অবশ্যই ঠিক ১০ ডিজিটের আলফানিউমেরিক কোড হতে হবে (যেমন: BKT92918840)।');
        return;
      }
    } else {
      if (cleanTrx.length !== 8 || !/[A-Z]/.test(cleanTrx) || !/[0-9]/.test(cleanTrx)) {
        setErrorMessage('ভুল নগদ TrxID! নগদ ট্রানজেকশন আইডি অবশ্যই ঠিক ৮ ডিজিটের আলফানিউমেরিক কোড হতে হবে (যেমন: 71KA9021)।');
        return;
      }
    }

    // Reject obvious fake/dummy TrxIDs
    const fakeTrxPatterns = [
      '12345678', '00000000', '11111111', '87654321', 'TEST', 'DEMO', 
      'TRXID', 'FAKE', 'ABCDEF', 'BKASH', 'NAGAD', 'PAYMENT', 'DUMMY'
    ];
    const hasFakePattern = fakeTrxPatterns.some(pat => cleanTrx.includes(pat)) || /^([A-Z0-9])\1{6,}$/.test(cleanTrx);
    if (hasFakePattern) {
      setErrorMessage('অকার্যকর বা ভুয়া TrxID সনাক্ত হয়েছে! অনুগ্রহ করে বিকাশ/নগদ অ্যাপ থেকে টাকা পাঠিয়ে সঠিক এসএমএস TrxID দিন।');
      return;
    }

    // 3. Duplicate TrxID Prevention
    const orders = store.getOrders();
    const isDuplicate = orders.some(
      o => o.trxId.toUpperCase() === cleanTrx && o.status !== 'rejected'
    );
    if (isDuplicate) {
      setErrorMessage('এই ট্রানজেকশন আইডি (TrxID) দিয়ে ইতিপূর্বে পেমেন্ট সম্পন্ন হয়েছে! ডুপ্লিকেট TrxID গ্রহণযোগ্য নয়।');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const order = store.createOrder({
          serviceId: service.id,
          customerName: 'গ্রাহক',
          customerPhone: cleanSender,
          senderNumber: cleanSender,
          customerId: cleanSender,
          trxId: cleanTrx,
          paymentMethod,
        });

        setCompletedOrder(order);
        setIsSubmitting(false);

        if (order.status === 'activated') {
          // Celebration confetti burst if auto-approved
          confetti({
            particleCount: 110,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#e2136e', '#f7941d', '#10b981', '#38bdf8'],
          });
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'পেমেন্ট সাবমিট করতে সমস্যা হয়েছে। সঠিক তথ্য দিন।');
        setIsSubmitting(false);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black overflow-hidden my-4">
        {/* Top Header with Clear Exit Option */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {completedOrder ? 'পেমেন্ট রসিদ ও ভেরিফিকেশন' : 'ম্যানুয়াল পেমেন্ট সিস্টেম (Send Money)'}
              </h2>
              <p className="text-xs text-slate-400">
                {completedOrder 
                  ? `অর্ডার #${completedOrder.orderNumber} • ${completedOrder.durationHours} ঘন্টা প্যাকেজ`
                  : `${service.durationHours} ঘন্টা প্যাকেজ • ৳ ${service.price}`}
              </p>
            </div>
          </div>

          {/* EXIT BUTTON */}
          <button
            onClick={handleExitAndClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 text-xs font-semibold transition-all cursor-pointer"
            title="পেমেন্ট থেকে বের হন"
          >
            <X className="w-4 h-4" />
            <span>বের হন (Exit)</span>
          </button>
        </div>

        {/* ===================== VIEW 1: ORDER RECEIPT & VERIFICATION STATUS ===================== */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* STATUS HEADER */}
            {completedOrder.status === 'activated' ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 animate-bounce">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>পেমেন্ট অনুমোদিত ও সক্রিয়</span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  আপনার সার্ভিস সফলভাবে সক্রিয় হয়েছে!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  নিচের ইউনিক কোড দিয়ে সরাসরি ৩টি এপিকে ডাউনলোড করুন।
                </p>
              </div>
            ) : completedOrder.status === 'rejected' ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-9 h-9" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold mb-2">
                  <X className="w-3.5 h-3.5" />
                  <span>পেমেন্ট বাতিল (Rejected)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ভুল তথ্যের কারণে পেমেন্ট বাতিল করা হয়েছে
                </h3>
                <p className="text-xs sm:text-sm text-rose-300 mt-1">
                  আপনার প্রদানকৃত TrxID অথবা মোবাইল নম্বরের সাথে বিকাশ/নগদ পেমেন্টের মিল পাওয়া যায়নি।
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Hourglass className="w-9 h-9 animate-spin" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>পেমেন্ট যাচাই প্রক্রিয়াধীন (Pending Verification)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
                  এডমিন প্যানেলে আপনার পেমেন্ট তথ্য (TrxID: <span className="font-mono text-amber-300 font-bold">{completedOrder.trxId}</span>) স্টেটমেন্টের সাথে যাচাই করা হচ্ছে।
                </p>
              </div>
            )}

            {/* Prominent Unique Activation Code Box */}
            <div className={`rounded-2xl border-2 p-5 text-center relative overflow-hidden shadow-xl ${
              completedOrder.status === 'activated'
                ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border-emerald-500/50'
                : completedOrder.status === 'rejected'
                ? 'bg-rose-950/20 border-rose-500/40'
                : 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border-amber-500/40'
            }`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${completedOrder.status === 'activated' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className={completedOrder.status === 'activated' ? 'text-emerald-400' : 'text-amber-400'}>
                  আপনার ইউনিক অ্যাক্টিভেশন কোড (Unique Code)
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-widest my-2 select-all font-mono text-white">
                {completedOrder.uniqueCode}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                প্যাকেজের মেয়াদ: <span className="text-white font-bold">{completedOrder.durationHours} ঘন্টা</span> • 
                {completedOrder.status === 'activated' 
                  ? ' এই কোড দিয়ে ৩টি এপিকে এখনই ডাউনলোড করতে পারবেন।'
                  : ' এডমিন পেমেন্ট অনুমোদন করার সাথে সাথেই ডাউনলোড আনলক হবে।'}
              </p>
              <button
                type="button"
                onClick={() => handleCopyCode(completedOrder.uniqueCode)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'কোড কপি হয়েছে!' : 'ইউনিক কোড কপি করুন'}</span>
              </button>
            </div>

            {/* Pending Status Live Check Action */}
            {completedOrder.status === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-300">
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>স্বয়ংক্রিয়ভাবে প্রতি কয়েক সেকেন্ড পর পর পেমেন্ট যাচাই হচ্ছে...</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualCheckStatus}
                  disabled={isCheckingStatus}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {isCheckingStatus ? 'যাচাই হচ্ছে...' : 'স্ট্যাটাস রিফ্রেশ করুন'}
                </button>
              </div>
            )}

            {/* Order Details Grid */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">অর্ডার নম্বর:</span>
                <span className="text-slate-200 font-mono font-bold">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">প্যাকেজ ও মেয়াদ:</span>
                <span className="text-white font-medium text-right">
                  {completedOrder.serviceTitle} ({completedOrder.durationHours} ঘন্টা)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">যে নাম্বার থেকে টাকা পাঠিয়েছেন:</span>
                <span className="text-slate-200 font-mono font-bold">{completedOrder.senderNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">মেথড ও ট্রানজেকশন আইডি:</span>
                <div className="flex items-center gap-1.5 font-bold uppercase font-mono">
                  {completedOrder.paymentMethod === 'bkash' ? <BkashLogo className="w-4 h-4" /> : <NagadLogo className="w-4 h-4" />}
                  <span>{completedOrder.paymentMethod} • {completedOrder.trxId}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">পরিশোধিত টাকা:</span>
                <span className="text-lg font-black text-emerald-400">
                  ৳ {completedOrder.amount.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Actions depending on status */}
            <div className="space-y-3 pt-2">
              {completedOrder.status === 'activated' ? (
                <button
                  type="button"
                  onClick={() => {
                    onGoToApkDownload(completedOrder.uniqueCode);
                    handleExitAndClose();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>এই কোড দিয়ে ৩টি এপিকে ডাউনলোড পেজে যান</span>
                </button>
              ) : completedOrder.status === 'rejected' ? (
                <button
                  type="button"
                  onClick={() => {
                    setCompletedOrder(null);
                    setTrxId('');
                    setErrorMessage('');
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন
                </button>
              ) : (
                <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                  🔒 পেমেন্ট নিশ্চিত হওয়া পর্যন্ত অপেক্ষা করুন অথবা উইন্ডো বন্ধ করে পরবর্তীতে ইউনিক কোড দিয়ে এপিকে আনলক করুন।
                </div>
              )}

              <button
                type="button"
                onClick={handleExitAndClose}
                className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                পেমেন্ট উইন্ডো বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* ===================== VIEW 2: MANUAL PAYMENT FORM ===================== */
          <form onSubmit={handleSubmitManualPayment} className="p-5 sm:p-7 space-y-6">
            {/* Package Summary Box */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{service.title}</h4>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.durationHours} ঘন্টা প্যাকেজ</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">মোট মূল্য:</span>
                <span className="text-xl font-black text-white">৳ {service.price}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Choose bKash or Nagad */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-200">
                ১. পেমেন্ট মাধ্যম বেছে নিন (বিকাশ অথবা নগদ):
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-[#e2136e] bg-[#e2136e]/15 shadow-md shadow-[#e2136e]/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-[#e2136e]/40 p-1 flex items-center justify-center">
                      <BkashLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-xs sm:text-sm">বিকাশ (bKash)</div>
                      <div className="text-[10px] text-pink-300 font-mono">{paymentConfig.bkashType}</div>
                    </div>
                  </div>
                  {paymentMethod === 'bkash' && (
                    <div className="w-4 h-4 rounded-full bg-[#e2136e] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-[#f7941d] bg-[#f7941d]/15 shadow-md shadow-[#f7941d]/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-[#f7941d]/40 p-1 flex items-center justify-center">
                      <NagadLogo className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-xs sm:text-sm">নগদ (Nagad)</div>
                      <div className="text-[10px] text-amber-300 font-mono">{paymentConfig.nagadType}</div>
                    </div>
                  </div>
                  {paymentMethod === 'nagad' && (
                    <div className="w-4 h-4 rounded-full bg-[#f7941d] text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>

              {/* Number Card with Copy Button */}
              <div className={`p-4 rounded-2xl border transition-all ${
                paymentMethod === 'bkash' 
                  ? 'bg-[#e2136e]/10 border-[#e2136e]/30' 
                  : 'bg-[#f7941d]/10 border-[#f7941d]/30'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      {paymentMethod === 'bkash' ? <BkashLogo className="w-4 h-4" /> : <NagadLogo className="w-4 h-4" />}
                      <span>টাকা পাঠানোর {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} নম্বর ({currentType}):</span>
                    </span>
                    <div className="text-2xl font-black text-white font-mono tracking-wider mt-0.5">
                      {currentNumber}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumber ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQr ? 'QR লুকান' : 'QR কোড'}</span>
                    </button>
                  </div>
                </div>

                {/* Optional QR Code View */}
                {showQr && (
                  <div className="text-center py-3 border-t border-slate-800 mt-2">
                    <img src={currentQr} alt="QR Code" className="w-36 h-36 mx-auto rounded-xl bg-white p-2 shadow" />
                    <p className="text-[11px] text-slate-400 mt-1">অ্যাপ দিয়ে কিউআর কোড স্ক্যান করে পেমেন্ট করুন</p>
                  </div>
                )}

                {/* Send Money Instructions */}
                <div className="text-xs text-slate-300 space-y-1 bg-slate-950/70 p-3 rounded-xl border border-slate-800 mt-2">
                  <p className="flex items-center gap-1.5 font-bold text-white">
                    <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>পেমেন্ট নিয়ম:</span>
                  </p>
                  <p>১. আপনার {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} অ্যাপ ওপেন করে <strong>Send Money</strong> করুন।</p>
                  <p>২. প্রাপক নম্বরে <strong>{currentNumber}</strong> দিয়ে টাকার পরিমাণ <strong>৳ {service.price}</strong> দিন।</p>
                  <p>৩. টাকা পাঠানো সম্পন্ন হলে এসএমএস থেকে <strong>সঠিক TrxID</strong> এবং আপনার <strong>প্রেরক নম্বরটি</strong> নিচে লিখুন।</p>
                </div>
              </div>
            </div>

            {/* Step 2: Form Inputs (Sender Phone + TrxID) */}
            <div className="space-y-4 pt-1 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-200">
                ২. পেমেন্ট সম্পন্ন করে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    যে নাম্বার থেকে টাকা পাঠিয়েছেন (Sender No) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white placeholder-slate-500 text-sm outline-none transition-all font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">আপনার ১১ ডিজিটের বিকাশ/নগদ নম্বর</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ট্রানজেকশন আইডি (TrxID) <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={paymentMethod === 'bkash' ? 10 : 8}
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder={paymentMethod === 'bkash' ? "১০ ডিজিট (যেমন: BKT9291884)" : "৮ ডিজিট (যেমন: 71KA9021)"}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-white placeholder-slate-500 text-sm outline-none transition-all font-mono uppercase"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {paymentMethod === 'bkash' ? 'বিকাশের ১০ ডিজিট TrxID' : 'নগদের ৮ ডিজিট TrxID'}
                  </p>
                </div>
              </div>

              {/* Security notice (No demo button) */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>সতর্কতা: ভুল বা অসত্য তথ্য দিয়ে সাবমিট করলে অর্ডার সাথে সাথে বাতিল ও ব্লক করা হবে।</span>
              </div>
            </div>

            {/* Submit & Cancel Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-base shadow-xl shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>পেমেন্ট তথ্য যাচাই করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>পেমেন্ট নিশ্চিত করুন ও ইউনিক কোড নিন</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">🔒 ১০০% নিরাপদ পেমেন্ট যাচাই ব্যবস্থা</span>
                <button
                  type="button"
                  onClick={handleExitAndClose}
                  className="text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                >
                  পেমেন্ট বাতিল ও বের হন
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
