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
    <div className="w-full bg-[#1D222A] hover:bg-[#232933] rounded-2xl border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 p-4 transition-all duration-200 shadow-lg flex flex-col gap-3 group">
      {/* Top Meta Bar */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isRush && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#E28743]/20 border border-[#E28743]/50 text-[#E28743] flex items-center gap-1 font-bold">
                <AlertCircle className="w-2.5 h-2.5" /> Rush Order
              </span>
            )}
            {isEditorial && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#C89B5C]/20 border border-[#C89B5C]/50 text-[#C89B5C] flex items-center gap-1 font-bold">
                <Sparkles className="w-2.5 h-2.5" /> Haute Couture
              </span>
            )}
            {clientName && (
              <span className="text-xs font-mono font-medium text-[#9E988F]">{clientName}</span>
            )}
          </div>
          <Link href={`/orders/${order.id}`} className="hover:underline">
            <h3 className="text-base font-serif font-bold text-[#F4EFEA] group-hover:text-[#C89B5C] transition-colors leading-tight">
              {order.title}
            </h3>
          </Link>
          {order.garment_type && (
            <p className="text-xs text-[#9E988F] mt-0.5">{order.garment_type}</p>
          )}
        </div>

        {/* Due Date Indicator */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-xs text-[#F4EFEA]">
            <Clock className="w-3.5 h-3.5 text-[#C89B5C]" />
            <span className="font-mono font-bold">{formatDate(order.due_date)}</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#9E988F] mt-0.5 font-medium">Target Completion</span>
        </div>
      </div>

      {/* Bespoke Garment Production Lifecycle Pipeline Stepper */}
      <div className="w-full bg-[#13161C] p-3 rounded-xl border border-[rgba(158,152,143,0.18)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#9E988F]">Stage:</span>
          <span className="capitalize font-bold text-[#C89B5C] tracking-wide">{order.status}</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => onStatusChange && onStatusChange(stage.key)}
                className={`h-2.5 rounded-full transition-all relative group/step ${
                  isCurrent
                    ? 'bg-[#C89B5C] shadow-md shadow-[#C89B5C]/50 ring-2 ring-[#F4EFEA]'
                    : isCompleted
                    ? 'bg-[#3E7B5C]'
                    : 'bg-[#2E3543] border border-[rgba(158,152,143,0.15)]'
                }`}
                title={`Advance to ${stage.label}`}
              />
            );
          })}
        </div>

        <div className="flex justify-between text-[9px] font-mono font-semibold text-[#9E988F] px-0.5">
          <span>Cut</span>
          <span>Sew</span>
          <span>Fit</span>
          <span>Ready</span>
          <span>Deliver</span>
        </div>
      </div>

      {/* Bottom Swatch & Financial Breakdown */}
      <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(158,152,143,0.18)] text-xs">
        {/* Swatch Thumbnail Previews */}
        <div className="flex items-center gap-1.5">
          {order.fabric_swatches && order.fabric_swatches.length > 0 ? (
            <div className="flex -space-x-2">
              {order.fabric_swatches.slice(0, 3).map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#1D222A] overflow-hidden bg-[#2E3543] shadow-sm"
                >
                  <img src={url} alt="Fabric swatch" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9E988F]">
              <Scissors className="w-3.5 h-3.5 text-[#C89B5C]" />
              <span>No swatch</span>
            </div>
          )}
        </div>

        {/* Payment Balance */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-[#F4EFEA] tnum">
              {formatCurrency(order.total_price)}
            </span>
            <div className="text-[10px] font-mono">
              {balanceDue === 0 ? (
                <span className="text-[#3E7B5C] font-bold">Paid in Full</span>
              ) : (
                <span className="text-[#E28743] font-semibold">{formatCurrency(balanceDue)} due</span>
              )}
            </div>
          </div>

          <Link
            href={`/orders/${order.id}`}
            className="p-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-[#9E988F] hover:text-[#F4EFEA] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
