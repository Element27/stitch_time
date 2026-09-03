'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { formatDate, formatMeasurement, formatTimeAgo } from '@/lib/utils';
import { Ruler, Plus, Search, ChevronRight, History, Sparkles, Filter } from 'lucide-react';

export default function FittingsListPage() {
  const logs = useLiveQuery(() => db.measurement_logs.reverse().sortBy('recorded_at')) || [];
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const templates = useLiveQuery(() => db.measurement_templates.toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const client = clients.find((c) => c.id === log.client_id);
    const clientName = client?.full_name?.toLowerCase() || '';
    const notes = log.notes?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return clientName.includes(q) || notes.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#13161C] text-[#F4EFEA] pb-28 atelier-grain">
      <AtelierHeader title="Fitting Logs" subtitle="Historical Anatomical Sessions" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#F4EFEA]">
              Atelier Fitting Archives
            </h2>
            <p className="text-xs text-[#9E988F]">
              Review past baste fits, version logs, and body variances.
            </p>
          </div>
          <Link
            href="/fittings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Fit</span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9E988F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name or session notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1D222A] border border-[rgba(158,152,143,0.18)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F4EFEA] focus:border-[#C89B5C] focus:outline-none placeholder-[#7D776E]"
          />
        </div>

        {/* Fitting Log List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] text-xs text-[#9E988F]">
              <History className="w-8 h-8 text-[#C89B5C]/60 mx-auto mb-2" />
              <p>No fitting sessions found matching your query.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const client = clients.find((c) => c.id === log.client_id);
              const template = templates.find((t) => t.id === log.template_id);
              const pointCount = Object.keys(log.values || {}).length;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#1D222A] hover:bg-[#232933] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link
                          href={`/clients/${client?.id}`}
                          className="text-base font-serif font-bold text-[#F4EFEA] group-hover:text-[#C89B5C] transition-colors hover:underline"
                        >
                          {client?.full_name || 'Anonymous Client'}
                        </Link>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#2E3543] text-[#C89B5C] font-bold border border-[#C89B5C]/40 uppercase">
                          {log.unit}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E988F]">
                        {template?.name || 'Custom Garment Silhouette'} &bull; {formatDate(log.recorded_at)}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-[#9E988F]">
                      {formatTimeAgo(log.recorded_at)}
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-[#F4EFEA] bg-[#13161C] p-2.5 rounded-lg border border-[rgba(158,152,143,0.18)] font-mono leading-relaxed">
                      &ldquo;{log.notes}&rdquo;
                    </p>
                  )}

                  {/* Sample values preview */}
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(158,152,143,0.18)] text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.entries(log.values || {})
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-1 rounded bg-[#2E3543] text-[11px] font-mono text-[#F4EFEA]"
                          >
                            {k}: <strong className="text-[#C89B5C] font-bold">{formatMeasurement(v, log.unit)}</strong>
                          </span>
                        ))}
                      {pointCount > 3 && (
                        <span className="text-[10px] font-mono text-[#9E988F]">
                          +{pointCount - 3} more points
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/clients/${client?.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#C89B5C] hover:underline font-bold"
                    >
                      <span>Compare History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <MobileBottomBar />
    </div>
  );
}
