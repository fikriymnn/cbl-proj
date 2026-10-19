import type { Num } from './types';

export const API = import.meta.env.VITE_API_LINK;

/* ----------------------------------------------------------------------------
 * Numbers
 * ------------------------------------------------------------------------- */

export const toNum = (value: Num): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const formatCurrency = (value: Num): string =>
  `Rp ${toNum(value).toLocaleString('id-ID')}`;

/** Whole-rupiah display (rounded) */
export const formatRupiahInt = (n: number): string =>
  Math.round(n).toLocaleString('id-ID');

/** Quantities can be fractional (0.5 kg) so keep up to 4 decimals */
export const formatQty = (value: Num): string =>
  toNum(value).toLocaleString('id-ID', { maximumFractionDigits: 4 });

/* ----------------------------------------------------------------------------
 * Dates (local time, no UTC shifting)
 * ------------------------------------------------------------------------- */

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})/;

export const toInputDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayInputDate = (): string => toInputDate(new Date());

/** API date ("2026-10-19T00:00:00.000Z") -> "YYYY-MM-DD" for <input type=date> */
export const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const m = ISO_DATE_PREFIX.exec(dateString);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? '' : toInputDate(date);
};

/** API date -> "dd/mm/yyyy" */
export const formatDate = (dateString: string | null | undefined): string => {
  const input = formatDateForInput(dateString);
  if (!input) return '-';
  const [y, m, d] = input.split('-');
  return `${d}/${m}/${y}`;
};

/** "YYYY-MM-DD" + N days -> "YYYY-MM-DD" (safe across month ends) */
export const addDaysToInputDate = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '';
  return toInputDate(new Date(y, m - 1, d + days));
};

export const diffDays = (from: string, to: string): number | null => {
  const a = formatDateForInput(from);
  const b = formatDateForInput(to);
  if (!a || !b) return null;
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  const ms = Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1);
  return Math.round(ms / 86400000);
};

/* ----------------------------------------------------------------------------
 * Tax / non tax — decided from the invoice number format
 *   TAX     : PI00001/CBL/10/26
 *   NON TAX : PI50001-1026
 * ------------------------------------------------------------------------- */

export type TaxType = 'tax' | 'non_tax';

const TAX_FORMAT = /^PI\d+\/[A-Za-z]+\/\d{2}\/\d{2}$/i;
const NON_TAX_FORMAT = /^PI\d+-\d{4}$/i;

export const getInvoiceTaxType = (
  noInvoice?: string | null,
): TaxType | null => {
  const no = (noInvoice || '').trim();
  if (!no) return null;
  if (TAX_FORMAT.test(no)) return 'tax';
  if (NON_TAX_FORMAT.test(no)) return 'non_tax';
  return null;
};

/** Format wins; fall back to the `is_tax` flag when the format is unknown */
export const resolveInvoiceTax = (inv: {
  no_invoice?: string | null;
  is_tax?: boolean;
}): boolean => {
  const byFormat = getInvoiceTaxType(inv.no_invoice);
  if (byFormat) return byFormat === 'tax';
  return !!inv.is_tax;
};

/* ----------------------------------------------------------------------------
 * Amount helper — one formula for DPP / PPN (same as the AR module)
 *   TAX     : dpp = 11/12 * total, pajak = dpp * 12%
 *   NON TAX : pajak = 0, dpp = total
 * ------------------------------------------------------------------------- */

export const computeAmounts = (
  qty: number,
  harga: number,
  diskon: number,
  isTax: boolean,
) => {
  const total = qty * harga - diskon;
  if (!isTax) return { total, dpp: total, pajak: 0 };
  const dpp = (11 / 12) * total;
  const pajak = dpp * 0.12;
  return { total, dpp, pajak };
};

/* ----------------------------------------------------------------------------
 * Due-date bucket theme (`waktu`)
 * ------------------------------------------------------------------------- */

export function recapCardTheme(waktu: string) {
  const w = (waktu || '').toLowerCase();
  if (w === 'lewat jatuh tempo')
    return {
      border: 'border-red-200',
      borderActive: 'border-red-500 ring-2 ring-red-200',
      bg: 'bg-red-50',
      text: 'text-red-700',
      chip: 'bg-red-100 text-red-700',
    };
  if (w === 'jatuh tempo hari ini')
    return {
      border: 'border-orange-200',
      borderActive: 'border-orange-500 ring-2 ring-orange-200',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      chip: 'bg-orange-100 text-orange-700',
    };
  if (w.startsWith('1-30'))
    return {
      border: 'border-amber-200',
      borderActive: 'border-amber-500 ring-2 ring-amber-200',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      chip: 'bg-amber-100 text-amber-700',
    };
  if (w.startsWith('31-60'))
    return {
      border: 'border-blue-200',
      borderActive: 'border-blue-500 ring-2 ring-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      chip: 'bg-blue-100 text-blue-700',
    };
  if (w.startsWith('61-90'))
    return {
      border: 'border-indigo-200',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-200',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      chip: 'bg-indigo-100 text-indigo-700',
    };
  if (w.startsWith('lebih dari 90'))
    return {
      border: 'border-green-200',
      borderActive: 'border-green-500 ring-2 ring-green-200',
      bg: 'bg-green-50',
      text: 'text-green-700',
      chip: 'bg-green-100 text-green-700',
    };
  return {
    border: 'border-gray-200',
    borderActive: 'border-gray-500 ring-2 ring-gray-200',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    chip: 'bg-gray-100 text-gray-600',
  };
}

export const dueTextClass = (days: number | null): string => {
  if (days === null || days === undefined) return 'text-gray-500';
  if (days < 0) return 'text-red-600 font-semibold';
  if (days === 0) return 'text-orange-600 font-semibold';
  return 'text-gray-700';
};

export const errorMessage = (error: unknown): string => {
  const e = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message || e?.message || 'Unknown error';
};
