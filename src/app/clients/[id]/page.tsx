'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { updateClientOfflineFirst, deleteClientOfflineFirst, updateOrderOfflineFirst } from '@/lib/sync/syncEngine';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { MeasurementCompare } from '@/components/atelier/MeasurementCompare';
import { OrderPipelineCard } from '@/components/atelier/OrderPipelineCard';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import { formatDate, formatMeasurement, getInitials } from '@/lib/utils';
import {
  Ruler,
  Scissors,
  Star,
  Phone,
  Mail,
  Edit,
  Trash2,
  Plus,
  History,
  ChevronLeft,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const client = useLiveQuery(() => db.clients.get(clientId), [clientId]);
  const logs = useLiveQuery(
    () => db.measurement_logs.where('client_id').equals(clientId).reverse().sortBy('recorded_at'),
    [clientId]
  ) || [];
  const orders = useLiveQuery(
    () => db.orders.where('client_id').equals(clientId).reverse().sortBy('created_at'),
    [clientId]
  ) || [];

  const [activeTab, setActiveTab] = useState<'fits' | 'compare' | 'orders'>('fits');
  const [showEditSheet, setShowEditSheet] = useState(false);

  // Edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isVip, setIsVip] = useState(false);

  const openEdit = () => {
    if (client) {
      setName(client.full_name);
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setNotes(client.notes || '');
      setIsVip(Boolean(client.vip_status));
      setShowEditSheet(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    await updateClientOfflineFirst(client.id, {
      full_name: name,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      vip_status: isVip
    });

    setShowEditSheet(false);
  };

  const handleDelete = async () => {
    if (!client) return;
    if (confirm(`Are you sure you want to remove ${client.full_name} from the atelier archives?`)) {
      await deleteClientOfflineFirst(client.id);
      router.push('/clients');
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
        <AtelierHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-[#9E948A]">
          Loading Patron Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title={client.full_name} subtitle="Patron Profile &amp; Fitting Logs" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-xs font-mono text-[#9E948A] hover:text-[#FAF7F2] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Patrons</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openEdit}
              className="p-2 rounded-lg bg-[#242220] hover:bg-[#2E2B27] text-[#9E948A] hover:text-[#FAF7F2] transition-colors"
              title="Edit Profile"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-lg bg-[#2A1E1E] hover:bg-[#382626] text-red-300 transition-colors"
              title="Delete Profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Client Profile Header Card */}
        <section className="p-5 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] shadow-xl flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-[#2E3543] border-2 border-[#C89B5C]/50 flex items-center justify-center font-mono font-bold text-base text-[#C89B5C] overflow-hidden flex-shrink-0">
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

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-[#F4EFEA]">
                    {client.full_name}
                  </h2>
                  {client.vip_status && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#C89B5C]/20 border border-[#C89B5C]/40 text-[#C89B5C] flex items-center gap-1 font-bold">
                      <Star className="w-2.5 h-2.5 fill-[#C89B5C]" /> VIP Patron
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#9E988F] mt-1 font-mono">
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:text-[#F4EFEA]">
                      <Phone className="w-3 h-3 text-[#C89B5C]" /> {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-1 hover:text-[#F4EFEA]">
                      <Mail className="w-3 h-3 text-[#C89B5C]" /> {client.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Link
              href={`/fittings/new?clientId=${client.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-colors shadow-lg shadow-[#C89B5C]/20 flex-shrink-0"
            >
              <Ruler className="w-4 h-4 stroke-[2.2]" />
              <span>Record Fitting</span>
            </Link>
          </div>

          {/* Posture / Tailoring Notes */}
          {client.notes && (
            <div className="p-3 rounded-xl bg-[#13161C] border border-[rgba(158,152,143,0.18)]">
              <span className="text-[10px] font-mono uppercase text-[#C89B5C] block mb-0.5 font-bold">
                Atelier Tailoring Profile &amp; Posture
              </span>
              <p className="text-xs text-[#F4EFEA] leading-relaxed font-mono">
                {client.notes}
              </p>
            </div>
          )}
        </section>

        {/* Tab Navigation (Fits / Version Diff / Orders) */}
        <div className="flex items-center gap-2 border-b border-[rgba(158,152,143,0.18)] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('fits')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
              activeTab === 'fits'
                ? 'bg-[#C89B5C] text-[#13161C] font-bold border-[#F4EFEA] shadow-md'
                : 'bg-[#1D222A] text-[#9E988F] hover:text-[#F4EFEA] border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50'
            }`}
          >
            Fitting Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-[#C89B5C] text-[#13161C] font-bold border-[#F4EFEA] shadow-md'
                : 'bg-[#1D222A] text-[#9E988F] hover:text-[#F4EFEA] border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50'
            }`}
          >
            Version Delta Compare
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#C89B5C] text-[#13161C] font-bold border-[#F4EFEA] shadow-md'
                : 'bg-[#1D222A] text-[#9E988F] hover:text-[#F4EFEA] border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50'
            }`}
          >
            Bespoke Orders ({orders.length})
          </button>
        </div>

        {/* Tab Content: Fitting Sessions */}
        {activeTab === 'fits' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] text-xs text-[#9E988F]">
                <Ruler className="w-8 h-8 text-[#C89B5C] mx-auto mb-2" />
                <p className="font-serif text-base font-bold text-[#F4EFEA] mb-1">No Measurement Logs</p>
                <p className="text-xs text-[#9E988F] mb-3">No fitting sessions recorded for this client yet.</p>
                <Link
                  href={`/fittings/new?clientId=${client.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-bold text-xs transition-colors shadow-md"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Start First Fitting Session &rarr;</span>
                </Link>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] hover:border-[#C89B5C]/50 flex flex-col gap-3 shadow-md transition-all"
                >
                  <div className="flex items-center justify-between border-b border-[rgba(158,152,143,0.18)] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2E3543] border border-[#C89B5C]/50 text-[#C89B5C] text-xs font-mono flex items-center justify-center font-bold">
                        v{logs.length - idx}
                      </span>
                      <span className="text-sm font-serif font-bold text-[#F4EFEA]">
                        {formatDate(log.recorded_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2E3543] text-[#C89B5C] border border-[#C89B5C]/40 uppercase font-semibold">
                        {log.unit}
                      </span>
                      {log.fit_preferences?.fit_type && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2E3543] text-[#9E988F] border border-[rgba(158,152,143,0.18)] capitalize font-medium">
                          {log.fit_preferences.fit_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-xs text-[#F4EFEA] bg-[#13161C] p-2.5 rounded-lg border border-[rgba(158,152,143,0.18)] font-mono leading-relaxed">
                      &ldquo;{log.notes}&rdquo;
                    </p>
                  )}

                  {/* Measurement Points Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {Object.entries(log.values || {}).map(([point, val]) => (
                      <div
                        key={point}
                        className="p-2.5 rounded-xl bg-[#2E3543] border border-[rgba(158,152,143,0.18)] flex flex-col justify-between"
                      >
                        <span className="text-[10px] font-mono text-[#9E988F] truncate">{point}</span>
                        <span className="text-sm font-mono font-bold text-[#C89B5C] tnum mt-0.5">
                          {formatMeasurement(val, log.unit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Version Delta Compare */}
        {activeTab === 'compare' && (
          <div>
            <MeasurementCompare logs={logs} />
          </div>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#9E988F]">
                {orders.length} Garment Orders
              </span>
              <Link
                href={`/orders?newFor=${client.id}`}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#C89B5C] hover:underline font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Order for Patron</span>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#1D222A] border border-[rgba(158,152,143,0.18)] text-xs text-[#9E988F]">
                <Scissors className="w-8 h-8 text-[#C89B5C] mx-auto mb-2" />
                <p className="font-serif text-base font-bold text-[#F4EFEA] mb-1">No Orders Commissioned</p>
                <p className="text-xs text-[#9E988F]">No bespoke garments commissioned by this client yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <OrderPipelineCard
                  key={order.id}
                  order={order}
                  clientName={client.full_name}
                  onStatusChange={async (newStatus) => {
                    await updateOrderOfflineFirst(order.id, { status: newStatus });
                  }}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Edit Client Drawer */}
      <BottomSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Edit Patron Profile"
        subtitle={client.full_name}
      >
        <form onSubmit={handleUpdate} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E988F] font-semibold block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2E3543] border border-[rgba(158,152,143,0.18)] rounded-xl p-3 text-[#F4EFEA] placeholder-[#7D776E] focus:border-[#C89B5C] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#9E988F] font-semibold block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#2E3543] border border-[rgba(158,152,143,0.18)] rounded-xl p-3 text-[#F4EFEA] placeholder-[#7D776E] focus:border-[#C89B5C] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#9E988F] font-semibold block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2E3543] border border-[rgba(158,152,143,0.18)] rounded-xl p-3 text-[#F4EFEA] placeholder-[#7D776E] focus:border-[#C89B5C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E988F] font-semibold block mb-1">
              Anatomical &amp; Tailoring Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#2E3543] border border-[rgba(158,152,143,0.18)] rounded-xl p-3 text-[#F4EFEA] placeholder-[#7D776E] focus:border-[#C89B5C] focus:outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#2E3543] border border-[rgba(158,152,143,0.18)] cursor-pointer">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="rounded text-[#C89B5C] focus:ring-[#C89B5C] bg-[#13161C] w-4 h-4"
            />
            <span className="text-xs font-mono font-medium text-[#F4EFEA]">Mark as VIP Patron</span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] active:scale-[0.98] text-[#13161C] font-bold text-sm transition-all shadow-lg shadow-[#C89B5C]/20 mt-2"
          >
            Update Profile
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}
