'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Scissors, Ruler, Layers, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomBar() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/', label: 'Atelier', icon: LayoutDashboard, exact: true },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/fittings/new', label: 'Quick Fit', icon: Ruler, highlight: true },
    { href: '/orders', label: 'Orders', icon: Scissors },
    { href: '/templates', label: 'Templates', icon: Layers },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#181715]/95 backdrop-blur-md border-t border-[rgba(214,203,189,0.14)] safe-bottom">
      <div className="max-w-lg mx-auto px-3 py-1 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-3 flex flex-col items-center focus:outline-none"
              >
                <div
                  className={cn(
                    "w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2",
                    isActive
                      ? "bg-[#FAF7F2] text-[#141312] border-[#C89B3C] shadow-[#C89B3C]/50 scale-105 ring-2 ring-[#C89B3C]"
                      : "bg-[#C89B3C] text-[#141312] border-[#FAF7F2] hover:scale-105 shadow-[#C89B3C]/30"
                  )}
                >
                  <Ruler className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#E0BA62] mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-[#C89B3C]"
                  : "text-[#9E948A] hover:text-[#FAF7F2]"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span
                className={cn(
                  "text-[10px] font-mono mt-1",
                  isActive ? "font-bold text-[#FAF7F2]" : "text-[#9E948A]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
