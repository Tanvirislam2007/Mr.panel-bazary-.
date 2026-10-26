import React from 'react';
import { ShoppingCart, Smartphone, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '০১',
      title: 'পছন্দের সার্ভিস সিলেক্ট করুন',
      desc: 'আমাদের সার্ভিস তালিকা থেকে আপনার প্রয়োজনীয় ডিজিটাল সার্ভিস বেছে নিন এবং "এখনই কিনুন" বাটনে ক্লিক করুন।',
      icon: ShoppingCart,
      color: 'from-pink-500 to-rose-500',
    },
    {
      step: '০২',
      title: 'বিকাশ বা নগদ দিয়ে পেমেন্ট করুন',
      desc: 'আপনার পছন্দের মাধ্যম (bKash অথবা Nagad) বেছে নিন, নম্বরে Send Money করুন এবং TrxID ও আপনার আইডি নাম্বার দিন।',
      icon: Smartphone,
      color: 'from-amber-500 to-orange-500',
    },
    {
      step: '০৩',
      title: 'ইউনিক কোড সংগ্রহ করুন',
      desc: 'পেমেন্ট সম্পন্ন হলে সাথে সাথে স্ক্রিনে আপনার জন্য একটি নিরাপদ "ইউনিক অ্যাক্টিভেশন কোড" জেনারেট হয়ে প্রদর্শিত হবে।',
      icon: KeyRound,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      step: '০৪',
      title: 'কোড ও আইডি দিয়ে সার্ভিস চালু করুন',
      desc: '"সার্ভিস চালু ও চেক" অপশনে গিয়ে আপনার ইউনিক কোড ও আইডি নাম্বার দিলে মুহূর্তেই আপনার সার্ভিস চালু হয়ে যাবে!',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-slate-950 border-t border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
            সহজ ৪ ধাপ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
            কিভাবে সার্ভিস কিনবেন ও চালু করবেন?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            সম্পূর্ণ স্বয়ংক্রিয় ও নিরাপদ পদ্ধতি - কোনো ঝামেলা ছাড়া কয়েক মিনিটেই সেবা উপভোগ করুন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-900/60 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-slate-700 font-mono group-hover:text-pink-500/40 transition-colors">
                      {item.step}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
