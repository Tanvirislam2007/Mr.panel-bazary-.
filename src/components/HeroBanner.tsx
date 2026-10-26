import React from 'react';
import { BannerConfig } from '../types';
import { Play, ExternalLink } from 'lucide-react';

interface HeroBannerProps {
  banner: BannerConfig;
  onExploreServices: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banner,
  onExploreServices,
}) => {
  if (!banner.isEnabled || !banner.imageUrl) return null;

  const handleBannerClick = () => {
    const ytUrl = (banner.youtubeUrl || '').trim();
    if (ytUrl) {
      const a = document.createElement('a');
      a.href = ytUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      onExploreServices();
    }
  };

  const hasYouTube = Boolean((banner.youtubeUrl || '').trim());

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-2 sm:pb-4">
      {/* 
        PURE BANNER IMAGE WITH DIRECT YOUTUBE VIDEO CLICK
        Requirement: "মূল ব্যানারে ক্লিক করলে ইউটিউব ভিডিওতে নিয়ে যাবে, ইউটিউব ভিডিও লিংক দেওয়ার অপশন এডমিন প্যানেলে থাকবে"
      */}
      <div 
        onClick={handleBannerClick}
        className="w-full relative rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl overflow-hidden bg-slate-950 cursor-pointer block group"
        title={hasYouTube ? 'ইউটিউব ভিডিও দেখতে ক্লিক করুন' : 'সার্ভিস সমূহ দেখতে ক্লিক করুন'}
      >
        <img
          src={banner.imageUrl}
          alt="Banner"
          className="w-full h-auto max-h-[500px] object-cover sm:object-contain object-center block bg-slate-950 transition-transform duration-300 group-hover:scale-[1.008]"
          loading="eager"
        />

        {/* YouTube Video Indicator Badge on Top Right: "ইউটিউব ভিডিও দেখুন ai lakata dan sait ar opr dao" */}
        {hasYouTube && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-red-600/50 backdrop-blur-md transition-all group-hover:scale-105 border border-red-400/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white" />
            <span>ইউটিউব ভিডিও দেখুন</span>
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
};
