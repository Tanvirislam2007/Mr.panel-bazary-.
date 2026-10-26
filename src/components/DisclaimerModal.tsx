import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecked) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900/95 border-2 border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 p-6 sm:p-8 text-center space-y-6 animate-scaleIn">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-rose-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Warning Icon Badge */}
        <div className="relative w-20 h-20 rounded-3xl bg-rose-500/15 border-2 border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner shadow-rose-500/20">
          <ShieldAlert className="w-10 h-10 animate-pulse text-rose-400" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
            !
          </span>
        </div>

        {/* Title */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>জরুরি সতর্কতা ও শর্তাবলী</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            প্রবেশের পূর্বে শর্তটি মনোযোগ দিয়ে পড়ুন
          </h2>
        </div>

        {/* The exact text required by the user */}
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-slate-200 text-sm sm:text-base leading-relaxed text-left space-y-2 shadow-inner">
          <p className="font-semibold text-rose-200 text-center sm:text-left">
            "যেকোনো সমস্যা বা যেকোনো কারণে যদি সার্ভিস চালু না হয় বা কোনো দাবি রাখতে পারবেন না—এই শর্তে প্রবেশ করুন।"
          </p>
          <p className="text-xs text-slate-400 pt-2 border-t border-rose-500/20 leading-normal">
            * এটি একটি বিশেষ ডিজিটাল অনলাইন সেবা প্ল্যাটফর্ম। সার্ভিসের সকল নিয়মাবলী ও সময়সীমা নিজ দায়িত্বে জেনে বুঝে ব্যবহার করার অনুরোধ করা হচ্ছে।
          </p>
        </div>

        {/* Checkbox Agreement */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer select-none text-left transition-colors">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-900 cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-300">
              আমি সকল শর্ত মেনে নিয়ে সম্মতি প্রদান করছি এবং সাইটে প্রবেশ করতে চাই।
            </span>
          </label>

          {/* Accept / Continue Button */}
          <button
            type="submit"
            disabled={!isChecked}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl ${
              isChecked
                ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white shadow-rose-600/30 cursor-pointer hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>ঠিক আছে, শর্ত মেনে প্রবেশ করুন</span>
          </button>
        </form>
      </div>
    </div>
  );
};
