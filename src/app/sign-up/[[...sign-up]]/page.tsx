'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Scissors, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] flex flex-col items-center justify-center p-4 atelier-grain">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#1E1D1B] border border-[#C89B3C]/50 flex items-center justify-center text-[#C89B3C] shadow-xl group-hover:scale-105 transition-transform">
            <Scissors className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl tracking-widest uppercase text-[#FAF7F2]">
              Stitch &amp; Time
            </h1>
            <p className="text-xs font-mono text-[#9E948A]">
              Editorial Bespoke Atelier
            </p>
          </div>
        </Link>

        {hasClerkKey ? (
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#C89B3C',
                colorBackground: '#181715',
                colorNeutral: '#FAF7F2',
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-[#181715] border border-[rgba(214,203,189,0.18)] shadow-2xl rounded-2xl text-[#FAF7F2]',
                headerTitle: 'font-serif text-[#FAF7F2] text-xl font-bold',
                headerSubtitle: 'text-[#D3C7B6]',
                formFieldLabel: 'text-[#D3C7B6] font-mono text-xs',
                formFieldInput: 'bg-[#242220] border border-[rgba(214,203,189,0.2)] text-[#FAF7F2] focus:border-[#C89B3C]',
                socialButtonsBlockButton: 'bg-[#242220] border border-[rgba(214,203,189,0.18)] text-[#FAF7F2] hover:bg-[#2E2B27]',
                socialButtonsBlockButtonText: 'text-[#FAF7F2] font-medium',
                dividerLine: 'bg-[rgba(214,203,189,0.15)]',
                dividerText: 'text-[#D3C7B6] font-mono text-xs',
                formButtonPrimary: 'bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold font-mono',
                footerActionText: 'text-[#D3C7B6]',
                footerActionLink: 'text-[#E0BA62] hover:text-[#FAF7F2]',
                identityPreviewText: 'text-[#FAF7F2]',
                identityPreviewEditButton: 'text-[#E0BA62]',
              },
            }}
          />
        ) : (
          <div className="w-full p-6 rounded-2xl bg-[#181715] border border-[#C89B3C]/30 text-center flex flex-col gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#C89B3C]/20 text-[#E0BA62] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#FAF7F2]">
                Local Atelier Master Mode Active
              </h2>
              <p className="text-xs text-[#9E948A] mt-1">
                You are currently running with local-first IndexedDB (Dexie.js).
              </p>
            </div>
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-xs transition-colors"
            >
              Enter Atelier Workspace &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
