import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// If Clerk keys are configured, use Clerk middleware dynamically
export default async function middleware(req: NextRequest) {
  if (!hasClerkKeys) {
    // In local-first / offline demo mode, pass all requests through to Dexie & local state
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');
  const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/manifest.webmanifest',
    '/manifest.json',
    '/favicon.ico',
    '/icons(.*)',
    '/api/sync(.*)',
    '/api/webhooks(.*)',
    '/__clerk(.*)'
  ]);

  return clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(req, {} as any);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
