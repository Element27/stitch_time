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
    <div className="min-h-screen bg-[#13161C] text-[#F4EFEA] pb-24 atelier-grain">
      <AtelierHeader />
      <SyncStatusBar />

      <main className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-6">
        {/* Welcome & Fast Measurement CTA Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D222A] via-[#1D222A] to-[#13161C] border border-[#C89B5C]/35 p-5 shadow-2xl glow-brass-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C89B5C]/20 text-[#C89B5C] border border-[#C89B5C]/40 flex items-center gap-1 font-bold">
                  <Sparkles className="w-2.5 h-2.5" /> Bespoke Atelier Workstation
                </span>
                {rushOrders.length > 0 && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#E28743]/20 text-[#E28743] border border-[#E28743]/40 font-bold">
                    {rushOrders.length} Rush
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#F4EFEA] tracking-tight">
                Editorial Fitting Studio
              </h2>
              <p className="text-xs text-[#9E988F] mt-1 max-w-md">
                Measure clients on the go, record anatomical adjustments, attach fabric swatches, and sync with cloud when online.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/fittings/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] active:scale-95 text-[#13161C] font-bold text-sm shadow-lg shadow-[#C89B5C]/25 transition-all"
              >
                <Ruler className="w-4 h-4 stroke-[2.5]" />
                <span>Start Rapid Fitting</span>
              </Link>
            </div>
          </div>

          {/* Subtle Atelier Background Silhouette Accents */}
          <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-[#C89B5C]">
            <Scissors className="w-48 h-48" />
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex flex-col gap-1 shadow-md">
            <div className="flex items-center justify-between text-[#9E988F]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Active Orders</span>
              <Scissors className="w-3.5 h-3.5 text-[#C89B5C]" />
            </div>
            <span className="text-2xl font-mono font-bold text-[#F4EFEA] tnum">
              {activeOrders.length}
            </span>
            <span className="text-[11px] font-mono text-[#9E988F]">
              {inFittingOrders.length} in fitting stage
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex flex-col gap-1 shadow-md">
            <div className="flex items-center justify-between text-[#9E988F]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Client Roster</span>
              <Users className="w-3.5 h-3.5 text-[#C89B5C]" />
            </div>
            <span className="text-2xl font-mono font-bold text-[#F4EFEA] tnum">
              {clients.length}
            </span>
            <span className="text-[11px] font-mono text-[#9E988F]">
              {clients.filter((c) => c.vip_status).length} VIP Patrons
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex flex-col gap-1 shadow-md">
            <div className="flex items-center justify-between text-[#9E988F]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Fitting Sessions</span>
              <Ruler className="w-3.5 h-3.5 text-[#C89B5C]" />
            </div>
            <span className="text-2xl font-mono font-bold text-[#F4EFEA] tnum">
              {measurementLogs.length}
            </span>
            <span className="text-[11px] font-mono text-[#9E988F]">
              Logged offline &amp; sync
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex flex-col gap-1 shadow-md">
            <div className="flex items-center justify-between text-[#9E988F]">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Balance Due</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#3E7B5C]" />
            </div>
            <span className="text-2xl font-mono font-bold text-[#F4EFEA] tnum">
              {formatCurrency(outstandingBalance)}
            </span>
            <span className="text-[11px] text-[#3E7B5C] font-mono font-bold">
              {formatCurrency(totalDeposits)} collected
            </span>
          </div>
        </section>

        {/* Workbench Production Orders */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#C89B5C]" />
              <h3 className="text-base font-serif font-bold text-[#F4EFEA]">
                Active Workbench Pipeline
              </h3>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#C89B5C] hover:underline font-semibold"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] text-center text-xs text-[#9E988F] flex flex-col items-center gap-2">
              <Scissors className="w-7 h-7 text-[#C89B5C]" />
              <p className="font-serif text-base font-bold text-[#F4EFEA]">No Active Orders on Workbench</p>
              <p className="text-xs text-[#9E988F]">Start a new bespoke garment commission or record a fitting session.</p>
              <Link
                href="/orders"
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Commission</span>
              </Link>
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
              <Users className="w-4 h-4 text-[#C89B5C]" />
              <h3 className="text-base font-serif font-bold text-[#F4EFEA]">
                Client Roster &amp; Profiles
              </h3>
            </div>
            <Link
              href="/clients"
              className="inline-flex items-center gap-1 text-xs font-mono text-[#C89B5C] hover:underline font-semibold"
            >
              <span>All Clients ({clients.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] text-center text-xs text-[#9E988F] flex flex-col items-center gap-2">
              <Users className="w-7 h-7 text-[#C89B5C]" />
              <p className="font-serif text-base font-bold text-[#F4EFEA]">No Clients in Roster</p>
              <p className="text-xs text-[#9E988F]">Register a bespoke client to begin recording fittings.</p>
              <Link
                href="/clients"
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Patron</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clients.slice(0, 4).map((client) => {
                const clientLogs = measurementLogs.filter((l) => l.client_id === client.id);
                const latestLog = clientLogs[0];

                return (
                  <div
                    key={client.id}
                    className="p-4 rounded-2xl bg-[#1D222A] hover:bg-[#232933] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex items-center justify-between gap-3 group shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-full bg-[#2E3543] border-2 border-[rgba(158,152,143,0.25)] flex items-center justify-center font-mono font-bold text-xs text-[#C89B5C] overflow-hidden flex-shrink-0">
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
                            <h4 className="text-sm font-serif font-bold text-[#F4EFEA] truncate group-hover:text-[#C89B5C] transition-colors">
                              {client.full_name}
                            </h4>
                          </Link>
                          {client.vip_status && (
                            <Star className="w-3 h-3 text-[#C89B5C] fill-[#C89B5C] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-[#9E988F] truncate">
                          {latestLog ? `Last fit: ${formatDate(latestLog.recorded_at)}` : client.phone || 'No fits logged'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link
                        href={`/fittings/new?clientId=${client.id}`}
                        className="p-2 rounded-lg bg-[#2E3543] hover:bg-[#C89B5C] text-[#F4EFEA] hover:text-[#13161C] transition-colors"
                        title="Measure Client"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/clients/${client.id}`}
                        className="p-2 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-[#9E988F] hover:text-[#F4EFEA] transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <MobileBottomBar />
    </div>
  );
}
