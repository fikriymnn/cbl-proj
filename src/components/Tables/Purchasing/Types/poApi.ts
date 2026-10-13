import axios from 'axios';

// 'po'      -> PO biasa   : /purchasing/purchaseOrder
// 'booking' -> PO Booking : /purchasing/purchaseOrderBooking
//
// Kedua resource punya bentuk endpoint yang sama (request / approveKabag /
// rejectKabag / approveFinance / rejectFinance /:id), jadi halaman list &
// approval cukup menerima prop `kind` dan memakai poBaseUrl(kind).
export type POKind = 'po' | 'booking';

export const poBaseUrl = (kind: POKind = 'po'): string =>
  `${import.meta.env.VITE_API_LINK}/purchasing/${
    kind === 'booking' ? 'purchaseOrderBooking' : 'purchaseOrder'
  }`;

// Backend mengirim alasan penolakan di `message` (mis. "qty booking ...
// melebihi qty tersedia"). Tampilkan apa adanya ke user.
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)
      ?.message;
    if (msg) return msg;
  }
  return fallback;
};
