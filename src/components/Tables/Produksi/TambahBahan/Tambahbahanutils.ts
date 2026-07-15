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

// Badge color shared by SPV / QC / PPIC / RM tables so status always looks
// the same no matter which page you're on.
export const getStatusColor = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'request qc':
      return 'bg-yellow-100 text-yellow-800';
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

// Pull the id_kertas / nama_kertas the JO is actually using, so forms never
// let the user edit it directly - it's always derived from the JO data.
export const getSelectedMounting = (jo: JOData | null): JOMounting | null => {
  if (!jo || !jo.jo_mounting || jo.jo_mounting.length === 0) return null;
  return jo.jo_mounting.find((m) => m.is_selected) || jo.jo_mounting[0];
};
