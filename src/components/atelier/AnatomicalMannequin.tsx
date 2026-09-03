'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMeasurement } from '@/lib/utils';
import { MeasurementUnit } from '@/lib/db/types';
import { RotateCw, Sparkles } from 'lucide-react';

interface AnatomicalMannequinProps {
  selectedField: string | null;
  onSelectField: (fieldName: string) => void;
  values: Record<string, number | string>;
  unit: MeasurementUnit;
  gender?: 'menswear' | 'womenswear';
}

interface Pinpoint {
  id: string;
  name: string;
  x: number; // Percentage
  y: number; // Percentage
  aliases: string[];
}

const PINPOINTS_MENSWEAR: Pinpoint[] = [
  { id: 'neck', name: 'Neck Circumference', x: 50, y: 15, aliases: ['neck', 'collar', 'neck circumference'] },
  { id: 'shoulder', name: 'Shoulder Width', x: 26, y: 22, aliases: ['shoulder', 'shoulder width', 'yoke'] },
  { id: 'chest', name: 'Chest (Full)', x: 50, y: 31, aliases: ['chest', 'chest (full)', 'chest circumference', 'bust'] },
  { id: 'bicep', name: 'Bicep', x: 18, y: 34, aliases: ['bicep', 'upper arm', 'bicep circumference'] },
  { id: 'waist', name: 'Waist (Natural)', x: 50, y: 44, aliases: ['waist', 'waist (natural)', 'waist circumference', 'waist (trouser band)'] },
  { id: 'wrist', name: 'Wrist', x: 13, y: 53, aliases: ['wrist', 'cuff', 'sleeve cuff'] },
  { id: 'hips', name: 'Hips (Seat)', x: 50, y: 56, aliases: ['hips', 'seat', 'full hip', 'high hip'] },
  { id: 'sleeve', name: 'Sleeve (Crown to Cuff)', x: 80, y: 39, aliases: ['sleeve', 'sleeve length', 'sleeve (crown to cuff)'] },
  { id: 'thigh', name: 'Thigh', x: 38, y: 67, aliases: ['thigh', 'thigh circumference'] },
  { id: 'inseam', name: 'Trouser Inseam', x: 50, y: 74, aliases: ['trouser inseam', 'inseam'] },
  { id: 'knee', name: 'Knee', x: 62, y: 78, aliases: ['knee', 'knee circumference'] },
  { id: 'ankle', name: 'Trouser Bottom / Cuff', x: 63, y: 91, aliases: ['ankle', 'cuff', 'trouser bottom / cuff', 'trouser leg opening'] }
];

export function AnatomicalMannequin({
  selectedField,
  onSelectField,
  values,
  unit,
  gender = 'menswear'
}: AnatomicalMannequinProps) {
  const [view, setView] = useState<'front' | 'back'>('front');

  // Match field names loosely to pinpoints
  const getFieldValue = (pinpoint: Pinpoint) => {
    for (const [key, val] of Object.entries(values)) {
      const lowerKey = key.toLowerCase();
      if (pinpoint.aliases.some((alias) => lowerKey.includes(alias.toLowerCase()))) {
        return { key, val };
      }
    }
    return null;
  };

  const isPinpointSelected = (pinpoint: Pinpoint) => {
    if (!selectedField) return false;
    const lowerSelected = selectedField.toLowerCase();
    return pinpoint.aliases.some((alias) => lowerSelected.includes(alias.toLowerCase()));
  };

  return (
    <div className="relative w-full max-w-[340px] mx-auto bg-[#1D222A] rounded-2xl border border-[rgba(158,152,143,0.18)] p-4 flex flex-col items-center select-none shadow-2xl backdrop-blur-sm">
      {/* Top Bar with View Switcher */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-[#9E988F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C89B5C]" />
          <span className="font-mono uppercase tracking-wider text-[10px] font-semibold">Interactive Tailor Form</span>
        </div>
        <button
          type="button"
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-[11px] font-mono text-[#F4EFEA] transition-colors"
        >
          <RotateCw className="w-3 h-3 text-[#C89B5C]" />
          <span className="capitalize">{view} View</span>
        </button>
      </div>

      {/* Silhouette Mannequin SVG Container */}
      <div className="relative w-[240px] h-[360px] flex items-center justify-center my-1">
        {/* Atelier Mannequin Tailor Grid Lines */}
        <svg
          viewBox="0 0 200 320"
          className="w-full h-full text-[#9E988F]/25 transition-all duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Atelier Measurement Tape Dotted Guidelines */}
          <line x1="20" y1="99" x2="180" y2="99" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.75" />
          <line x1="30" y1="140" x2="170" y2="140" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.75" />
          <line x1="35" y1="178" x2="165" y2="178" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.75" />
          <line x1="100" y1="30" x2="100" y2="295" stroke="currentColor" strokeDasharray="2 4" strokeWidth="0.5" />

          {/* Haute Couture Mannequin Body Path */}
          <g stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-[#9E988F]/50">
            {/* Head / Neck Stand */}
            <circle cx="100" cy="22" r="7" className="fill-[#13161C] stroke-[#C89B5C]/60" />
            <line x1="100" y1="29" x2="100" y2="44" stroke="#C89B5C]/60" strokeWidth="1.5" />
            <ellipse cx="100" cy="46" rx="14" ry="4" className="fill-[#2E3543] stroke-[#9E988F]/50" />

            {/* Torso Silhouette */}
            <path
              d="
                M 86 46
                C 72 50, 48 62, 42 74
                C 38 82, 34 110, 30 160
                C 30 166, 36 168, 38 162
                C 44 140, 48 116, 52 98
                C 56 122, 60 134, 64 140
                C 68 146, 62 165, 58 178
                C 50 205, 52 250, 56 295
                C 58 298, 76 298, 78 295
                C 84 255, 88 215, 94 185
                C 98 178, 100 178, 100 178
                C 100 178, 102 178, 106 185
                C 112 215, 116 255, 122 295
                C 124 298, 142 298, 144 295
                C 148 250, 150 205, 142 178
                C 138 165, 132 146, 136 140
                C 140 134, 144 122, 148 98
                C 152 116, 156 140, 162 162
                C 164 168, 170 166, 170 160
                C 166 110, 162 82, 158 74
                C 152 62, 128 50, 114 46
                Z
              "
              className="fill-[#13161C]/80"
            />

            {/* Bespoke Tailor Seam Lines (Princess seams / Chest balance) */}
            <path d="M 76 56 Q 74 100 78 140 Q 82 170 80 200" strokeWidth="0.75" strokeDasharray="2 2" className="stroke-[#C89B5C]/40" />
            <path d="M 124 56 Q 126 100 122 140 Q 118 170 120 200" strokeWidth="0.75" strokeDasharray="2 2" className="stroke-[#C89B5C]/40" />
            {/* Wooden Base Stand */}
            <line x1="100" y1="290" x2="100" y2="310" stroke="#C89B5C]/60" strokeWidth="2.5" />
            <ellipse cx="100" cy="312" rx="30" ry="5" className="fill-[#2E3543] stroke-[#C89B5C]/60" />
          </g>
        </svg>

        {/* Interactive Pinpoints Layer */}
        {PINPOINTS_MENSWEAR.map((pinpoint) => {
          const match = getFieldValue(pinpoint);
          const isSelected = isPinpointSelected(pinpoint);
          const hasValue = match?.val !== undefined && match?.val !== '';

          return (
            <div
              key={pinpoint.id}
              style={{ left: `${pinpoint.x}%`, top: `${pinpoint.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <button
                type="button"
                onClick={() => onSelectField(match?.key || pinpoint.name)}
                className={`group relative flex items-center justify-center p-1 rounded-full transition-transform active:scale-95 focus:outline-none`}
                title={`${pinpoint.name}: ${hasValue ? formatMeasurement(match?.val, unit) : 'Not set'}`}
              >
                {/* Outer Glow Pulse for Selected Point */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-full bg-[#C89B5C] animate-ping opacity-60 pointer-events-none" />
                )}

                {/* Pinpoint Dot */}
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#C89B5C] border-[#F4EFEA] scale-125 shadow-lg shadow-[#C89B5C]/50 ring-2 ring-[#C89B5C]/40'
                      : hasValue
                      ? 'bg-[#2E3543] border-[#C89B5C] text-[#C89B5C]'
                      : 'bg-[#1D222A] border-[rgba(158,152,143,0.3)] hover:border-[#C89B5C]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected
                        ? 'bg-[#13161C]'
                        : hasValue
                        ? 'bg-[#C89B5C]'
                        : 'bg-[#9E988F]/50'
                    }`}
                  />
                </span>

                {/* Floating Tabular Number Badge */}
                {hasValue && (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 text-[10px] font-mono font-bold rounded pointer-events-none border transition-colors ${
                      isSelected
                        ? 'bg-[#C89B5C] text-[#13161C] border-[#F4EFEA] shadow-md'
                        : 'bg-[#13161C]/95 text-[#F4EFEA] border-[#C89B5C]/50'
                    }`}
                  >
                    {formatMeasurement(match?.val, unit)}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Measurement Quick Glance Bar */}
      <div className="w-full mt-2 pt-2.5 border-t border-[rgba(158,152,143,0.18)] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono font-semibold text-[#9E988F]">Target Node</span>
          <span className="text-xs font-serif font-bold text-[#F4EFEA] truncate max-w-[170px]">
            {selectedField || 'Tap pinpoint on mannequin'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-mono font-semibold text-[#9E988F]">Value</span>
          <div className="text-sm font-mono font-bold text-[#C89B5C] tnum">
            {selectedField && values[selectedField] !== undefined
              ? formatMeasurement(values[selectedField], unit)
              : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
