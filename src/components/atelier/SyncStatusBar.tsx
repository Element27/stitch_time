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
            ? "bg-[#1E1D1B] border-[#C89B3C]/30 text-[#E5DCD0] hover:border-[#C89B3C]"
            : "bg-[#2A1E1E] border-red-500/40 text-red-200"
        )}
        title={syncState.isOnline ? "Online: Click to sync with Cloud" : "Offline: IndexedDB active"}
      >
        {syncState.isSyncing || isSpinning ? (
          <RefreshCw className="w-3 h-3 text-[#C89B3C] animate-spin" />
        ) : syncState.isOnline ? (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        ) : (
          <WifiOff className="w-3 h-3 text-amber-400" />
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
    <div className="w-full bg-[#181715] border-b border-[rgba(214,203,189,0.1)] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          {syncState.isOnline ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wide">Atelier Cloud Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Fitting Mode (Dexie.js)</span>
            </div>
          )}
        </div>

        {syncState.pendingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-[#C89B3C]/15 text-[#E0BA62] border border-[#C89B3C]/30">
            {syncState.pendingCount} fitting{syncState.pendingCount > 1 ? 's' : ''} queued
          </span>
        )}

        {syncState.lastSyncedAt && (
          <span className="text-[#D3C7B6] font-mono text-[11px] hidden sm:inline">
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
              ? "bg-amber-950/70 border-amber-500/60 text-amber-200"
              : "bg-[#242220] border-[rgba(214,203,189,0.18)] text-[#D3C7B6] hover:text-[#FAF7F2]"
          )}
        >
          {syncState.offlineSimulation ? "Simulating Offline (Click to Reconnect)" : "Simulate Offline"}
        </button>

        <button
          onClick={handleManualSync}
          disabled={syncState.isSyncing || !syncState.isOnline}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.15)] text-[#FAF7F2] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3 h-3 text-[#C89B3C]", (syncState.isSyncing || isSpinning) && "animate-spin")} />
          <span>Sync Now</span>
        </button>
      </div>
    </div>
  );
}
