'use client';

import React from 'react';
import { Order, OrderStatus } from '@/lib/db/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, Scissors, AlertCircle, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface OrderPipelineCardProps {
  order: Order;
  clientName?: string;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

const STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'sewing', label: 'Sewing' },
  { key: 'fitting', label: 'Fitting' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' }
];

export function OrderPipelineCard({ order, clientName, onStatusChange }: OrderPipelineCardProps) {
  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);
  const balanceDue = Math.max(0, order.total_price - (order.deposit_paid || 0));

  const isRush = order.priority === 'rush';
  const isEditorial = order.priority === 'editorial';

  return (
    <div className="w-full bg-[#181715] hover:bg-[#1E1D1B] rounded-2xl border border-[rgba(214,203,189,0.12)] hover:border-[#C89B3C]/40 p-4 transition-all duration-200 shadow-lg flex flex-col gap-3 group">
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isRush && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-950/70 border border-red-500/40 text-red-300 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-2.5 h-2.5" /> Rush Order
              </span>
            )}
            {isEditorial && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#C89B3C]/20 border border-[#C89B3C]/40 text-[#E0BA62] flex items-center gap-1 font-semibold">
                <Sparkles className="w-2.5 h-2.5" /> Haute Couture
              </span>
            )}
            {clientName && (
              <span className="text-xs font-mono text-[#9E948A]">{clientName}</span>
            )}
          </div>
          <Link href={`/orders/${order.id}`} className="hover:underline">
            <h3 className="text-base font-serif font-bold text-[#FAF7F2] group-hover:text-[#E0BA62] transition-colors leading-tight">
              {order.title}
            </h3>
          </Link>
          {order.garment_type && (
            <p className="text-xs text-[#9E948A] mt-0.5">{order.garment_type}</p>
          )}
        </div>

        {/* Due Date Indicator */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1 text-xs text-[#9E948A]">
            <Clock className="w-3 h-3 text-[#C89B3C]" />
            <span className="font-mono">{formatDate(order.due_date)}</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#9E948A]/70 mt-0.5">Target Completion</span>
        </div>
      </div>

      {/* Bespoke Garment Production Lifecycle Pipeline Stepper */}
      <div className="w-full bg-[#141312] p-2.5 rounded-xl border border-[rgba(214,203,189,0.08)] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#9E948A]">Stage:</span>
          <span className="capitalize font-semibold text-[#E0BA62]">{order.status}</span>
        </div>

        <div className="grid grid-cols-6 gap-1">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => onStatusChange && onStatusChange(stage.key)}
                className={`h-2 rounded-full transition-all relative group/step ${
                  isCurrent
                    ? 'bg-[#C89B3C] shadow-sm shadow-[#C89B3C]/50 ring-1 ring-[#FAF7F2]'
                    : isCompleted
                    ? 'bg-[#5B684E]'
                    : 'bg-[#242220]'
                }`}
                title={`Advance to ${stage.label}`}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[9px] font-mono text-[#9E948A]/60 px-0.5">
          <span>Cut</span>
          <span>Sew</span>
          <span>Fit</span>
          <span>Ready</span>
        </div>
      </div>

      {/* Bottom Swatch & Financial Breakdown */}
      <div className="flex items-center justify-between pt-1 border-t border-[rgba(214,203,189,0.08)] text-xs">
        {/* Swatch Thumbnail Previews */}
        <div className="flex items-center gap-1.5">
          {order.fabric_swatches && order.fabric_swatches.length > 0 ? (
            <div className="flex -space-x-2">
              {order.fabric_swatches.slice(0, 3).map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#181715] overflow-hidden bg-[#242220] shadow-sm"
                >
                  <img src={url} alt="Fabric swatch" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-[#9E948A]/70">
              <Scissors className="w-3.5 h-3.5 text-[#C89B3C]/50" />
              <span>No swatch</span>
            </div>
          )}
        </div>

        {/* Payment Balance */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#FAF7F2] tnum">
              {formatCurrency(order.total_price)}
            </span>
            <div className="text-[10px] font-mono text-[#9E948A]">
              {balanceDue === 0 ? (
                <span className="text-emerald-400">Paid in Full</span>
              ) : (
                <span>{formatCurrency(balanceDue)} due</span>
              )}
            </div>
          </div>

          <Link
            href={`/orders/${order.id}`}
            className="p-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] text-[#9E948A] hover:text-[#FAF7F2] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
