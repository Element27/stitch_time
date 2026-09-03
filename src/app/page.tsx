'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Client, Order, MeasurementLog } from '@/lib/db/types';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { SyncStatusBar } from '@/components/atelier/SyncStatusBar';
import { OrderPipelineCard } from '@/components/atelier/OrderPipelineCard';
import { updateOrderOfflineFirst } from '@/lib/sync/syncEngine';
import { formatCurrency, formatDate, formatTimeAgo, getInitials } from '@/lib/utils';
import {
  Ruler,
  Users,
  Scissors,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  WifiOff,
  Star
} from 'lucide-react';

export default function AtelierDashboardPage() {
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];
  const measurementLogs = useLiveQuery(() => db.measurement_logs.toArray()) || [];

  // Metrics
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const inFittingOrders = orders.filter((o) => o.status === 'fitting');
  const rushOrders = orders.filter((o) => o.priority === 'rush' && o.status !== 'delivered');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalDeposits = orders.reduce((sum, o) => sum + (o.deposit_paid || 0), 0);
  const outstandingBalance = Math.max(0, totalRevenue - totalDeposits);

  const handleStatusChange = async (orderId: string, newStatus: any) => {
    await updateOrderOfflineFirst(orderId, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-24 atelier-grain">
      <AtelierHeader />
      <SyncStatusBar />

      <main className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-6">
        {/* Welcome & Fast Measurement CTA Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E1D1B] via-[#1A1917] to-[#141312] border border-[#C89B3C]/30 p-5 shadow-2xl glow-brass-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C89B3C]/20 text-[#E0BA62] border border-[#C89B3C]/40 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-2.5 h-2.5" /> Bespoke Atelier Workstation
                </span>
                {rushOrders.length > 0 && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                    {rushOrders.length} Rush
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#FAF7F2] tracking-tight">
                Editorial Fitting Studio
              </h2>
              <p className="text-xs text-[#9E948A] mt-1 max-w-md">
                Measure clients on the go, record anatomical adjustments, attach fabric swatches, and sync with cloud when online.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/fittings/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] active:scale-95 text-[#141312] font-semibold text-sm shadow-lg shadow-[#C89B3C]/25 transition-all"
              >
                <Ruler className="w-4 h-4 stroke-[2.5]" />
                <span>Start Rapid Fitting</span>
              </Link>
            </div>
          </div>

          {/* Subtle Atelier Background Silhouette Accents */}
          <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-[#C89B3C]">
            <Scissors className="w-48 h-48" />
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#181715] border border-[rgba(214,203,189,0.1)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#9E948A]">
              <span className="text-[10px] font-mono uppercase">Active Orders</span>
              <Scissors className="w-3.5 h-3.5 text-[#C89B3C]" />
            </div>
            <span className="text-xl font-mono font-bold text-[#FAF7F2] tnum">
              {activeOrders.length}
            </span>
            <span className="text-[10px] text-[#9E948A]">
              {inFittingOrders.length} in fitting stage
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181715] border border-[rgba(214,203,189,0.1)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#9E948A]">
              <span className="text-[10px] font-mono uppercase">Client Roster</span>
              <Users className="w-3.5 h-3.5 text-[#C89B3C]" />
            </div>
            <span className="text-xl font-mono font-bold text-[#FAF7F2] tnum">
              {clients.length}
            </span>
            <span className="text-[10px] text-[#9E948A]">
              {clients.filter((c) => c.vip_status).length} VIP Patrons
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181715] border border-[rgba(214,203,189,0.1)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#9E948A]">
              <span className="text-[10px] font-mono uppercase">Fitting Sessions</span>
              <Ruler className="w-3.5 h-3.5 text-[#C89B3C]" />
            </div>
            <span className="text-xl font-mono font-bold text-[#FAF7F2] tnum">
              {measurementLogs.length}
            </span>
            <span className="text-[10px] text-[#9E948A]">
              Logged offline &amp; sync
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181715] border border-[rgba(214,203,189,0.1)] flex flex-col gap-1">
            <div className="flex items-center justify-between text-[#9E948A]">
              <span className="text-[10px] font-mono uppercase">Balance Due</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-xl font-mono font-bold text-[#FAF7F2] tnum">
              {formatCurrency(outstandingBalance)}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {formatCurrency(totalDeposits)} collected
            </span>
          </div>
        </section>

        {/* Workbench Production Orders */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#C89B3C]" />
              <h3 className="text-base font-serif font-bold text-[#FAF7F2]">
                Active Workbench Pipeline
              </h3>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#E0BA62] hover:underline"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#181715] border border-[rgba(214,203,189,0.1)] text-center text-xs text-[#9E948A]">
              No active orders on the workbench. Start a new order or fitting!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {orders.slice(0, 4).map((order) => {
                const client = clients.find((c) => c.id === order.client_id);
                return (
                  <OrderPipelineCard
                    key={order.id}
                    order={order}
                    clientName={client?.full_name}
                    onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Clients & Quick Measurement Access */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C89B3C]" />
              <h3 className="text-base font-serif font-bold text-[#FAF7F2]">
                Client Roster &amp; Profiles
              </h3>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#E0BA62] hover:underline"
            >
              <span>All Clients ({clients.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clients.slice(0, 4).map((client) => {
              const clientLogs = measurementLogs.filter((l) => l.client_id === client.id);
              const latestLog = clientLogs[0];

              return (
                <div
                  key={client.id}
                  className="p-4 rounded-xl bg-[#181715] hover:bg-[#1E1D1B] border border-[rgba(214,203,189,0.1)] hover:border-[#C89B3C]/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full bg-[#242220] border border-[rgba(214,203,189,0.2)] flex items-center justify-center font-mono font-bold text-xs text-[#E0BA62] overflow-hidden flex-shrink-0">
                      {client.avatar_url ? (
                        <img
                          src={client.avatar_url}
                          alt={client.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(client.full_name)
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/clients/${client.id}`} className="hover:underline truncate">
                          <h4 className="text-sm font-serif font-bold text-[#FAF7F2] truncate group-hover:text-[#E0BA62] transition-colors">
                            {client.full_name}
                          </h4>
                        </Link>
                        {client.vip_status && (
                          <Star className="w-3 h-3 text-[#C89B3C] fill-[#C89B3C] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#9E948A] truncate">
                        {latestLog ? `Last fit: ${formatDate(latestLog.recorded_at)}` : client.phone || 'No fits logged'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/fittings/new?clientId=${client.id}`}
                      className="p-2 rounded-lg bg-[#242220] hover:bg-[#C89B3C] text-[#FAF7F2] hover:text-[#141312] transition-colors"
                      title="Measure Client"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/clients/${client.id}`}
                      className="p-2 rounded-lg bg-[#242220] hover:bg-[#2E2B27] text-[#9E948A] hover:text-[#FAF7F2] transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <MobileBottomBar />
    </div>
  );
}
