'use client';

import React, { useState, useEffect } from 'react';
import {
  subscribeSyncState,
  processSyncQueue,
  setOfflineSimulation,
  SyncState
} from '@/lib/sync/syncEngine';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';

export function SyncStatusBar({ compact = false }: { compact?: boolean }) {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    error: null,
    offlineSimulation: false
  });
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSyncState(setSyncState);
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setIsSpinning(true);
    await processSyncQueue();
    setTimeout(() => setIsSpinning(false), 600);
  };

  const toggleOffline = () => {
    setOfflineSimulation(!syncState.offlineSimulation);
  };

  if (compact) {
    return (
      <button
        onClick={handleManualSync}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border",
          syncState.isOnline
            ? "bg-[#1D222A] border-[#C89B5C]/35 text-[#F4EFEA] hover:border-[#C89B5C]"
            : "bg-[#2E3543] border-[#E28743]/50 text-[#E28743]"
        )}
        title={syncState.isOnline ? "Online: Click to sync with Cloud" : "Offline: IndexedDB active"}
      >
        {syncState.isSyncing || isSpinning ? (
          <RefreshCw className="w-3 h-3 text-[#C89B5C] animate-spin" />
        ) : syncState.isOnline ? (
          <span className="w-2 h-2 rounded-full bg-[#3E7B5C] animate-pulse" />
        ) : (
          <WifiOff className="w-3 h-3 text-[#E28743]" />
        )}
        <span>
          {syncState.isOnline
            ? syncState.pendingCount > 0
              ? `${syncState.pendingCount} pending`
              : 'Synced'
            : 'Offline'}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full bg-[#1D222A] border-b border-[rgba(158,152,143,0.18)] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          {syncState.isOnline ? (
            <div className="flex items-center gap-1.5 text-[#3E7B5C] font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E7B5C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3E7B5C]"></span>
              </span>
              <span className="tracking-wide">Atelier Cloud Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#E28743] font-semibold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Fitting Mode (Dexie.js)</span>
            </div>
          )}
        </div>

        {syncState.pendingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#C89B5C]/15 text-[#C89B5C] border border-[#C89B5C]/30 font-bold">
            {syncState.pendingCount} fitting{syncState.pendingCount > 1 ? 's' : ''} queued
          </span>
        )}

        {syncState.lastSyncedAt && (
          <span className="text-[#9E988F] font-mono text-[11px] hidden sm:inline">
            Last sync: {formatTimeAgo(syncState.lastSyncedAt.toISOString())}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleOffline}
          className={cn(
            "px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors border",
            syncState.offlineSimulation
              ? "bg-[#2E3543] border-[#E28743]/60 text-[#E28743]"
              : "bg-[#2E3543] border-[rgba(158,152,143,0.18)] text-[#9E988F] hover:text-[#F4EFEA]"
          )}
        >
          {syncState.offlineSimulation ? "Simulating Offline (Click to Reconnect)" : "Simulate Offline"}
        </button>

        <button
          onClick={handleManualSync}
          disabled={syncState.isSyncing || !syncState.isOnline}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.2)] text-[#F4EFEA] transition-colors disabled:opacity-50 font-medium font-mono text-xs"
        >
          <RefreshCw className={cn("w-3 h-3 text-[#C89B5C]", (syncState.isSyncing || isSpinning) && "animate-spin")} />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
}
