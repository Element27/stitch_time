'use client';

import React from 'react';
import Link from 'next/link';
import { SyncStatusBar } from '@/components/atelier/SyncStatusBar';
import { Sparkles, User, ShieldCheck } from 'lucide-react';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';

export function AtelierHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#13161C]/90 backdrop-blur-md border-b border-[rgba(158,152,143,0.18)]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3 safe-top">
        {/* Brand & Atelier Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1D222A] border border-[#C89B5C]/40 flex items-center justify-center text-[#C89B5C] group-hover:border-[#C89B5C] transition-colors shadow-sm">
            <span className="font-serif font-bold text-sm">S&T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold tracking-widest text-xs uppercase text-[#F4EFEA]">
                Stitch &amp; Time
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#C89B5C]/20 text-[#C89B5C] border border-[#C89B5C]/35 font-bold">
                Atelier
              </span>
            </div>
            {title ? (
              <h1 className="text-sm font-semibold text-[#F4EFEA] truncate max-w-[200px]">
                {title}
              </h1>
            ) : (
              <p className="text-[11px] font-mono text-[#9E988F]">Bespoke Companion</p>
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
                    userButtonAvatarBox: 'w-7 h-7 border border-[#C89B5C]/50',
                  },
                }}
              />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full bg-[#1D222A] border border-[rgba(158,152,143,0.25)] flex items-center justify-center text-xs text-[#C89B5C]"
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
