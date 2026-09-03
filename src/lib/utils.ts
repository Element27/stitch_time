import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(dateString);
}

// Convert between inches and cm
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 4) / 4; // Round to nearest 0.25 inch
}

// Format fractional inches (e.g., 40.25 -> 40 1/4", 40.5 -> 40 1/2")
export function formatMeasurement(value: number | string | undefined, unit: 'inches' | 'cm'): string {
  if (value === undefined || value === null || value === '') return '—';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return String(value);

  if (unit === 'cm') {
    return `${num.toFixed(1)} cm`;
  }

  const integerPart = Math.floor(num);
  const frac = Math.round((num - integerPart) * 8) / 8;

  let fracStr = '';
  if (Math.abs(frac - 0.125) < 0.01) fracStr = '⅛';
  else if (Math.abs(frac - 0.25) < 0.01) fracStr = '¼';
  else if (Math.abs(frac - 0.375) < 0.01) fracStr = '⅜';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '½';
  else if (Math.abs(frac - 0.625) < 0.01) fracStr = '⅝';
  else if (Math.abs(frac - 0.75) < 0.01) fracStr = '¾';
  else if (Math.abs(frac - 0.875) < 0.01) fracStr = '⅞';
  else if (Math.abs(frac - 1.0) < 0.01) return `${integerPart + 1}"`;

  if (fracStr && integerPart > 0) {
    return `${integerPart}${fracStr}"`;
  } else if (fracStr && integerPart === 0) {
    return `${fracStr}"`;
  }

  return `${num.toFixed(2).replace(/\.00$/, '')}"`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ST';
}
