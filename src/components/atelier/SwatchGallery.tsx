'use client';

import React, { useState } from 'react';
import { FabricSwatch } from '@/lib/db/types';
import { SAMPLE_SWATCHES } from '@/lib/db/seed';
import { Plus, Check, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface SwatchGalleryProps {
  selectedSwatches?: string[];
  onToggleSwatch?: (swatchUrl: string) => void;
  allowCustomUpload?: boolean;
}

export function SwatchGallery({
  selectedSwatches = [],
  onToggleSwatch,
  allowCustomUpload = true
}: SwatchGalleryProps) {
  const [swatches, setSwatches] = useState<FabricSwatch[]>(SAMPLE_SWATCHES);
  const [newSwatchName, setNewSwatchName] = useState('');
  const [newSwatchMill, setNewSwatchMill] = useState('');
  const [newSwatchComposition, setNewSwatchComposition] = useState('');
  const [newSwatchUrl, setNewSwatchUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSwatchName) return;

    const newSwatch: FabricSwatch = {
      id: `swatch_${Date.now()}`,
      name: newSwatchName,
      mill_name: newSwatchMill || 'Private Atelier Mill',
      composition: newSwatchComposition || '100% Bespoke Textile',
      image_url: newSwatchUrl || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      pattern: 'Solid'
    };

    setSwatches([newSwatch, ...swatches]);
    if (onToggleSwatch && newSwatch.image_url) {
      onToggleSwatch(newSwatch.image_url);
    }
    setNewSwatchName('');
    setNewSwatchMill('');
    setNewSwatchComposition('');
    setNewSwatchUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C89B3C]" />
          <h4 className="text-sm font-serif font-bold text-[#FAF7F2]">
            Atelier Fabric Swatches & Mill Archives
          </h4>
        </div>
        {allowCustomUpload && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.1)] text-xs font-mono text-[#FAF7F2] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Add Swatch</span>
          </button>
        )}
      </div>

      {/* Add Custom Swatch Form Modal/Inline */}
      {showAddForm && (
        <form
          onSubmit={handleAddCustom}
          className="p-3.5 rounded-xl bg-[#141312] border border-[#C89B3C]/30 flex flex-col gap-2.5 glow-brass-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#E0BA62] uppercase">
              Register New Cloth / Swatch
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[#9E948A] hover:text-[#FAF7F2]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Fabric name (e.g., Midnight Barathea)"
              value={newSwatchName}
              onChange={(e) => setNewSwatchName(e.target.value)}
              className="bg-[#242220] border border-[rgba(214,203,189,0.12)] rounded-lg px-2.5 py-1.5 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Mill (e.g., Scabal, Loro Piana)"
              value={newSwatchMill}
              onChange={(e) => setNewSwatchMill(e.target.value)}
              className="bg-[#242220] border border-[rgba(214,203,189,0.12)] rounded-lg px-2.5 py-1.5 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <input
              type="text"
              placeholder="Composition (e.g., Super 150s Wool)"
              value={newSwatchComposition}
              onChange={(e) => setNewSwatchComposition(e.target.value)}
              className="bg-[#242220] border border-[rgba(214,203,189,0.12)] rounded-lg px-2.5 py-1.5 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
            <input
              type="url"
              placeholder="Image URL or photo link"
              value={newSwatchUrl}
              onChange={(e) => setNewSwatchUrl(e.target.value)}
              className="bg-[#242220] border border-[rgba(214,203,189,0.12)] rounded-lg px-2.5 py-1.5 text-[#FAF7F2] focus:border-[#C89B3C] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold text-xs transition-colors"
          >
            Save Fabric to Archive
          </button>
        </form>
      )}

      {/* Swatch Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {swatches.map((swatch) => {
          const isSelected = swatch.image_url ? selectedSwatches.includes(swatch.image_url) : false;

          return (
            <div
              key={swatch.id}
              onClick={() => onToggleSwatch && swatch.image_url && onToggleSwatch(swatch.image_url)}
              className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer group flex flex-col bg-[#1E1D1B] ${
                isSelected
                  ? 'border-[#C89B3C] ring-2 ring-[#C89B3C]/40 shadow-lg'
                  : 'border-[rgba(214,203,189,0.12)] hover:border-[rgba(214,203,189,0.3)]'
              }`}
            >
              {/* Swatch Image Preview */}
              <div className="relative h-28 w-full bg-[#242220] overflow-hidden">
                {swatch.image_url ? (
                  <img
                    src={swatch.image_url}
                    alt={swatch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#9E948A]">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                {/* Selection Checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C89B3C] text-[#141312] flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Weight Tag */}
                {swatch.weight_gsm && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-[#FAF7F2]">
                    {swatch.weight_gsm}
                  </div>
                )}
              </div>

              {/* Swatch Details */}
              <div className="p-2.5 flex flex-col gap-0.5">
                <span className="text-[10px] font-mono uppercase text-[#C89B3C] truncate">
                  {swatch.mill_name || 'Atelier Weave'}
                </span>
                <h5 className="text-xs font-serif font-bold text-[#FAF7F2] truncate">
                  {swatch.name}
                </h5>
                {swatch.composition && (
                  <p className="text-[10px] text-[#9E948A] line-clamp-1">
                    {swatch.composition}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
