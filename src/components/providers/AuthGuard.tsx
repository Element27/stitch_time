'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_PREFIXES = ['/sign-in', '/sign-up', '/api', '/icons', '/manifest'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const pathname = usePathname();
  const router = useRouter();

  const auth = hasClerkKey ? useAuth() : null;

  useEffect(() => {
    if (!hasClerkKey || !auth) return;

    const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

    if (auth.isLoaded && !auth.isSignedIn && !isPublic) {
      router.replace('/sign-in');
    }
  }, [hasClerkKey, auth?.isLoaded, auth?.isSignedIn, pathname, router]);

  return <>{children}</>;
}
