'use client';

import React, { useState } from 'react';
import { MeasurementLog } from '@/lib/db/types';
import { formatDate, formatMeasurement } from '@/lib/utils';
import { GitCompare, ArrowUpRight, ArrowDownRight, Minus, History, Sparkles } from 'lucide-react';

interface MeasurementCompareProps {
  logs: MeasurementLog[];
}

export function MeasurementCompare({ logs }: MeasurementCompareProps) {
  if (!logs || logs.length < 2) {
    return (
      <div className="p-4 rounded-xl bg-[#1E1D1B] border border-[rgba(214,203,189,0.1)] text-center text-xs text-[#9E948A]">
        <History className="w-5 h-5 mx-auto mb-2 text-[#C89B3C]/50" />
        <p>Record at least two fitting logs to view historical body delta comparisons.</p>
      </div>
    );
  }

  const [baseLogId, setBaseLogId] = useState(logs[1]?.id || logs[0]?.id);
  const [targetLogId, setTargetLogId] = useState(logs[0]?.id);

  const baseLog = logs.find((l) => l.id === baseLogId) || logs[1];
  const targetLog = logs.find((l) => l.id === targetLogId) || logs[0];

  // Merge all keys from both logs
  const allFields = Array.from(
    new Set([...Object.keys(baseLog?.values || {}), ...Object.keys(targetLog?.values || {})])
  );

  return (
    <div className="w-full bg-[#181715] rounded-2xl border border-[rgba(214,203,189,0.14)] p-4 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[rgba(214,203,189,0.1)] pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-[#C89B3C]" />
          <h3 className="text-sm font-serif font-bold text-[#FAF7F2]">
            Fitting Session Version Diff
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#242220] text-[#E0BA62]">
          {allFields.length} Comparison Points
        </span>
      </div>

      {/* Selectors for Base vs Target Session */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
            Baseline Fitting
          </label>
          <select
            value={baseLogId}
            onChange={(e) => setBaseLogId(e.target.value)}
            className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-lg px-2.5 py-1.5 text-xs text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
          >
            {logs.map((log) => (
              <option key={log.id} value={log.id}>
                {formatDate(log.recorded_at)} ({log.notes ? log.notes.slice(0, 20) + '...' : log.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
            Target Adjustment
          </label>
          <select
            value={targetLogId}
            onChange={(e) => setTargetLogId(e.target.value)}
            className="w-full bg-[#242220] border border-[#C89B3C]/60 rounded-lg px-2.5 py-1.5 text-xs text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
          >
            {logs.map((log) => (
              <option key={log.id} value={log.id}>
                {formatDate(log.recorded_at)} ({log.notes ? log.notes.slice(0, 20) + '...' : log.unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Delta List */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
        {allFields.map((field) => {
          const val1 = baseLog?.values?.[field];
          const val2 = targetLog?.values?.[field];

          const num1 = typeof val1 === 'number' ? val1 : parseFloat(String(val1));
          const num2 = typeof val2 === 'number' ? val2 : parseFloat(String(val2));

          const hasDelta = !isNaN(num1) && !isNaN(num2);
          const delta = hasDelta ? Math.round((num2 - num1) * 100) / 100 : null;

          return (
            <div
              key={field}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#1E1D1B] hover:bg-[#242220] border border-[rgba(214,203,189,0.12)] transition-colors text-xs"
            >
              <span className="font-medium text-[#FAF7F2] max-w-[140px] truncate">{field}</span>

              <div className="flex items-center gap-3 font-mono tnum">
                {/* Base Value */}
                <span className="text-[#D3C7B6] font-medium">
                  {formatMeasurement(val1, baseLog.unit)}
                </span>

                <span className="text-[10px] text-[#FAF7F2]/60">→</span>

                {/* Target Value */}
                <span className="text-[#E0BA62] font-bold">
                  {formatMeasurement(val2, targetLog.unit)}
                </span>

                {/* Delta Pill */}
                {delta !== null ? (
                  delta === 0 ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-[#242220] border border-[rgba(214,203,189,0.1)] text-[#D3C7B6] font-bold">
                      <Minus className="w-2.5 h-2.5" /> 0.0
                    </span>
                  ) : delta > 0 ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-200 border border-amber-500/50 font-bold">
                      <ArrowUpRight className="w-2.5 h-2.5" /> +{delta}&quot;
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-200 border border-emerald-500/50 font-bold">
                      <ArrowDownRight className="w-2.5 h-2.5" /> {delta}&quot;
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-[#8E847A]">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
