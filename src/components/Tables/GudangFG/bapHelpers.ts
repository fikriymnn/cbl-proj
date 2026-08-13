// bapHelpers.ts
// Shared formatters / badge helpers for all BAP flow components

export function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

export function fmtCurrency(val: number | null | undefined) {
  if (val == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val);
}

export function fmtDateTime(val: string | null | undefined) {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Badge classes for the BAP ticket-level status (top-level record) */
export function bapStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'done' || s === 'selesai') return 'bg-blue-100 text-blue-700';
  if (s === 'incoming') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

/** Badge classes for a bap_item's FINAL (management) status */
export function itemStatusBadgeClass(
  status: string | null | undefined,
): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'approve') return 'bg-green-100 text-green-700';
  if (s === 'reject') return 'bg-red-100 text-red-600';
  if (s === 'incoming') return 'bg-amber-100 text-amber-700';
  return 'bg-gray-100 text-gray-600';
}

export function itemStatusLabel(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'approve') return 'Disetujui';
  if (s === 'reject') return 'Ditolak';
  if (s === 'incoming') return 'Menunggu';
  return status || '-';
}

/** Whether an item has already been pre-approved by marketing (stage 1) */
export function isMarketingApproved(item: {
  id_user_approve_marketing?: number | null;
}) {
  return item.id_user_approve_marketing != null;
}
