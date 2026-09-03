'use client';

import React from 'react';
import { MeasurementUnit } from '@/lib/db/types';
import { formatMeasurement } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Delete, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface MeasurementInputPadProps {
  fieldName: string;
  fieldIndex: number;
  totalFields: number;
  currentValue: number | string | undefined;
  unit: MeasurementUnit;
  onChange: (val: number | string) => void;
  onPrev: () => void;
  onNext: () => void;
  onClose?: () => void;
}

export function MeasurementInputPad({
  fieldName,
  fieldIndex,
  totalFields,
  currentValue,
  unit,
  onChange,
  onPrev,
  onNext,
  onClose
}: MeasurementInputPadProps) {
  const strVal = currentValue !== undefined && currentValue !== null ? String(currentValue) : '';

  const handleDigit = (digit: string) => {
    if (strVal === '' || strVal === '0') {
      onChange(digit);
    } else {
      onChange(strVal + digit);
    }
  };

  const handleDecimal = () => {
    if (!strVal.includes('.')) {
      onChange(strVal === '' ? '0.' : strVal + '.');
    }
  };

  const handleBackspace = () => {
    if (strVal.length > 0) {
      const next = strVal.slice(0, -1);
      onChange(next === '' ? '' : next);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleQuickAdd = (delta: number) => {
    const num = parseFloat(strVal) || 0;
    const next = Math.max(0, Math.round((num + delta) * 100) / 100);
    onChange(next);
  };

  const handleAddFraction = (frac: number) => {
    const intPart = Math.floor(parseFloat(strVal) || 0);
    const next = intPart + frac;
    onChange(next);
  };

  return (
    <div className="w-full bg-[#1D222A] rounded-2xl border border-[rgba(158,152,143,0.18)] p-4 shadow-2xl flex flex-col gap-3.5 select-none">
      {/* Field Header & Measurement Stepper Navigator */}
      <div className="flex items-center justify-between border-b border-[rgba(158,152,143,0.18)] pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#C89B5C]">
              Point {fieldIndex + 1} of {totalFields}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2E3543] border border-[rgba(158,152,143,0.18)] text-[#F4EFEA] uppercase font-semibold">
              {unit}
            </span>
          </div>
          <h3 className="text-base font-serif font-bold text-[#F4EFEA] truncate max-w-[220px]">
            {fieldName}
          </h3>
        </div>

        {/* Prev / Next Field Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={fieldIndex === 0}
            className="p-2 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] disabled:opacity-30 text-[#F4EFEA] transition-colors"
            title="Previous measurement point"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={fieldIndex >= totalFields - 1}
            className="p-2 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] disabled:opacity-30 text-[#F4EFEA] transition-colors"
            title="Next measurement point"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Measurement Readout Display */}
      <div className="relative w-full bg-[#13161C] border border-[#C89B5C]/60 rounded-xl p-3.5 flex items-center justify-between glow-brass-sm">
        <div className="flex items-baseline gap-2 overflow-x-auto">
          <span className="text-3xl font-mono font-bold text-[#F4EFEA] tracking-tight tnum">
            {strVal ? formatMeasurement(strVal, unit) : '0.00'}
          </span>
          {strVal && unit === 'inches' && (
            <span className="text-xs font-mono text-[#9E988F] hidden sm:inline font-medium">
              ({strVal}&quot;)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {strVal && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-lg bg-[#2E3543] border border-[rgba(158,152,143,0.18)] text-[#9E988F] hover:text-[#F4EFEA] font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Incremental Steppers (+0.25", +0.5", etc.) */}
      <div className="flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={() => handleQuickAdd(-0.5)}
          className="flex-1 py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-xs font-mono font-bold text-[#F4EFEA] transition-transform active:scale-95"
        >
          -0.5
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(-0.25)}
          className="flex-1 py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-xs font-mono font-bold text-[#F4EFEA] transition-transform active:scale-95"
        >
          -0.25
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(0.25)}
          className="flex-1 py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[#C89B5C]/60 text-xs font-mono font-bold text-[#C89B5C] transition-transform active:scale-95"
        >
          +0.25
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(0.5)}
          className="flex-1 py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[#C89B5C]/60 text-xs font-mono font-bold text-[#C89B5C] transition-transform active:scale-95"
        >
          +0.5
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(1.0)}
          className="flex-1 py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[#C89B5C]/60 text-xs font-mono font-bold text-[#C89B5C] transition-transform active:scale-95"
        >
          +1.0
        </button>
      </div>

      {/* Quick Fractional Keypad (for Inches Mode) */}
      {unit === 'inches' && (
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: '¼', val: 0.25 },
            { label: '½', val: 0.5 },
            { label: '¾', val: 0.75 },
            { label: '⅛', val: 0.125 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleAddFraction(item.val)}
              className="py-1.5 rounded-lg bg-[#2E3543] hover:bg-[#384050] border border-[rgba(158,152,143,0.18)] text-xs font-serif font-bold text-[#F4EFEA] transition-colors active:scale-95"
            >
              +{item.label}&quot;
            </button>
          ))}
        </div>
      )}

      {/* Full Numeric Touch Keypad */}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            className="h-12 rounded-xl bg-[#2E3543] hover:bg-[#384050] active:bg-[#C89B5C]/20 border border-[rgba(158,152,143,0.18)] text-xl font-mono font-bold text-[#F4EFEA] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleDecimal}
          className="h-12 rounded-xl bg-[#2E3543] hover:bg-[#384050] active:bg-[#C89B5C]/20 border border-[rgba(158,152,143,0.18)] text-xl font-mono font-bold text-[#F4EFEA] flex items-center justify-center transition-transform active:scale-95"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 rounded-xl bg-[#2E3543] hover:bg-[#384050] active:bg-[#C89B5C]/20 border border-[rgba(158,152,143,0.18)] text-xl font-mono font-bold text-[#F4EFEA] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-xl bg-[#3B2525] hover:bg-[#4A2D2D] border border-red-500/40 text-red-300 flex items-center justify-center transition-transform active:scale-95 font-bold"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation & Next Step Action */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-4 rounded-xl bg-[#C89B5C] hover:bg-[#DFB77B] active:scale-[0.98] text-[#13161C] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89B5C]/20 transition-all"
        >
          <span>{fieldIndex < totalFields - 1 ? 'Save & Next Point' : 'Confirm Measurements'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
