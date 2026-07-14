import { StatusPO } from './Purchasing.types';

// Display label + badge color for every possible `status` value coming back
// from the API. `status_tiket` (draft / request kabag / request finance /
// proses) only controls *which page* a PO shows up on — `status` is the
// more granular value actually shown to the user (e.g. a PO can sit in the
// "draft" tiket because it was rejected, and `status` is what explains why).
export const STATUS_LABELS: Record<StatusPO, string> = {
  draft: 'Draft',
  'request kabag': 'Menunggu Approval Kabag',
  'request finance': 'Menunggu Approval Finance',
  'reject kabag': 'Ditolak Kabag',
  'reject finance': 'Ditolak Finance',
  proses: 'Proses',
};

export const STATUS_COLORS: Record<StatusPO, string> = {
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  'request kabag': 'bg-amber-50 text-amber-700 ring-amber-100',
  'request finance': 'bg-blue-50 text-blue-700 ring-blue-100',
  'reject kabag': 'bg-red-50 text-red-700 ring-red-100',
  'reject finance': 'bg-red-50 text-red-700 ring-red-100',
  proses: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export const getStatusLabel = (status?: string): string =>
  (status && STATUS_LABELS[status as StatusPO]) || status || '-';

export const getStatusColor = (status?: string): string =>
  (status && STATUS_COLORS[status as StatusPO]) ||
  'bg-slate-100 text-slate-600 ring-slate-200';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatRupiah = (value: number): string =>
  (value || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
