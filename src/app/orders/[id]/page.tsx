'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { OrderStatus } from '@/lib/db/types';
import { updateOrderOfflineFirst, deleteOrderOfflineFirst } from '@/lib/sync/syncEngine';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import { formatCurrency, formatDate, formatMeasurement } from '@/lib/utils';
import {
  Scissors,
  Clock,
  DollarSign,
  Ruler,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Plus
} from 'lucide-react';

const STAGES: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Pending', desc: 'Fabric sourced & awaiting shear cutting' },
  { key: 'cutting', label: 'Cutting', desc: 'Cloth chalked, basted & sheared to pattern' },
  { key: 'sewing', label: 'Sewing', desc: 'Canvassing, hand-sewing & structure' },
  { key: 'fitting', label: 'Fitting', desc: 'Client fitting & chalk adjustments' },
  { key: 'ready', label: 'Ready', desc: 'Final press, hand finishing & buttons' },
  { key: 'delivered', label: 'Delivered', desc: 'Garment handed to patron' }
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const order = useLiveQuery(() => db.orders.get(orderId), [orderId]);
  const client = useLiveQuery(() => (order ? db.clients.get(order.client_id) : undefined), [order]);
  const measurementLog = useLiveQuery(
    () => (order?.measurement_log_id ? db.measurement_logs.get(order.measurement_log_id) : undefined),
    [order]
  );

  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState<string>('');

  if (!order) {
    return (
      <div className="min-h-screen bg-[#13161C] text-[#F4EFEA] pb-28 atelier-grain">
        <AtelierHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-[#9E988F]">
          Loading Garment Workbench...
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);
  const balanceDue = Math.max(0, order.total_price - (order.deposit_paid || 0));

  const handleStageSelect = async (stage: OrderStatus) => {
    await updateOrderOfflineFirst(order.id, { status: stage });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(additionalPayment) || 0;
    if (amount <= 0) return;

    const newDeposit = Math.min(order.total_price, (order.deposit_paid || 0) + amount);
    await updateOrderOfflineFirst(order.id, { deposit_paid: newDeposit });
    setShowPaymentSheet(false);
    setAdditionalPayment('');
  };

  const handleDeleteOrder = async () => {
    if (confirm(`Remove commission "${order.title}" from workbench?`)) {
      await deleteOrderOfflineFirst(order.id);
      router.push('/orders');
    }
  };

  return (
    <div className="min-h-screen bg-[#13161C] text-[#F4EFEA] pb-28 atelier-grain">
      <AtelierHeader title={order.title} subtitle="Garment Workbench &amp; Lifecycle" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-mono text-[#9E988F] hover:text-[#F4EFEA] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Workbench Orders</span>
          </Link>

          <button
            type="button"
            onClick={handleDeleteOrder}
            className="p-2 rounded-lg bg-[#3B2525] hover:bg-[#4A2D2D] text-red-300 transition-colors"
            title="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Order Header Summary */}
        <section className="p-5 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] shadow-xl flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {order.priority === 'rush' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#E28743]/20 border border-[#E28743]/50 text-[#E28743] flex items-center gap-1 font-bold">
                    <AlertCircle className="w-2.5 h-2.5" /> Rush Order
                  </span>
                )}
                {client && (
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-xs font-mono text-[#C89B5C] hover:underline font-bold"
                  >
                    Patron: {client.full_name} &rarr;
                  </Link>
                )}
              </div>
              <h2 className="text-xl font-serif font-bold text-[#F4EFEA]">
                {order.title}
              </h2>
              {order.garment_type && (
                <p className="text-xs text-[#9E988F] mt-0.5">{order.garment_type}</p>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-[#9E988F]">
                <Clock className="w-3.5 h-3.5 text-[#C89B5C]" />
                <span className="font-mono">{formatDate(order.due_date)}</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#9E988F]/60">Due Date</span>
            </div>
          </div>

          {order.notes && (
            <div className="p-3 rounded-xl bg-[#13161C] border border-[rgba(158,152,143,0.18)]">
              <span className="text-[10px] font-mono uppercase text-[#C89B5C] block mb-0.5 font-bold">
                Tailor Workbench Notes
              </span>
              <p className="text-xs text-[#F4EFEA] font-mono leading-relaxed">
                {order.notes}
              </p>
            </div>
          )}
        </section>

        {/* Production Stage Pipeline Stepper */}
        <section className="p-5 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#C89B5C]" />
              <h3 className="text-sm font-serif font-bold text-[#F4EFEA]">
                Atelier Production Stage
              </h3>
            </div>
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-[#C89B5C]/20 text-[#C89B5C] border border-[#C89B5C]/40 font-bold">
              Current: {order.status}
            </span>
          </div>

          {/* Interactive Step Clickers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STAGES.map((stage, idx) => {
              const isCurrent = stage.key === order.status;
              const isPast = idx < currentStageIndex;

              return (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => handleStageSelect(stage.key)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-[#2E3543] border-[#C89B5C] ring-1 ring-[#C89B5C] shadow-lg'
                      : isPast
                      ? 'bg-[#1D222A] border-[#3E7B5C]/60 text-[#F4EFEA]'
                      : 'bg-[#13161C] border-[rgba(158,152,143,0.18)] text-[#9E988F] hover:border-[rgba(158,152,143,0.4)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-serif font-bold text-[#F4EFEA]">
                      {stage.label}
                    </span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E7B5C]" />}
                  </div>
                  <p className="text-[10px] text-[#9E988F] line-clamp-1">{stage.desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Financial Settlement & Swatch Attachments Split */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment & Balance */}
          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] flex flex-col justify-between gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[rgba(158,152,143,0.18)] pb-2.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#3E7B5C]" />
                <h3 className="text-sm font-serif font-bold text-[#F4EFEA]">
                  Financial Accounting
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentSheet(true)}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#C89B5C] hover:underline font-bold"
              >
                <Plus className="w-3 h-3" /> Record Payment
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#9E988F]">Total Price:</span>
                <span className="font-bold text-[#F4EFEA] tnum">{formatCurrency(order.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9E988F]">Deposit / Collected:</span>
                <span className="text-[#3E7B5C] font-bold tnum">{formatCurrency(order.deposit_paid || 0)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-[rgba(158,152,143,0.18)] text-sm">
                <span className="text-[#F4EFEA] font-semibold">Remaining Balance:</span>
                <span className={`font-bold tnum ${balanceDue === 0 ? 'text-[#3E7B5C]' : 'text-[#E28743]'}`}>
                  {balanceDue === 0 ? 'Settled in Full' : formatCurrency(balanceDue)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#13161C] h-2 rounded-full overflow-hidden border border-[rgba(158,152,143,0.18)]">
              <div
                style={{ width: `${Math.min(100, ((order.deposit_paid || 0) / (order.total_price || 1)) * 100)}%` }}
                className="bg-[#3E7B5C] h-full rounded-full transition-all"
              />
            </div>
          </div>

          {/* Attached Fabric Swatches */}
          <div className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-2 border-b border-[rgba(158,152,143,0.18)] pb-2.5">
              <Sparkles className="w-4 h-4 text-[#C89B5C]" />
              <h3 className="text-sm font-serif font-bold text-[#F4EFEA]">
                Fabric Cloth &amp; Swatches
              </h3>
            </div>

            {order.fabric_swatches && order.fabric_swatches.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {order.fabric_swatches.map((url, i) => (
                  <div
                    key={i}
                    className="relative h-28 rounded-xl overflow-hidden border border-[rgba(158,152,143,0.2)] group"
                  >
                    <img src={url} alt="Fabric swatch" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-mono text-[#F4EFEA]">Cloth Swatch #{i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#9E988F]">
                No fabric swatches attached to this commission.
              </div>
            )}
          </div>
        </section>

        {/* Linked Measurement Fitting Log */}
        {measurementLog && (
          <section className="p-5 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[rgba(158,152,143,0.18)] pb-2.5">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#C89B5C]" />
                <h3 className="text-sm font-serif font-bold text-[#F4EFEA]">
                  Linked Body Measurements
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#2E3543] text-[#C89B5C] font-bold border border-[rgba(158,152,143,0.18)]">
                {measurementLog.unit}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(measurementLog.values || {}).map(([point, val]) => (
                <div
                  key={point}
                  className="p-2 rounded-xl bg-[#2E3543] border border-[rgba(158,152,143,0.18)] flex flex-col"
                >
                  <span className="text-[10px] text-[#9E988F] truncate">{point}</span>
                  <span className="text-xs font-mono font-bold text-[#C89B5C] tnum">
                    {formatMeasurement(val, measurementLog.unit)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Record Payment Bottom Sheet */}
      <BottomSheet
        isOpen={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        title="Record Payment / Deposit"
        subtitle={`Order: ${order.title}`}
      >
        <form onSubmit={handleRecordPayment} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E988F] block mb-1 font-semibold">
              Payment Amount Received ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              max={balanceDue}
              placeholder={`Max ${balanceDue}`}
              value={additionalPayment}
              onChange={(e) => setAdditionalPayment(e.target.value)}
              className="w-full bg-[#2E3543] border border-[rgba(158,152,143,0.18)] rounded-xl p-3 text-[#F4EFEA] font-mono focus:border-[#C89B5C] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-sm transition-colors mt-2 shadow-md"
          >
            Confirm Deposit &amp; Update Ledger
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}
