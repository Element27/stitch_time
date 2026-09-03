'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Client } from '@/lib/db/types';
import { saveClientOfflineFirst } from '@/lib/sync/syncEngine';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import { formatDate, getInitials } from '@/lib/utils';
import { Users, Plus, Search, Star, Ruler, Scissors, ChevronRight, Phone, Mail } from 'lucide-react';

export default function ClientsPage() {
  const clients = useLiveQuery(() => db.clients.orderBy('full_name').toArray()) || [];
  const measurementLogs = useLiveQuery(() => db.measurement_logs.toArray()) || [];
  const orders = useLiveQuery(() => db.orders.toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientSheet, setShowAddClientSheet] = useState(false);

  // New Client Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isVip, setIsVip] = useState(false);

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newClient: Client = {
      id: `client_${Date.now()}`,
      user_id: 'user_atelier_current',
      full_name: name,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      vip_status: isVip,
      created_at: new Date().toISOString()
    };

    await saveClientOfflineFirst(newClient);
    setShowAddClientSheet(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setIsVip(false);
  };

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title="Client Roster" subtitle="Bespoke Patron Archives" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Top Title & CTA */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#FAF7F2]">
              Patrons &amp; Clients
            </h2>
            <p className="text-xs text-[#9E948A]">
              {clients.length} registered bespoke clients
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddClientSheet(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-xs transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Real-time Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9E948A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patrons by name, phone, email, fit notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181715] border border-[rgba(214,203,189,0.12)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
          />
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredClients.map((client) => {
            const clientLogs = measurementLogs.filter((l) => l.client_id === client.id);
            const clientOrders = orders.filter((o) => o.client_id === client.id);

            return (
              <div
                key={client.id}
                className="p-4 rounded-2xl bg-[#181715] hover:bg-[#1E1D1B] border border-[rgba(214,203,189,0.12)] hover:border-[#C89B3C]/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#242220] border border-[rgba(214,203,189,0.2)] flex items-center justify-center font-mono font-bold text-xs text-[#E0BA62] overflow-hidden flex-shrink-0">
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
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-base font-serif font-bold text-[#FAF7F2] group-hover:text-[#E0BA62] transition-colors hover:underline"
                        >
                          {client.full_name}
                        </Link>
                        {client.vip_status && (
                          <Star className="w-3.5 h-3.5 text-[#C89B3C] fill-[#C89B3C]" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-[#9E948A]">
                        Joined {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-xs text-[#FAF7F2]/80 line-clamp-2 bg-[#141312] p-2.5 rounded-lg border border-[rgba(214,203,189,0.06)] font-mono">
                    {client.notes}
                  </p>
                )}

                {/* Contact & Fitting Counts */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(214,203,189,0.08)] text-xs">
                  <div className="flex items-center gap-3 text-[#9E948A] text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-[#C89B3C]" /> {clientLogs.length} fits
                    </span>
                    <span className="flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-[#C89B3C]" /> {clientOrders.length} orders
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/fittings/new?clientId=${client.id}`}
                      className="px-2.5 py-1 rounded-lg bg-[#242220] hover:bg-[#C89B3C] text-[#FAF7F2] hover:text-[#141312] text-xs font-mono transition-colors"
                      title="Measure Client"
                    >
                      Measure
                    </Link>
                    <Link
                      href={`/clients/${client.id}`}
                      className="p-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] text-[#9E948A] hover:text-[#FAF7F2] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Client Bottom Sheet */}
      <BottomSheet
        isOpen={showAddClientSheet}
        onClose={() => setShowAddClientSheet(false)}
        title="Add Bespoke Client"
        subtitle="Register New Patron in Atelier Archives"
      >
        <form onSubmit={handleCreateClient} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lord Charles Harrington"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+44 20 7946 0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="charles@mayfair.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
              Anatomical &amp; Tailoring Notes
            </label>
            <textarea
              placeholder="e.g. Slope shoulders, preference for unlined jackets, bespoke ease..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-[#242220] cursor-pointer">
            <input
              type="checkbox"
              checked={isVip}
              onChange={(e) => setIsVip(e.target.checked)}
              className="rounded text-[#C89B3C] focus:ring-[#C89B3C] bg-[#141312]"
            />
            <span className="text-xs font-mono text-[#FAF7F2]">Mark as VIP Patron</span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-sm transition-colors mt-2"
          >
            Save Client Profile
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}
