import React, { useState } from 'react';
import { 
  X, MessageCircle, Phone, Clock, ShieldCheck, 
  Copy, Check, ExternalLink, Sparkles, Send
} from 'lucide-react';
import { PaymentConfig } from '../types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentConfig: PaymentConfig;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    stroke="currentColor" 
    strokeWidth="0" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.66 20.16 9.3 19.81 8.1 19.14L7.81 18.97L4.69 19.79L5.52 16.75L5.33 16.45C4.59 15.27 4.2 13.62 4.2 11.92C4.2 7.38 7.9 3.67 12.04 3.67ZM8.83 7.35C8.63 7.35 8.44 7.36 8.27 7.69C8.07 8.08 7.42 8.68 7.42 9.94C7.42 11.2 8.34 12.41 8.47 12.58C8.6 12.75 10.28 15.35 12.84 16.46C14.97 17.38 15.4 17.2 15.86 17.16C16.32 17.12 17.34 16.56 17.55 15.97C17.76 15.38 17.76 14.88 17.7 14.77C17.64 14.66 17.47 14.6 17.22 14.47C16.97 14.35 15.74 13.74 15.51 13.66C15.28 13.58 15.11 13.53 14.95 13.78C14.78 14.03 14.3 14.6 14.15 14.77C14 14.94 13.85 14.96 13.6 14.84C13.35 14.71 12.54 14.45 11.59 13.6C10.85 12.94 10.35 12.12 10.2 11.87C10.05 11.62 10.18 11.48 10.31 11.36C10.42 11.25 10.56 11.07 10.68 10.92C10.81 10.78 10.85 10.67 10.93 10.5C11.01 10.33 10.97 10.19 10.91 10.06C10.85 9.94 10.35 8.72 10.14 8.22C9.94 7.73 9.74 7.8 9.58 7.79C9.43 7.78 9.26 7.78 9.09 7.78C8.92 7.78 8.83 7.35 8.83 7.35Z"/>
  </svg>
);

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  paymentConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<'payment' | 'apk' | 'code' | 'general'>('payment');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const rawPhone = paymentConfig.supportWhatsApp || '+880 1834-892100';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  const topics = [
    {
      id: 'payment',
      title: 'পেমেন্ট ও TrxID যাচাই',
      message: 'হ্যালো সেবা পে টিম, আমি পেমেন্ট করেছি এবং TrxID যাচাই নিয়ে সাহায্য চাই।',
    },
    {
      id: 'apk',
      title: '৩টি এপিকে ডাউনলোড ও সেটাপ',
      message: 'হ্যালো সেবা পে টিম, আমি ৩টি এপিকে ডাউনলোড ও কনফিগারেশন নিয়ে সাহায্য চাই।',
    },
    {
      id: 'code',
      title: 'ইউনিক কোড সংক্রান্ত তথ্য',
      message: 'হ্যালো সেবা পে টিম, আমি আমার ইউনিক কোড এবং সার্ভিস মেয়াদ সংক্রান্ত তথ্য জানতে চাই।',
    },
    {
      id: 'general',
      title: 'অন্যান্য জিজ্ঞাসা',
      message: paymentConfig.whatsAppGreeting || 'হ্যালো সেবা পে টিম, আমি সেবা পে সার্ভিস সম্পর্কে জানতে চাই।',
    },
  ];

  const currentTopic = topics.find(t => t.id === selectedTopic) || topics[0];
  const finalMessage = customNote.trim() 
    ? `${currentTopic.message} বিস্তারিত: ${customNote.trim()}`
    : currentTopic.message;

  const whatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(rawPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with WhatsApp Colors */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-lg shadow-black/20">
              <WhatsAppIcon className="w-8 h-8 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 text-emerald-100 text-xs font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
                <span>২৪/৭ লাইভ কাস্টমার সাপোর্ট</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                হোয়াটসঅ্যাপে যোগাযোগ
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                যেকোনো সমস্যা, পেমেন্ট সহায়তা বা এপিকে সেটাপে তাৎক্ষণিক সমাধান
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Official WhatsApp Number Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">অফিসিয়াল সাপোর্ট নাম্বার:</span>
                <span className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                  {rawPhone}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyPhone}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
            </button>
          </div>

          {/* Quick Support Topics */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 block">
              কী বিষয়ে সহায়তা প্রয়োজন? (টপিক সিলেক্ট করুন):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTopic(item.id as any)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                    selectedTopic === item.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-md shadow-emerald-950/40'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.title}</span>
                    {selectedTopic === item.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>মেসেজ প্রিভিউ / অতিরিক্ত কোনো তথ্য (ঐচ্ছিক):</span>
              <span className="text-[10px] text-slate-500">হোয়াটসঅ্যাপে প্রি-ফিল হয়ে যাবে</span>
            </label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
              "{finalMessage}"
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer group"
            >
              <WhatsAppIcon className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
              <span>সরাসরি হোয়াটসঅ্যাপে চ্যাট শুরু করুন</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>গড় রেসপন্স টাইম: ১-৫ মিনিট</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
