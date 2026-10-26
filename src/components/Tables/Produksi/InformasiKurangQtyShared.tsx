import React from 'react';

// Dipakai bersama oleh KurangQtyMonitoring (kode 1) dan InformasiKurangQty (kode 2)

export const LIMIT_OPTIONS = [10, 25, 50, 100];

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return '-';
  return iso.split('T')[0];
}

export function toDateInput(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.split('T')[0];
}

export function fmtQty(val: number | null | undefined) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID');
}

export function apiError(err: any, fallback = 'Terjadi kesalahan') {
  return err?.response?.data?.message || err?.message || fallback;
}

// "R700" saja / "R700, R800" kalau JO dicetak di beberapa mesin
export function fmtMesin(dataCetak: any[] | null | undefined) {
  const names = (Array.isArray(dataCetak) ? dataCetak : [])
    .map((m) => m?.nama_mesin_cetak)
    .filter(Boolean);
  return names.length ? Array.from(new Set(names)).join(', ') : '-';
}

// ─── Daftar informasi kurang qty (read-only) ──────────────────────────────────
// items = row.informasi_kurang_qty

export function InformasiKurangQtyList({
  items,
}: {
  items: any[] | undefined;
}) {
  const list = Array.isArray(items)
    ? items.filter((i) => i?.is_active !== false)
    : [];

  return (
    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
      <h4 className="text-xs font-semibold text-amber-800 mb-3">
        Informasi Kurang Qty ({list.length})
      </h4>
      {list.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-4">
          Belum ada informasi kurang qty untuk JO ini
        </p>
      ) : (
        <div className="bg-white rounded-lg border border-amber-200 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-white">
              <tr className="text-left font-semibold text-gray-600 border-b border-gray-200">
                <th className="p-2">#</th>
                <th className="p-2">Mesin Cetak</th>
                <th className="p-2">Tgl Cetak</th>
                <th className="p-2 text-right">Qty PO</th>
                <th className="p-2 text-right">Qty Kurang</th>
                <th className="p-2">Jenis Kerusakan</th>
                <th className="p-2">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {list.map((it, i) => (
                <tr key={it.id ?? i} className="border-b border-amber-100">
                  <td className="p-2 text-gray-500">{i + 1}</td>
                  <td className="p-2 font-semibold text-gray-800 whitespace-nowrap">
                    {it.nama_mesin_cetak || '-'}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {fmtDate(it.tgl_cetak)}
                  </td>
                  <td className="p-2 text-right">{fmtQty(it.qty_po)}</td>
                  <td className="p-2 text-right font-bold text-red-600">
                    {fmtQty(it.qty_kurang)}
                  </td>
                  <td className="p-2 text-gray-700">
                    {it.jenis_kerusakan || '-'}
                  </td>
                  <td className="p-2 text-gray-500">{it.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Modal konfirmasi ─────────────────────────────────────────────────────────

export function ConfirmModal({
  title,
  message,
  confirmText = 'Hapus',
  loading = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const btn =
  'px-3 py-1.5 rounded-lg text-xs font-medium border bg-white border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export function Pagination({
  page,
  limit,
  totalData,
  totalPage,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  totalData: number;
  totalPage: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}) {
  const from = totalData === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalData);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-t bg-gray-50">
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>Tampilkan</span>
        <select
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
          className="rounded-lg bg-white border border-gray-300 px-2 py-1 text-xs"
        >
          {LIMIT_OPTIONS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <span>
          {from}–{to} dari {totalData}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button className={btn} disabled={page <= 1} onClick={() => onPage(1)}>
          «
        </button>
        <button
          className={btn}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Sebelumnya
        </button>
        <span className="text-xs text-gray-600 px-2">
          {page} / {totalPage}
        </span>
        <button
          className={btn}
          disabled={page >= totalPage}
          onClick={() => onPage(page + 1)}
        >
          Berikutnya
        </button>
        <button
          className={btn}
          disabled={page >= totalPage}
          onClick={() => onPage(totalPage)}
        >
          »
        </button>
      </div>
    </div>
  );
}
