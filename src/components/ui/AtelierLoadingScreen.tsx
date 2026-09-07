'use client';

import React from 'react';
import Link from 'next/link';
import { Scissors, Sparkles, User } from 'lucide-react';

export function AtelierLoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#13161C] text-[#F4EFEA] flex flex-col items-center justify-center p-6 atelier-grain">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Animated Brand Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#1D222A] border-2 border-[#C89B5C]/60 flex items-center justify-center text-[#C89B5C] shadow-2xl shadow-[#C89B5C]/20 animate-pulse">
            <Scissors className="w-8 h-8 stroke-[2.2] animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C89B5C] flex items-center justify-center text-[#13161C] shadow-md">
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="font-serif font-bold text-xl tracking-widest uppercase text-[#F4EFEA]">
            StitchTime
          </h2>
          <p className="text-xs font-mono text-[#9E988F]">
            {message || 'Verifying Atelier Session...'}
          </p>
        </div>

        {/* Loading Spinner Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D222A] border border-[rgba(158,152,143,0.2)] text-xs font-mono text-[#C89B5C]">
          <span className="w-2 h-2 rounded-full bg-[#C89B5C] animate-ping" />
          <span>Authenticating Session</span>
        </div>

        {/* Fallback Manual Log In Button */}
        <div className="mt-4 pt-4 border-t border-[rgba(158,152,143,0.15)] w-full flex flex-col items-center gap-2">
          <p className="text-[11px] font-mono text-[#9E988F]">Taking longer than expected?</p>
          <Link
            href="/sign-up"
            className="w-full py-2.5 px-4 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
          >
            <User className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Go to Log In / Sign Up Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
