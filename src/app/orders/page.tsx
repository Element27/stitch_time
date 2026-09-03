'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Order, OrderStatus } from '@/lib/db/types';
import { saveOrderOfflineFirst, updateOrderOfflineFirst } from '@/lib/sync/syncEngine';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { OrderPipelineCard } from '@/components/atelier/OrderPipelineCard';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import { SwatchGallery } from '@/components/atelier/SwatchGallery';
import { formatCurrency } from '@/lib/utils';
import {
  Scissors,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Garments' },
  { key: 'pending', label: 'Pending' },
  { key: 'cutting', label: 'Cutting' },
  { key: 'sewing', label: 'Sewing' },
  { key: 'fitting', label: 'Fitting' },
  { key: 'ready', label: 'Ready' },
  { key: 'delivered', label: 'Delivered' }
];

export default function OrdersPage() {
  const orders = useLiveQuery(() => db.orders.reverse().sortBy('created_at')) || [];
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const logs = useLiveQuery(() => db.measurement_logs.toArray()) || [];

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOrderSheet, setShowNewOrderSheet] = useState(false);

  // New Order State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedLogId, setSelectedLogId] = useState('');
  const [title, setTitle] = useState('');
  const [garmentType, setGarmentType] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [dueDate, setDueDate] = useState('');
  const [totalPrice, setTotalPrice] = useState<string>('2400');
  const [depositPaid, setDepositPaid] = useState<string>('1200');
  const [priority, setPriority] = useState<'standard' | 'rush' | 'editorial'>('standard');
  const [notes, setNotes] = useState('');
  const [selectedSwatches, setSelectedSwatches] = useState<string[]>([]);

  const filteredOrders = orders.filter((order) => {
    const client = clients.find((c) => c.id === order.client_id);
    const clientName = client?.full_name?.toLowerCase() || '';
    const orderTitle = order.title.toLowerCase();
    const matchesSearch =
      clientName.includes(searchQuery.toLowerCase()) ||
      orderTitle.includes(searchQuery.toLowerCase()) ||
      (order.garment_type && order.garment_type.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = activeTab === 'all' ? true : order.status === activeTab;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderOfflineFirst(orderId, { status: newStatus });
  };

  const handleToggleSwatch = (swatchUrl: string) => {
    if (selectedSwatches.includes(swatchUrl)) {
      setSelectedSwatches(selectedSwatches.filter((s) => s !== swatchUrl));
    } else {
      setSelectedSwatches([...selectedSwatches, swatchUrl]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !title) return;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      user_id: 'user_atelier_current',
      client_id: selectedClientId,
      measurement_log_id: selectedLogId || null,
      title,
      garment_type: garmentType || 'Bespoke Garment',
      status,
      due_date: dueDate || null,
      total_price: parseFloat(totalPrice) || 0,
      deposit_paid: parseFloat(depositPaid) || 0,
      fabric_swatches: selectedSwatches,
      priority,
      notes: notes || null,
      created_at: new Date().toISOString()
    };

    await saveOrderOfflineFirst(newOrder);
    setShowNewOrderSheet(false);
    // Reset form
    setTitle('');
    setGarmentType('');
    setDueDate('');
    setNotes('');
    setSelectedSwatches([]);
  };

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title="Workbench Orders" subtitle="Production Lifecycle Pipeline" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Header & CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#FAF7F2]">
              Garment Commissions
            </h2>
            <p className="text-xs text-[#9E948A]">
              {orders.filter((o) => o.status !== 'delivered').length} active garments in atelier production
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (clients.length > 0 && !selectedClientId) {
                setSelectedClientId(clients[0].id);
              }
              setShowNewOrderSheet(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-xs transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>

        {/* Search & Status Pill Filter Tabs */}
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#D3C7B6] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search garments by commission title, patron, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181715] border border-[rgba(214,203,189,0.18)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          {/* Horizontal Scrollable Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
              const count =
                tab.key === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status === tab.key).length;

              const isSelected = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#C89B3C] text-[#141312] font-bold border-[#FAF7F2] shadow-md'
                      : 'bg-[#181715] text-[#D3C7B6] hover:text-[#FAF7F2] border-[rgba(214,203,189,0.12)] hover:border-[#C89B3C]/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-[#141312] text-[#FAF7F2]'
                        : 'bg-[#242220] text-[#E0BA62] border border-[rgba(214,203,189,0.1)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Pipeline List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredOrders.length === 0 ? (
            <div className="md:col-span-2 p-10 text-center rounded-2xl bg-[#181715] border border-[rgba(214,203,189,0.12)] text-xs text-[#D3C7B6]">
              <Scissors className="w-8 h-8 text-[#C89B3C] mx-auto mb-2" />
              <p className="font-serif text-sm text-[#FAF7F2] mb-1">No Orders Found</p>
              <p className="text-xs text-[#B8ADA0]">No garments found matching the selected filter criteria.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const client = clients.find((c) => c.id === order.client_id);
              return (
                <OrderPipelineCard
                  key={order.id}
                  order={order}
                  clientName={client?.full_name}
                  onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                />
              );
            })
          )}
        </div>
      </main>

      {/* New Commission / Order Bottom Sheet */}
      <BottomSheet
        isOpen={showNewOrderSheet}
        onClose={() => setShowNewOrderSheet(false)}
        title="Commission Bespoke Garment"
        subtitle="Create Order &amp; Attach Fabric Swatches"
      >
        <form onSubmit={handleCreateOrder} className="flex flex-col gap-3.5 text-xs">
          {/* Client Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Patron Client *
            </label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                const clientLogs = logs.filter((l) => l.client_id === e.target.value);
                if (clientLogs.length > 0) setSelectedLogId(clientLogs[0].id);
              }}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-serif text-sm focus:border-[#C89B3C] focus:outline-none"
            >
              <option value="" disabled>Select Patron...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} {c.vip_status ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Garment Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Order Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Midnight Barathea Tuxedo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Garment Category
              </label>
              <input
                type="text"
                placeholder="e.g. Bespoke 3-Piece Suit"
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          {/* Target Stage & Priority */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Starting Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="cutting">Cutting</option>
                <option value="sewing">Sewing</option>
                <option value="fitting">Fitting</option>
                <option value="ready">Ready</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
              >
                <option value="standard">Standard Atelier</option>
                <option value="rush">Rush Express</option>
                <option value="editorial">Haute Couture</option>
              </select>
            </div>
          </div>

          {/* Pricing & Deposit */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Total Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
                Deposit Received ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Target Completion / Fitting Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          {/* Swatch Picker */}
          <div className="pt-2 border-t border-[rgba(214,203,189,0.12)]">
            <SwatchGallery
              selectedSwatches={selectedSwatches}
              onToggleSwatch={handleToggleSwatch}
            />
          </div>

          {/* Commission Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Workbench / Tailor Instructions
            </label>
            <textarea
              placeholder="e.g. Working buttonholes, bordeaux silk lining, double vents, side tab adjusters..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] active:scale-[0.98] text-[#141312] font-bold text-sm transition-all shadow-lg shadow-[#C89B3C]/20 mt-2"
          >
            Create Order &amp; Launch Workbench
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}
