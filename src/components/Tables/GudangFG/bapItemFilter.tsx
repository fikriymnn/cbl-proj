// bapItemFilter.tsx
// Shared search + status filter used by every BAP detail/review modal.
// Place this file next to bapHelpers.ts.

import { useMemo, useState } from 'react';
import { BapItem } from './types/BapTypes';

export interface StatusFilterOption {
  value: string;
  label: string;
  match: (item: BapItem) => boolean;
}

const norm = (s?: string | null) => (s ?? '').toLowerCase();

const statusIs =
  (status: string) =>
  (item: BapItem): boolean =>
    norm(item.status) === status;

// Default options — raw item.status values used across the BAP flow
export const ITEM_STATUS_OPTIONS: StatusFilterOption[] = [
  { value: '', label: 'Semua Status', match: () => true },
  { value: 'incoming', label: 'Menunggu', match: statusIs('incoming') },
  {
    value: 'approve marketing',
    label: 'Disetujui Marketing',
    match: statusIs('approve marketing'),
  },
  { value: 'approve', label: 'Disetujui', match: statusIs('approve') },
  { value: 'reject', label: 'Ditolak', match: statusIs('reject') },
];

export function matchesSearch(item: BapItem, query: string): boolean {
  const haystack = [
    item.no_io,
    item.no_jo,
    item.produk,
    item.customer,
    item.note,
  ]
    .map((v) => norm(v as string | null | undefined))
    .join(' ');
  return haystack.includes(query);
}

export function useBapItemFilter(
  items: BapItem[],
  statusOptions: StatusFilterOption[] = ITEM_STATUS_OPTIONS,
) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    const opt = statusOptions.find((o) => o.value === status);
    const q = search.trim().toLowerCase();
    return items.filter(
      (it) => (!opt || opt.match(it)) && (!q || matchesSearch(it, q)),
    );
  }, [items, search, status, statusOptions]);

  const isFiltering = search.trim() !== '' || status !== '';

  function reset() {
    setSearch('');
    setStatus('');
  }

  return {
    search,
    setSearch,
    status,
    setStatus,
    filtered,
    isFiltering,
    reset,
    statusOptions,
  };
}

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  statusOptions: StatusFilterOption[];
  shown: number;
  total: number;
  isFiltering: boolean;
  onReset: () => void;
}

export function BapItemFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions,
  shown,
  total,
  isFiltering,
  onReset,
}: FilterBarProps) {
  return (
    <div className="px-5 py-3 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 border-b border-gray-100">
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari No IO, No JO, produk, customer, catatan..."
          className="w-full pl-8 pr-8 py-1.5 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
        />
        <svg
          className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1.5 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {statusOptions.length > 1 && (
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="sm:w-48 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-gray-400 whitespace-nowrap">
          {shown} dari {total} item
        </span>
        {isFiltering && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-900 whitespace-nowrap"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
