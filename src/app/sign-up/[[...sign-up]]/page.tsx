'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Scissors, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-[#13161C] text-[#F4EFEA] flex flex-col items-center justify-center p-4 atelier-grain">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#1D222A] border border-[#C89B5C]/50 flex items-center justify-center text-[#C89B5C] shadow-xl group-hover:scale-105 transition-transform">
            <Scissors className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="text-center">
            <h1 className="font-serif font-bold text-xl tracking-widest uppercase text-[#F4EFEA]">
              Stitch &amp; Time
            </h1>
            <p className="text-xs font-mono text-[#9E988F]">
              Editorial Bespoke Atelier
            </p>
          </div>
        </Link>

        {hasClerkKey ? (
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#C89B5C',
                colorBackground: '#1D222A',
                colorNeutral: '#F4EFEA',
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-[#1D222A] border border-[rgba(158,152,143,0.18)] shadow-2xl rounded-2xl text-[#F4EFEA]',
                headerTitle: 'font-serif text-[#F4EFEA] text-xl font-bold',
                headerSubtitle: 'text-[#9E988F]',
                formFieldLabel: 'text-[#9E988F] font-mono text-xs',
                formFieldInput: 'bg-[#2E3543] border border-[rgba(158,152,143,0.25)] text-[#F4EFEA] focus:border-[#C89B5C]',
                socialButtonsBlockButton: 'bg-[#2E3543] border border-[rgba(158,152,143,0.18)] text-[#F4EFEA] hover:bg-[#384050]',
                socialButtonsBlockButtonText: 'text-[#F4EFEA] font-medium',
                dividerLine: 'bg-[rgba(158,152,143,0.18)]',
                dividerText: 'text-[#9E988F] font-mono text-xs',
                formButtonPrimary: 'bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-semibold font-mono shadow-md',
                footerActionText: 'text-[#9E988F]',
                footerActionLink: 'text-[#C89B5C] hover:text-[#F4EFEA]',
                identityPreviewText: 'text-[#F4EFEA]',
                identityPreviewEditButton: 'text-[#C89B5C]',
              },
            }}
          />
        ) : (
          <div className="w-full p-6 rounded-2xl bg-[#1D222A] border border-[#C89B5C]/40 text-center flex flex-col gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#C89B5C]/20 text-[#C89B5C] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#F4EFEA]">
                Local Atelier Master Mode Active
              </h2>
              <p className="text-xs text-[#9E988F] mt-1">
                You are currently running with local-first IndexedDB (Dexie.js).
              </p>
            </div>
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-colors shadow-md"
            >
              Enter Atelier Workspace &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
