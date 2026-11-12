import React from 'react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';

export const AnnouncementBar = () => {
  const { settings } = useStoreSettings();
  const text = settings?.announcement_text || 'Discover your next favourite collectible. Free Express Shipping on orders over ₹999!';

  return (
    <div className="bg-charcoal text-white text-xs tracking-wider uppercase py-2 px-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center justify-center gap-2 w-full md:w-auto font-medium">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse-subtle" />
          <span>{text}</span>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-[11px] text-charcoal-300">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-accent" /> Pan-India Tracked Dispatch
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-accent" /> Verified UPI Direct Transfer
          </span>
        </div>
      </div>
    </div>
  );
};

