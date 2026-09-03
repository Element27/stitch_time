'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { MeasurementTemplate } from '@/lib/db/types';
import { saveTemplateOfflineFirst } from '@/lib/sync/syncEngine';
import { AtelierHeader } from '@/components/navigation/AtelierHeader';
import { MobileBottomBar } from '@/components/navigation/MobileBottomBar';
import { BottomSheet } from '@/components/atelier/BottomSheet';
import {
  Layers,
  Plus,
  Ruler,
  Sparkles,
  Check,
  X,
  Scissors,
  ChevronRight
} from 'lucide-react';

export default function TemplatesPage() {
  const templates = useLiveQuery(() => db.measurement_templates.toArray()) || [];

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<any>('suit');
  const [templateDesc, setTemplateDesc] = useState('');
  const [fieldInputs, setFieldInputs] = useState<string[]>([
    'Chest',
    'Waist',
    'Shoulder',
    'Sleeve Length',
    'Neck',
    'Trouser Inseam'
  ]);
  const [newPointName, setNewPointName] = useState('');

  const handleAddField = () => {
    if (newPointName.trim() && !fieldInputs.includes(newPointName.trim())) {
      setFieldInputs([...fieldInputs, newPointName.trim()]);
      setNewPointName('');
    }
  };

  const handleRemoveField = (fieldToRemove: string) => {
    setFieldInputs(fieldInputs.filter((f) => f !== fieldToRemove));
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName || fieldInputs.length === 0) return;

    const newTemplate: MeasurementTemplate = {
      id: `tmpl_${Date.now()}`,
      user_id: 'user_atelier_current',
      name: templateName,
      category: templateCategory,
      description: templateDesc || 'Custom bespoke measurement template',
      fields: fieldInputs,
      created_at: new Date().toISOString()
    };

    await saveTemplateOfflineFirst(newTemplate);
    setShowAddSheet(false);
    setTemplateName('');
    setTemplateDesc('');
  };

  return (
    <div className="min-h-screen bg-[#141312] text-[#FAF7F2] pb-28 atelier-grain">
      <AtelierHeader title="Fitting Templates" subtitle="Measurement Silhouettes &amp; Patterns" />

      <main className="max-w-4xl mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#FAF7F2]">
              Measurement Templates
            </h2>
            <p className="text-xs text-[#D3C7B6]">
              Standardized body landmark profiles for rapid fitting sessions
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddSheet(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-bold text-xs transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#181715] border border-[rgba(214,203,189,0.12)] flex flex-col items-center gap-3 text-xs text-[#D3C7B6]">
            <Layers className="w-8 h-8 text-[#C89B3C] mx-auto" />
            <p className="font-serif text-sm text-[#FAF7F2]">No Measurement Templates Found</p>
            <p className="text-xs text-[#B8ADA0]">Create a custom template for suit, dress, shirt, or coat silhouettes.</p>
            <button
              type="button"
              onClick={() => setShowAddSheet(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C89B3C] text-[#141312] font-bold text-xs transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Template</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-5 rounded-2xl bg-[#181715] hover:bg-[#1E1D1B] border border-[rgba(214,203,189,0.14)] hover:border-[#C89B3C]/50 transition-all flex flex-col justify-between gap-3 shadow-lg group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C89B3C]/20 text-[#E0BA62] border border-[#C89B3C]/40 font-bold">
                      {tmpl.category || 'Garment'} Silhouette
                    </span>
                    <span className="text-xs font-mono font-medium text-[#D3C7B6]">
                      {tmpl.fields?.length || 0} measurement points
                    </span>
                  </div>

                  <h3 className="text-lg font-serif font-bold text-[#FAF7F2] group-hover:text-[#E0BA62] transition-colors">
                    {tmpl.name}
                  </h3>
                  {tmpl.description && (
                    <p className="text-xs text-[#D3C7B6] mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  )}
                </div>

                {/* Landmark points preview */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[rgba(214,203,189,0.1)]">
                  {(tmpl.fields || []).slice(0, 6).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-md bg-[#242220] border border-[rgba(214,203,189,0.1)] text-[11px] font-mono text-[#FAF7F2] font-medium"
                    >
                      {f}
                    </span>
                  ))}
                  {(tmpl.fields || []).length > 6 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#141312] border border-[rgba(214,203,189,0.1)] text-[10px] font-mono text-[#D3C7B6] font-semibold">
                      +{(tmpl.fields?.length || 0) - 6} more
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-[rgba(214,203,189,0.1)] flex items-center justify-end">
                  <Link
                    href={`/fittings/new`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#242220] hover:bg-[#C89B3C] text-[#FAF7F2] hover:text-[#141312] border border-[rgba(214,203,189,0.12)] text-xs font-bold transition-all shadow-sm"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Measure with Template</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Template Bottom Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Create Measurement Template"
        subtitle="Define Anatomical Landmark Points"
      >
        <form onSubmit={handleCreateTemplate} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Template Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Double-Breasted Peacoat"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-serif placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Garment Category
            </label>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value as any)}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] font-mono focus:border-[#C89B3C] focus:outline-none"
            >
              <option value="suit">Suit &amp; Tuxedo</option>
              <option value="dress">Dress &amp; Gown</option>
              <option value="trousers">Trousers &amp; Slacks</option>
              <option value="shirt">Bespoke Shirt</option>
              <option value="outerwear">Outerwear &amp; Coats</option>
              <option value="traditional">Traditional &amp; Ceremonial</option>
              <option value="custom">Custom Pattern</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Template Description
            </label>
            <textarea
              placeholder="e.g. Measurement set for structured winter overcoats with ease allowances..."
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              rows={2}
              className="w-full bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl p-3 text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none resize-none"
            />
          </div>

          {/* Landmark points pill editor */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#D3C7B6] font-semibold block mb-1">
              Measurement Landmark Points ({fieldInputs.length})
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Add point (e.g., Cross Back, Wrist)"
                value={newPointName}
                onChange={(e) => setNewPointName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddField();
                  }
                }}
                className="flex-1 bg-[#242220] border border-[rgba(214,203,189,0.18)] rounded-xl px-3 py-2 text-[#FAF7F2] placeholder-[#8E847A] focus:border-[#C89B3C] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="px-3.5 py-2 rounded-xl bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.18)] text-[#E0BA62] font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-[#141312] border border-[rgba(214,203,189,0.14)]">
              {fieldInputs.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#242220] text-xs font-mono text-[#FAF7F2] border border-[rgba(214,203,189,0.14)]"
                >
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(f)}
                    className="text-[#D3C7B6] hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] active:scale-[0.98] text-[#141312] font-bold text-sm transition-all shadow-lg shadow-[#C89B3C]/20 mt-2"
          >
            Save Template
          </button>
        </form>
      </BottomSheet>

      <MobileBottomBar />
    </div>
  );
}
