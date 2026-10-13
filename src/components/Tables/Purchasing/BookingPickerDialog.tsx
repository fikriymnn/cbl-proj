import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

// Dipakai CreatePOModal & EditPOModal (PO biasa) untuk tombol
// "Ambil dari PO Booking" di tiap baris items_jo.
//
// GET {VITE_API_LINK}/purchasing/purchaseOrderBookingItem/available
//     params: { id_item, search }
// Hanya mengembalikan item booking yang PO-nya sudah approve finance dan
// qty_terkirim - qty_pakai > 0.

export interface AvailableBookingItem {
  id: number;
  id_purchase_order_booking: number;
  id_item: number;
  nama_item: string;
  qty_beli: number;
  qty_terkirim: number;
  qty_pakai: number;
  qty_tersedia: number;
  purchase_order_booking?: {
    id: number;
    no_purchase_order: string;
    nama_vendor?: string;
    tgl_po?: string;
    tgl_kirim?: string;
  };
}

// Hasil pilihan yang dikirim balik ke modal pemanggil.
export interface BookingPick {
  id: number; // id_purchase_order_booking_item
  no_po: string;
  max: number; // batas maksimal qty_booking untuk item ini
}

type Props = {
  open: boolean;
  idItem: number;
  namaItem: string;
  // Mode edit: qty_booking lama PO ini per id item booking. Endpoint
  // available belum menghitung qty yang sedang dipakai PO ini sendiri, jadi
  // batas = qty_tersedia + qty lama (aturan 5.4 poin 2 di dokumen flow).
  previousQty?: Map<number, number>;
  // Mode edit: pilihan yang sudah tersimpan tapi tidak muncul di list
  // available (qty_tersedia = 0 karena semuanya dipakai PO ini).
  extraItems?: AvailableBookingItem[];
  onClose: () => void;
  onPick: (pick: BookingPick) => void;
};

const fmt = (n: number): string =>
  (n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });

const BookingPickerDialog: React.FC<Props> = ({
  open,
  idItem,
  namaItem,
  previousQty,
  extraItems,
  onClose,
  onPick,
}) => {
  const [items, setItems] = useState<AvailableBookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');

  const fetchAvailable = async (search?: string) => {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/purchasing/purchaseOrderBookingItem/available`;
    try {
      setLoading(true);
      const res = await axios.get<{ data: AvailableBookingItem[] }>(url, {
        params: { id_item: idItem, search: search || undefined },
        withCredentials: true,
      });
      console.log('Available booking items:', res.data.data);
      setItems(res.data.data || []);
    } catch (err) {
      console.error('Error fetching available booking items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSearchInput('');
      fetchAvailable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idItem]);

  const rows = useMemo(() => {
    const merged = [...items];
    (extraItems || [])
      .filter((e) => e.id_item === idItem && !merged.some((m) => m.id === e.id))
      .forEach((e) => merged.push(e));
    return merged
      .map((it) => ({
        it,
        max: (it.qty_tersedia || 0) + (previousQty?.get(it.id) || 0),
      }))
      .filter((r) => r.max > 0);
  }, [items, extraItems, idItem, previousQty]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Ambil dari PO Booking
        <span className="block text-xs font-normal text-slate-400 mt-0.5">
          {namaItem}
        </span>
      </DialogTitle>
      <DialogContent>
        <div className="flex gap-2 mb-3 mt-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAvailable(searchInput)}
            placeholder="Cari no PO booking / vendor..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => fetchAvailable(searchInput)}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cari
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-10">
            Tidak ada stok PO Booking yang tersedia untuk item ini.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto -mx-1">
            {rows.map(({ it, max }) => (
              <button
                key={it.id}
                onClick={() =>
                  onPick({
                    id: it.id,
                    no_po:
                      it.purchase_order_booking?.no_purchase_order ||
                      `#${it.id_purchase_order_booking}`,
                    max,
                  })
                }
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {it.purchase_order_booking?.no_purchase_order ||
                      `PO Booking #${it.id_purchase_order_booking}`}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {it.purchase_order_booking?.nama_vendor || '-'} · Terkirim{' '}
                    {fmt(it.qty_terkirim)} · Terpakai {fmt(it.qty_pakai)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold text-emerald-700 tabular-nums">
                    {fmt(max)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    tersedia
                    {previousQty?.get(it.id) ? ' (incl. PO ini)' : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingPickerDialog;
