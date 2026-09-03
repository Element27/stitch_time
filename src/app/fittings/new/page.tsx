'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Client, MeasurementTemplate, MeasurementLog, MeasurementUnit } from '@/lib/db/types';
import { saveMeasurementLogOfflineFirst, saveClientOfflineFirst } from '@/lib/sync/syncEngine';
import { inchesToCm, cmToInches, formatMeasurement } from '@/lib/utils';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { AnatomicalMannequin } from '@/components/atelier/AnatomicalMannequin';
import { MeasurementInputPad } from '@/components/atelier/MeasurementInputPad';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import {
  Ruler,
  Users,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Sliders,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';

function FittingWorkspaceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get('clientId');

  // Dexie Data
  const clients = useLiveQuery(() => db.clients.toArray()) || [];
  const templates = useLiveQuery(() => db.measurement_templates.toArray()) || [];

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_savile_suit');
  const [unit, setUnit] = useState<MeasurementUnit>('inches');
  const [values, setValues] = useState<Record<string, number | string>>({});
  const [activeFieldIndex, setActiveFieldIndex] = useState<number>(0);
  const [fitStyle, setFitStyle] = useState<'ultra_slim' | 'tailored' | 'classic' | 'relaxed'>('tailored');
  const [postureNotes, setPostureNotes] = useState<string>('');
  const [shoulderSlope, setShoulderSlope] = useState<'regular' | 'square' | 'sloped'>('regular');
  const [sessionNotes, setSessionNotes] = useState<string>('');
  
  // UI Drawers
  const [showKeypadSheet, setShowKeypadSheet] = useState<boolean>(false);
  const [showPreferencesSheet, setShowPreferencesSheet] = useState<boolean>(false);
  const [showNewClientSheet, setShowNewClientSheet] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New Client Rapid State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Active Template
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const fields = activeTemplate?.fields || [];
  const activeField = fields[activeFieldIndex] || fields[0] || 'Chest (Full)';

  // Sync initial client from URL or default
  useEffect(() => {
    if (initialClientId && clients.some((c) => c.id === initialClientId)) {
      setSelectedClientId(initialClientId);
    } else if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClientId, clients]);

  // Load previous client measurement values if available for quick tuning
  const loadClientBaseline = async (clientId: string) => {
    try {
      const logs = await db.measurement_logs
        .where('client_id')
        .equals(clientId)
        .reverse()
        .sortBy('recorded_at');

      if (logs && logs.length > 0) {
        const latest = logs[0];
        setValues({ ...latest.values });
        if (latest.unit) setUnit(latest.unit);
        if (latest.fit_preferences?.fit_type) setFitStyle(latest.fit_preferences.fit_type);
        if (latest.fit_preferences?.posture_notes) setPostureNotes(latest.fit_preferences.posture_notes);
        if (latest.fit_preferences?.shoulder_slope) setShoulderSlope(latest.fit_preferences.shoulder_slope);
      }
    } catch {
      // ignore
    }
  };

  const handleClientChange = (cId: string) => {
    setSelectedClientId(cId);
    loadClientBaseline(cId);
  };

  const handleUnitToggle = (newUnit: MeasurementUnit) => {
    if (newUnit === unit) return;

    // Convert values
    const converted: Record<string, number | string> = {};
    for (const [k, v] of Object.entries(values)) {
      const num = typeof v === 'number' ? v : parseFloat(String(v));
      if (!isNaN(num)) {
        converted[k] = newUnit === 'cm' ? inchesToCm(num) : cmToInches(num);
      } else {
        converted[k] = v;
      }
    }

    setUnit(newUnit);
    setValues(converted);
  };

  const handleValueChange = (val: number | string) => {
    setValues((prev) => ({
      ...prev,
      [activeField]: val
    }));
  };

  const handleSelectFieldByName = (fieldName: string) => {
    const idx = fields.findIndex((f) => f.toLowerCase() === fieldName.toLowerCase());
    if (idx !== -1) {
      setActiveFieldIndex(idx);
    } else {
      // If field not in active template, add it
      setActiveFieldIndex(fields.length);
    }
    setShowKeypadSheet(true);
  };

  const handlePrevField = () => {
    if (activeFieldIndex > 0) {
      setActiveFieldIndex(activeFieldIndex - 1);
    }
  };

  const handleNextField = () => {
    if (activeFieldIndex < fields.length - 1) {
      setActiveFieldIndex(activeFieldIndex + 1);
    } else {
      setShowKeypadSheet(false);
    }
  };

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const newClient: Client = {
      id: `client_${Date.now()}`,
      user_id: 'user_atelier_current',
      full_name: newClientName,
      phone: newClientPhone || null,
      email: newClientEmail || null,
      created_at: new Date().toISOString()
    };

    await saveClientOfflineFirst(newClient);
    setSelectedClientId(newClient.id);
    setShowNewClientSheet(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
  };

  const handleSaveFittingSession = async () => {
    if (!selectedClientId) {
      alert('Please select or create a client first.');
      return;
    }

    setIsSaving(true);

    try {
      const newLog: MeasurementLog = {
        id: `log_${Date.now()}`,
        client_id: selectedClientId,
        template_id: selectedTemplateId || null,
        unit,
        values,
        fit_preferences: {
          fit_type: fitStyle,
          posture_notes: postureNotes,
          shoulder_slope: shoulderSlope
        },
        notes: sessionNotes || 'Fitting session recorded in Atelier workspace',
        recorded_at: new Date().toISOString()
      };

      await saveMeasurementLogOfflineFirst(newLog);
      setSaveSuccess(true);

      setTimeout(() => {
        router.push(`/clients/${selectedClientId}`);
      }, 900);
    } catch (err) {
      console.error('Failed to save fitting session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Completion count
  const filledCount = fields.filter((f) => values[f] !== undefined && values[f] !== '').length;

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title="Fitting Studio" subtitle="Tactile Measurement Workspace" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Client & Template Top Controls */}
        <section className="bg-[#181715] border border-[rgba(214,203,189,0.12)] rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          {/* Client Selector & Quick Add */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
                Client Patron
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="flex-1 bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl px-3 py-2 text-sm font-serif font-semibold text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
                >
                  <option value="" disabled>Select Client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} {c.vip_status ? '★ (VIP)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClientSheet(true)}
                  className="p-2.5 rounded-xl bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.15)] text-[#E0BA62] transition-colors"
                  title="Add New Client"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Template Picker */}
            <div className="flex-1">
              <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
                Garment Silhouette Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl px-3 py-2 text-sm font-mono text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name} ({tmpl.fields?.length || 0} pts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Toggle & Progress Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[rgba(214,203,189,0.08)]">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#9E948A]">Progress:</span>
              <span className="font-bold text-[#E0BA62] tnum">
                {filledCount} / {fields.length} points
              </span>
              <span className="text-[10px] text-[#9E948A] hidden sm:inline">
                ({Math.round((filledCount / (fields.length || 1)) * 100)}%)
              </span>
            </div>

            {/* Unit Switcher */}
            <div className="flex items-center gap-1 bg-[#141312] p-1 rounded-xl border border-[rgba(214,203,189,0.1)]">
              <button
                type="button"
                onClick={() => handleUnitToggle('inches')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  unit === 'inches'
                    ? 'bg-[#C89B3C] text-[#141312] shadow-sm'
                    : 'text-[#9E948A] hover:text-[#FAF7F2]'
                }`}
              >
                Inches (&quot;)
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('cm')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  unit === 'cm'
                    ? 'bg-[#C89B3C] text-[#141312] shadow-sm'
                    : 'text-[#9E948A] hover:text-[#FAF7F2]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Silhouette & Direct Field Grid Split View */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Mannequin Pinpoint Display (Left / Top) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <AnatomicalMannequin
              selectedField={activeField}
              onSelectField={handleSelectFieldByName}
              values={values}
              unit={unit}
            />

            {/* Posture & Fit Preferences Button */}
            <button
              type="button"
              onClick={() => setShowPreferencesSheet(true)}
              className="w-full max-w-[340px] mt-3 py-2.5 px-4 rounded-xl bg-[#181715] hover:bg-[#242220] border border-[rgba(214,203,189,0.12)] text-xs font-mono flex items-center justify-between text-[#FAF7F2] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Fit Preferences &amp; Posture</span>
              </div>
              <span className="capitalize text-[#E0BA62]">{fitStyle}</span>
            </button>
          </div>

          {/* Rapid Measurement Point Cards (Right / Bottom) */}
          <div className="md:col-span-7 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono uppercase text-[#9E948A]">
                Measurement Points ({fields.length})
              </span>
              <button
                type="button"
                onClick={() => setShowKeypadSheet(true)}
                className="text-xs font-mono text-[#E0BA62] hover:underline"
              >
                Open Full Keypad
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {fields.map((field, idx) => {
                const isCurrent = idx === activeFieldIndex;
                const val = values[field];
                const hasValue = val !== undefined && val !== '';

                return (
                  <div
                    key={field}
                    onClick={() => {
                      setActiveFieldIndex(idx);
                      setShowKeypadSheet(true);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-[#1E1D1B] border-[#C89B3C] ring-1 ring-[#C89B3C]/50 shadow-md'
                        : hasValue
                        ? 'bg-[#181715] border-[rgba(214,203,189,0.14)] hover:border-[#C89B3C]/40'
                        : 'bg-[#181715]/60 border-[rgba(214,203,189,0.08)] hover:border-[rgba(214,203,189,0.2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-[#242220] text-[#9E948A] text-[10px] font-mono flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-serif font-medium text-[#FAF7F2] truncate">
                        {field}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-sm font-mono font-bold tnum ${
                          hasValue ? 'text-[#E0BA62]' : 'text-[#9E948A]/40'
                        }`}
                      >
                        {hasValue ? formatMeasurement(val, unit) : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Session Notes Input */}
            <div className="mt-2 bg-[#181715] p-3 rounded-xl border border-[rgba(214,203,189,0.1)]">
              <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
                Atelier Fitting Session Notes
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="e.g. Right shoulder sitting 0.25 low, tightened waist suppression, baste fitting..."
                rows={2}
                className="w-full bg-[#141312] border border-[rgba(214,203,189,0.1)] rounded-lg p-2 text-xs text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* Bottom Floating Save Action */}
        <div className="sticky bottom-16 z-20 py-2 bg-[#141312]/90 backdrop-blur-md flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveFittingSession}
            disabled={isSaving || saveSuccess}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              saveSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-[#C89B3C] hover:bg-[#D4A373] active:scale-[0.98] text-[#141312] shadow-[#C89B3C]/25'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Measurements Saved &amp; Synced!</span>
              </>
            ) : isSaving ? (
              <span>Saving to Atelier DB...</span>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Save Client Fitting ({filledCount} Points Logged)</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Touch Keypad Bottom Sheet */}
      <BottomSheet
        isOpen={showKeypadSheet}
        onClose={() => setShowKeypadSheet(false)}
        title="Rapid Fitting Input"
        subtitle={activeField}
      >
        <MeasurementInputPad
          fieldName={activeField}
          fieldIndex={activeFieldIndex}
          totalFields={fields.length}
          currentValue={values[activeField]}
          unit={unit}
          onChange={handleValueChange}
          onPrev={handlePrevField}
          onNext={handleNextField}
          onClose={() => setShowKeypadSheet(false)}
        />
      </BottomSheet>

      {/* Fit Preferences & Posture Bottom Sheet */}
      <BottomSheet
        isOpen={showPreferencesSheet}
        onClose={() => setShowPreferencesSheet(false)}
        title="Fit Silhouette &amp; Posture Adjustment"
        subtitle="Anatomical Ease &amp; Incline Preferences"
      >
        <div className="flex flex-col gap-4 text-xs">
          {/* Fit Silhouette Profile */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1.5">
              Ease Silhouette
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ultra_slim', label: 'Ultra Slim', desc: 'Zero ease, skintight contour' },
                { id: 'tailored', label: 'Tailored Cut', desc: '1.5 - 2" chest ease, clean taper' },
                { id: 'classic', label: 'Classic Drape', desc: '2.5 - 3.5" ease, traditional drape' },
                { id: 'relaxed', label: 'Relaxed / Oversized', desc: 'Architectural loose fit' }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFitStyle(style.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    fitStyle === style.id
                      ? 'bg-[#1E1D1B] border-[#C89B3C] ring-1 ring-[#C89B3C]'
                      : 'bg-[#242220] border-[rgba(214,203,189,0.1)] text-[#9E948A]'
                  }`}
                >
                  <span className="font-serif font-bold text-[#FAF7F2] block">{style.label}</span>
                  <span className="text-[10px] text-[#9E948A] mt-0.5 block">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shoulder Slope */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1.5">
              Shoulder Incline
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'square', label: 'Square (High)' },
                { id: 'regular', label: 'Regular (Neutral)' },
                { id: 'sloped', label: 'Sloped (Low)' }
              ].map((slope) => (
                <button
                  key={slope.id}
                  type="button"
                  onClick={() => setShoulderSlope(slope.id as any)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all ${
                    shoulderSlope === slope.id
                      ? 'bg-[#C89B3C] text-[#141312] font-bold border-[#FAF7F2]'
                      : 'bg-[#242220] border-[rgba(214,203,189,0.1)] text-[#FAF7F2]'
                  }`}
                >
                  {slope.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posture Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1.5">
              Posture &amp; Anatomical Asymmetry Notes
            </label>
            <textarea
              value={postureNotes}
              onChange={(e) => setPostureNotes(e.target.value)}
              placeholder="e.g. Erect head carriage, left hip sits 0.5 inches higher, prominent chest drop..."
              rows={3}
              className="w-full bg-[#141312] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPreferencesSheet(false)}
            className="w-full py-3 rounded-xl bg-[#C89B3C] text-[#141312] font-semibold transition-colors mt-2"
          >
            Apply Preferences
          </button>
        </div>
      </BottomSheet>

      {/* Quick Add Client Bottom Sheet */}
      <BottomSheet
        isOpen={showNewClientSheet}
        onClose={() => setShowNewClientSheet(false)}
        title="Register New Patron"
        subtitle="Quick Client Profile"
      >
        <form onSubmit={handleCreateNewClient} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Arthur Pendelton"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+44 7700 900123"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#9E948A] block mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="client@bespoke.com"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.14)] rounded-xl p-3 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-sm transition-colors mt-2"
          >
            Create Client &amp; Proceed to Measure
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}

export default function NewFittingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141312] text-[#FAF7F2] p-8 text-center font-mono">Loading Atelier Studio...</div>}>
      <FittingWorkspaceInner />
    </Suspense>
  );
}
