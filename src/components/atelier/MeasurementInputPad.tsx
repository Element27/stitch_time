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
    <div className="w-full bg-[#181715] rounded-2xl border border-[rgba(214,203,189,0.14)] p-4 shadow-2xl flex flex-col gap-3.5 select-none">
      {/* Field Header & Measurement Stepper Navigator */}
      <div className="flex items-center justify-between border-b border-[rgba(214,203,189,0.1)] pb-2.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#C89B3C]">
              Point {fieldIndex + 1} of {totalFields}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#242220] text-[#9E948A] uppercase">
              {unit}
            </span>
          </div>
          <h3 className="text-base font-serif font-semibold text-[#FAF7F2] truncate max-w-[220px]">
            {fieldName}
          </h3>
        </div>

        {/* Prev / Next Field Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={fieldIndex === 0}
            className="p-2 rounded-lg bg-[#242220] hover:bg-[#2E2B27] disabled:opacity-30 text-[#FAF7F2] transition-colors"
            title="Previous measurement point"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={fieldIndex >= totalFields - 1}
            className="p-2 rounded-lg bg-[#242220] hover:bg-[#2E2B27] disabled:opacity-30 text-[#FAF7F2] transition-colors"
            title="Next measurement point"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Measurement Readout Display */}
      <div className="relative w-full bg-[#141312] border border-[#C89B3C]/30 rounded-xl p-3 flex items-center justify-between glow-brass-sm">
        <div className="flex items-baseline gap-2 overflow-x-auto">
          <span className="text-3xl font-mono font-bold text-[#FAF7F2] tracking-tight tnum">
            {strVal ? formatMeasurement(strVal, unit) : '0.00'}
          </span>
          {strVal && unit === 'inches' && (
            <span className="text-xs font-mono text-[#9E948A] hidden sm:inline">
              ({strVal}&quot;)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {strVal && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-mono uppercase px-2 py-1 rounded bg-[#242220] text-[#9E948A] hover:text-[#FAF7F2]"
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
          className="flex-1 py-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.1)] text-xs font-mono font-medium text-[#FAF7F2] transition-transform active:scale-95"
        >
          -0.5
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(-0.25)}
          className="flex-1 py-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[rgba(214,203,189,0.1)] text-xs font-mono font-medium text-[#FAF7F2] transition-transform active:scale-95"
        >
          -0.25
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(0.25)}
          className="flex-1 py-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[#C89B3C]/30 text-xs font-mono font-medium text-[#E0BA62] transition-transform active:scale-95"
        >
          +0.25
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(0.5)}
          className="flex-1 py-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[#C89B3C]/30 text-xs font-mono font-medium text-[#E0BA62] transition-transform active:scale-95"
        >
          +0.5
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(1.0)}
          className="flex-1 py-1.5 rounded-lg bg-[#242220] hover:bg-[#2E2B27] border border-[#C89B3C]/30 text-xs font-mono font-medium text-[#E0BA62] transition-transform active:scale-95"
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
              className="py-1.5 rounded-lg bg-[#1E1D1B] hover:bg-[#272523] border border-[rgba(214,203,189,0.1)] text-xs font-serif font-bold text-[#E5DCD0] transition-colors active:scale-95"
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
            className="h-12 rounded-xl bg-[#242220] hover:bg-[#2E2B27] active:bg-[#C89B3C]/20 border border-[rgba(214,203,189,0.12)] text-xl font-mono font-medium text-[#FAF7F2] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={handleDecimal}
          className="h-12 rounded-xl bg-[#1E1D1B] hover:bg-[#272523] active:bg-[#C89B3C]/20 border border-[rgba(214,203,189,0.12)] text-xl font-mono font-bold text-[#9E948A] flex items-center justify-center transition-transform active:scale-95"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 rounded-xl bg-[#242220] hover:bg-[#2E2B27] active:bg-[#C89B3C]/20 border border-[rgba(214,203,189,0.12)] text-xl font-mono font-medium text-[#FAF7F2] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-12 rounded-xl bg-[#2A1E1E] hover:bg-[#382626] border border-red-500/20 text-red-300 flex items-center justify-center transition-transform active:scale-95"
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
          className="flex-1 py-3 px-4 rounded-xl bg-[#C89B3C] hover:bg-[#D4A373] active:scale-[0.98] text-[#141312] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#C89B3C]/20 transition-all"
        >
          <span>{fieldIndex < totalFields - 1 ? 'Save & Next Point' : 'Confirm Measurements'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
