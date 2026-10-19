import React from 'react';
import { Pagination, Stack } from '@mui/material';
import type { Num } from './types';
import { formatCurrency, recapCardTheme, type TaxType } from './utils';

export const Spinner: React.FC<{ small?: boolean }> = ({ small }) => (
  <div
    className={`animate-spin rounded-full border-b-2 border-blue-600 ${
      small ? 'h-5 w-5' : 'h-8 w-8'
    }`}
  />
);

export const ButtonSpinner: React.FC = () => (
  <span className="flex items-center justify-center gap-1">
    <svg
      className="animate-spin h-3 w-3"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Processing...
  </span>
);

export const SearchIcon: React.FC = () => (
  <svg
    className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
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
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: { [key: string]: string } = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    requested: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const s = (status || '').toLowerCase();
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        colors[s] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

export const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: { [key: string]: string } = {
    'belum lunas': 'bg-red-100 text-red-800',
    lunas: 'bg-green-100 text-green-800',
    'sebagian lunas': 'bg-yellow-100 text-yellow-800',
  };
  const s = (status || '').toLowerCase();
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        colors[s] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {(status || '-').toUpperCase()}
    </span>
  );
};

export const TaxBadge: React.FC<{ type: TaxType | null }> = ({ type }) => {
  if (!type) return null;
  return (
    <span
      className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
        type === 'tax'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      {type === 'tax' ? 'TAX' : 'NON TAX'}
    </span>
  );
};

export const DueBadge: React.FC<{ description?: string; waktu?: string }> = ({
  description,
  waktu,
}) => {
  if (!description && !waktu) return <span>-</span>;
  const theme = recapCardTheme(waktu ?? '');
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-900">{description || '-'}</span>
      {waktu && (
        <span
          className={`inline-block w-fit text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${theme.chip}`}
        >
          {waktu}
        </span>
      )}
    </div>
  );
};

/* ----------------------------- Recap cards ----------------------------- */

export interface RecapCardItem {
  waktu: string;
  total_invoice: number;
  amount: Num;
  /** extra line, e.g. "2 vendor" */
  extra?: string;
}

export const RecapCards: React.FC<{
  title: string;
  amountLabel: string;
  items: RecapCardItem[];
  activeWaktu: string | null;
  onCardClick: (waktu: string) => void;
}> = ({ title, amountLabel, items, activeWaktu, onCardClick }) => {
  // Hide empty buckets (always keep the active one visible)
  const visible = items.filter(
    (r) => r.total_invoice > 0 || r.waktu === activeWaktu,
  );
  if (visible.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
        {activeWaktu && (
          <button
            onClick={() => onCardClick(activeWaktu)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            ✕ Hapus Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map((item) => {
          const theme = recapCardTheme(item.waktu);
          const isActive = activeWaktu === item.waktu;
          return (
            <button
              key={item.waktu}
              onClick={() => onCardClick(item.waktu)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                theme.bg
              } ${
                isActive ? theme.borderActive : theme.border
              } hover:shadow-md`}
            >
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 capitalize ${theme.chip}`}
              >
                {item.waktu}
              </span>
              <p className={`text-xl font-bold ${theme.text}`}>
                {item.total_invoice.toLocaleString('id-ID')}{' '}
                <span className="text-xs font-medium text-gray-500">
                  invoice
                </span>
              </p>
              {item.extra && (
                <p className="text-xs text-gray-500 mt-0.5">{item.extra}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5 break-words">
                {amountLabel}:{' '}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(item.amount)}
                </span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------ Pagination ------------------------------ */

export const PaginationBar: React.FC<{
  page: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}> = ({ page, totalPages, limit, onPageChange, onLimitChange }) => (
  <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-4">
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-sm text-gray-600">Rows per page:</span>
      <div className="flex gap-2">
        {[10, 25, 50, 100].map((pageSize) => (
          <button
            key={pageSize}
            onClick={() => onLimitChange(pageSize)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              limit === pageSize
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {pageSize}
          </button>
        ))}
      </div>
    </div>

    <Stack spacing={2}>
      <Pagination
        count={totalPages}
        color="primary"
        page={page}
        onChange={(_e, i) => onPageChange(i)}
        size="small"
      />
    </Stack>
  </div>
);

/* ----------------------------- Small helpers ---------------------------- */

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <label className="block text-xs font-medium text-gray-700 mb-1">
    {children}
  </label>
);

export const LabeledValue: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="min-w-0">
    <span className="text-gray-500 text-xs font-medium">{label}</span>
    <div className="text-gray-900 text-xs break-words">{children}</div>
  </div>
);
