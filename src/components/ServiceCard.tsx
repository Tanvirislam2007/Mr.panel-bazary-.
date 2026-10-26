import React from 'react';
import { Service } from '../types';
import { ShoppingCart, Download } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onBuyNow: (service: Service) => void;
  onFileSetup?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onBuyNow, 
  onFileSetup 
}) => {

  return (
    <div className="group relative bg-slate-900/95 hover:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 hover:border-pink-500/50 shadow-xl shadow-slate-950/60 p-2 sm:p-3 flex flex-col justify-between transition-all duration-300 overflow-hidden">
      {/* Top Poster Image Area: Clean 1:1 square image, absolutely NO text or overlay badges */}
      <div 
        onClick={onFileSetup}
        className="relative w-full aspect-square max-h-44 sm:max-h-48 md:max-h-52 mx-auto rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 cursor-pointer border border-slate-800/80 group-hover:border-pink-500/40 transition-colors"
        title="এপিকে ও ফাইল বিস্তারিত দেখতে ক্লিক করুন"
      >
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Card Content & Action Buttons */}
      <div className="pt-2 sm:pt-3 flex flex-col justify-between flex-1">
        {/* Outlined Pill with Title (Exact match to reference image) */}
        <div className="px-2 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-center shadow-inner mb-1">
          <h3 
            className="text-[11px] sm:text-xs font-black text-slate-100 uppercase tracking-tight truncate"
            title={service.title}
          >
            {service.title}
          </h3>
        </div>

        {/* Vibrant Large Price (e.g. PRICE 20৳, PRICE 150৳) */}
        <div className="text-center font-black text-emerald-400 text-base sm:text-lg tracking-tight my-1 sm:my-1.5 font-mono drop-shadow-sm">
          PRICE {service.price}৳
        </div>

        {/* Two Stacked Action Buttons matching screenshot */}
        <div className="space-y-1.5 pt-0.5">
          {/* 1. APK INSTALL Button (Blue) */}
          <button
            type="button"
            onClick={onFileSetup}
            className="w-full py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
            title="এপিকে ও ফাইল ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            <span>APK INSTALL</span>
          </button>

          {/* 2. BUY NOW Button (Pink / Rose Gradient) */}
          <button
            type="button"
            onClick={() => onBuyNow(service)}
            disabled={!service.isAvailable}
            className={`w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 ${
              service.isAvailable
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{service.isAvailable ? 'BUY NOW' : 'STOCK OUT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
