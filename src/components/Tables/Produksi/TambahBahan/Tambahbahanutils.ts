import { JOData, JOMounting } from './types/Tambahbahan.types';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text?: string | null, maxLength = 30): string => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'request qc':
      return 'bg-yellow-100 text-yellow-800';
    case 'request qc pemakaian':
      return 'bg-indigo-100 text-indigo-800';
    case 'approve qc':
      return 'bg-blue-100 text-blue-800';
    case 'approve gudang':
      return 'bg-teal-100 text-teal-800';
    case 'reject qc':
    case 'reject gudang':
      return 'bg-red-100 text-red-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const statusLabel = (status?: string): string =>
  status ? status.toUpperCase() : '-';

export const getSelectedMounting = (jo: JOData | null): JOMounting | null => {
  if (!jo || !jo.jo_mounting || jo.jo_mounting.length === 0) return null;
  return jo.jo_mounting.find((m) => m.is_selected) || jo.jo_mounting[0];
};

// isi = ukuran_cetak_isi_1 + ukuran_cetak_isi_2 from the selected mounting's
// io_mounting. Kept around in case it's still used for display elsewhere,
// but it is NO LONGER the LP<->Druk conversion factor (see getBagianFromMounting).
export const getIsiFromMounting = (mounting: JOMounting | null): number => {
  return (
    (mounting?.ukuran_cetak_isi_1 || 0) + (mounting?.ukuran_cetak_isi_2 || 0)
  );
};

// bagian = ukuran_cetak_bagian_1 + ukuran_cetak_bagian_2, sitting at the same
// level as ukuran_cetak_isi_1/2 on the selected mounting. This is the DEFAULT
// LP<->Druk conversion factor. Forms show bagian_1 as "A" and bagian_2 as "B"
// and let the user override the total before it's used for conversion.
export const getBagianFromMounting = (mounting: JOMounting | null): number => {
  return (
    (mounting?.ukuran_cetak_bagian_1 || 0) +
    (mounting?.ukuran_cetak_bagian_2 || 0)
  );
};

// `factor` is whatever conversion value the caller decides to use (now:
// the editable "bagian" value, defaulted from getBagianFromMounting).
export const lpToDruk = (lp: number, factor: number): number =>
  factor > 0 ? Math.round(lp * factor) : 0;

export const drukToLp = (druk: number, factor: number): number =>
  factor > 0 ? Math.round(druk / factor) : 0;
