'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { seedDatabaseIfEmpty } from '@/lib/db/seed';
import { initSyncEngine } from '@/lib/sync/syncEngine';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    // 1. Seed Dexie IndexedDB with bespoke tailoring presets if first run
    seedDatabaseIfEmpty();

    // 2. Initialize offline/online sync engine listeners
    const cleanup = initSyncEngine();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
