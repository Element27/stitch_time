'use client';

import React from 'react';
import Link from 'next/link';
import { SyncStatusBar } from '@/components/atelier/SyncStatusBar';
import { Sparkles, User, ShieldCheck } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';

export function AtelierHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#141312]/90 backdrop-blur-md border-b border-[rgba(214,203,189,0.12)]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 safe-top">
        {/* Brand & Atelier Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#242220] border border-[#C89B3C]/40 flex items-center justify-center text-[#C89B3C] group-hover:border-[#C89B3C] transition-colors shadow-sm">
            <span className="font-serif font-bold text-sm">S&T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold tracking-widest text-xs uppercase text-[#FAF7F2]">
                Stitch &amp; Time
              </span>
              <span className="text-[9px] font-mono uppercase px-1 rounded bg-[#C89B3C]/20 text-[#E0BA62] border border-[#C89B3C]/30">
                Atelier
              </span>
            </div>
            {title ? (
              <h1 className="text-sm font-semibold text-[#FAF7F2] truncate max-w-[200px]">
                {title}
              </h1>
            ) : (
              <p className="text-[11px] font-mono text-[#9E948A]">Bespoke Companion</p>
            )}
          </div>
        </Link>

        {/* Right Side: Sync Badge & Clerk User */}
        <div className="flex items-center gap-2.5">
          <SyncStatusBar compact />

          {hasClerk ? (
            <div className="flex items-center">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-7 h-7 border border-[#C89B3C]/40',
                  },
                }}
              />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-[#242220] border border-[rgba(214,203,189,0.2)] flex items-center justify-center text-xs text-[#E0BA62]"
              title="Atelier Offline Master Mode Active"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
