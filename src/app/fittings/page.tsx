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
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title="Fitting Logs" subtitle="Historical Anatomical Sessions" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#FAF7F2]">
              Atelier Fitting Archives
            </h2>
            <p className="text-xs text-[#9E948A]">
              Review past baste fits, version logs, and body variances.
            </p>
          </div>
          <Link
            href="/fittings/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-xs transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Fit</span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9E948A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name or session notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181715] border border-[rgba(214,203,189,0.12)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
          />
        </div>

        {/* Fitting Log List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#181715] border border-[rgba(214,203,189,0.1)] text-xs text-[#9E948A]">
              <History className="w-8 h-8 text-[#C89B3C]/50 mx-auto mb-2" />
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
                  className="p-4 rounded-2xl bg-[#181715] hover:bg-[#1E1D1B] border border-[rgba(214,203,189,0.12)] hover:border-[#C89B3C]/40 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link
                          href={`/clients/${client?.id}`}
                          className="text-base font-serif font-bold text-[#FAF7F2] group-hover:text-[#E0BA62] transition-colors hover:underline"
                        >
                          {client?.full_name || 'Anonymous Client'}
                        </Link>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#242220] text-[#E0BA62] border border-[#C89B3C]/30 uppercase">
                          {log.unit}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E948A]">
                        {template?.name || 'Custom Garment Silhouette'} &bull; {formatDate(log.recorded_at)}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-[#9E948A]">
                      {formatTimeAgo(log.recorded_at)}
                    </span>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-[#FAF7F2]/80 bg-[#141312] p-2.5 rounded-lg border border-[rgba(214,203,189,0.06)] font-mono">
                      &ldquo;{log.notes}&rdquo;
                    </p>
                  )}

                  {/* Sample values preview */}
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(214,203,189,0.08)] text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {Object.entries(log.values || {})
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-1 rounded bg-[#242220] text-[11px] font-mono text-[#E5DCD0]"
                          >
                            {k}: <strong className="text-[#E0BA62]">{formatMeasurement(v, log.unit)}</strong>
                          </span>
                        ))}
                      {pointCount > 3 && (
                        <span className="text-[10px] font-mono text-[#9E948A]">
                          +{pointCount - 3} more points
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/clients/${client?.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#E0BA62] hover:underline"
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
