'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { AtelierLoadingScreen } from '@/components/ui/AtelierLoadingScreen';

const PUBLIC_PREFIXES = ['/sign-in', '/sign-up', '/api', '/icons', '/manifest'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const pathname = usePathname();
  const router = useRouter();

  const auth = hasClerkKey ? useAuth() : null;
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (!hasClerkKey || !auth) return;

    if (auth.isLoaded && !auth.isSignedIn && !isPublic) {
      router.replace('/sign-in');
    }
  }, [hasClerkKey, auth?.isLoaded, auth?.isSignedIn, isPublic, router]);

  // If on a public route (e.g., /sign-in, /sign-up), bypass guard loading screen
  if (isPublic) {
    return <>{children}</>;
  }

  // If Clerk is configured and auth state is currently resolving, show loading state
  if (hasClerkKey && auth) {
    if (!auth.isLoaded) {
      return <AtelierLoadingScreen message="Verifying session..." />;
    }

    if (!auth.isSignedIn) {
      return <AtelierLoadingScreen message="Redirecting to Log In..." />;
    }
  }

  // Auth resolved & user is signed in (or local-first mode without Clerk key)
  return <>{children}</>;
}
