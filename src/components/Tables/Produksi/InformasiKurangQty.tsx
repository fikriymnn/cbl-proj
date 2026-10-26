import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';
import {
  ConfirmModal,
  InformasiKurangQtyList,
  Pagination,
  apiError,
  fmtDate,
  fmtMesin,
  fmtQty,
  toDateInput,
} from './InformasiKurangQtyShared';

// Tab 1 "Buat Informasi"
//   GET  /ppic/joMonitoringKurangQty  → daftar JO (sama seperti KurangQtyMonitoring)
//   POST /informasiKurangQty          → simpan informasi kurang qty
// Tab 2 "Daftar Informasi"
//   GET    /informasiKurangQty        → params: limit, page, search, id_produk, start_date, end_date
//   PUT    /informasiKurangQty/:id    → ubah
//   DELETE /informasiKurangQty/:id    → hapus (dengan modal konfirmasi)
//
// Asumsi response GET /informasiKurangQty: { data: [...], total_data, total_page }
// dan tiap item punya field yang sama dengan informasi_kurang_qty[] (id, no_jo, nama_produk, dst).

const API = import.meta.env.VITE_API_LINK;

type Notify = (type: 'success' | 'error', text: string) => void;

const inputCls =
  'w-full rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all disabled:opacity-60';
const readonlyCls =
  'w-full rounded-lg bg-gray-100 border border-gray-200 px-3 py-2 text-xs sm:text-sm text-gray-700';
const th = 'p-2 sm:p-3 whitespace-nowrap';

// ─── Form fields dipakai create & edit ────────────────────────────────────────

type FormState = {
  id_mesin_cetak: string;
  nama_mesin_cetak: string;
  tgl_cetak: string;
  qty_kurang: string;
  jenis_kerusakan: string;
  note: string;
};

function validate(f: FormState): string {
  if (!f.id_mesin_cetak) return 'Mesin cetak wajib dipilih';
  if (!f.tgl_cetak) return 'Tanggal cetak wajib diisi';
  const q = Number(f.qty_kurang);
  if (!f.qty_kurang || Number.isNaN(q) || q <= 0)
    return 'Qty kurang harus lebih dari 0';
  if (!f.jenis_kerusakan.trim()) return 'Jenis kerusakan wajib diisi';
  return '';
}

function FormFields({
  form,
  setForm,
  machines,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  machines: any[];
}) {
  const set = (k: keyof FormState, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onMesin = (idStr: string) => {
    const m = machines.find((x) => String(x.id_mesin_cetak) === idStr);
    setForm((p) => ({
      ...p,
      id_mesin_cetak: idStr,
      nama_mesin_cetak: m?.nama_mesin_cetak ?? '',
      // tanggal cetak ikut mesin yang dipilih, tetap bisa diubah manual
      tgl_cetak: m?.tgl_cetak ? toDateInput(m.tgl_cetak) : p.tgl_cetak,
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-600 font-medium">Mesin Cetak</label>
        <select
          value={form.id_mesin_cetak}
          onChange={(e) => onMesin(e.target.value)}
          className={inputCls}
        >
          <option value="">Pilih mesin...</option>
          {machines.map((m) => (
            <option key={m.id_mesin_cetak} value={m.id_mesin_cetak}>
              {m.nama_mesin_cetak}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-600 font-medium">
          Tanggal Cetak
        </label>
        <input
          type="date"
          value={form.tgl_cetak}
          onChange={(e) => set('tgl_cetak', e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-600 font-medium">Qty Kurang</label>
        <input
          type="number"
          min={1}
          value={form.qty_kurang}
          onChange={(e) => set('qty_kurang', e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-600 font-medium">
          Jenis Kerusakan
        </label>
        <input
          type="text"
          value={form.jenis_kerusakan}
          onChange={(e) => set('jenis_kerusakan', e.target.value)}
          placeholder="Contoh: Pisau tidak turun"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <label className="text-xs text-gray-600 font-medium">Catatan</label>
        <textarea
          rows={3}
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {subtitle && (
              <p className="text-violet-200 text-xs mt-0.5 truncate max-w-md">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-violet-200 text-2xl font-bold leading-none ml-4"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4">{children}</div>
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2 flex-shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-600 font-medium">{label}</label>
      <div className={readonlyCls}>{value || '-'}</div>
    </div>
  );
}

// ─── Modal Buat ───────────────────────────────────────────────────────────────

function CreateModal({
  row,
  onClose,
  onSaved,
  notify,
}: {
  row: any;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const machines: any[] = Array.isArray(row.data_cetak) ? row.data_cetak : [];
  const src = row.form_informasi_kurang_qty ?? {};

  // default: mesin dari form_informasi_kurang_qty, kalau tidak ada pakai mesin pertama
  const initMesin =
    machines.find((m) => m.id_mesin_cetak === src.id_mesin_cetak) ??
    machines[0];

  const [form, setForm] = useState<FormState>({
    id_mesin_cetak: String(
      initMesin?.id_mesin_cetak ?? src.id_mesin_cetak ?? '',
    ),
    nama_mesin_cetak: initMesin?.nama_mesin_cetak ?? src.nama_mesin_cetak ?? '',
    tgl_cetak: toDateInput(src.tgl_cetak ?? initMesin?.tgl_cetak),
    qty_kurang: String(src.qty_kurang ?? row.kurang_qty ?? ''),
    jenis_kerusakan: src.jenis_kerusakan ?? row.jenis_kerusakan ?? '',
    note: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const qtyPo = src.qty_po ?? row.po_qty ?? row.qty_jo;

  const handleSave = async () => {
    const msg = validate(form);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    try {
      setSaving(true);
      await axios.post(
        `${API}/informasiKurangQty`,
        {
          id_jo: row.id,
          no_jo: row.no_jo,
          id_produk: row.id_produk,
          nama_produk: row.produk,
          qty_po: qtyPo,
          qty_kurang: Number(form.qty_kurang),
          id_mesin_cetak: Number(form.id_mesin_cetak),
          nama_mesin_cetak: form.nama_mesin_cetak,
          tgl_cetak: form.tgl_cetak,
          jenis_kerusakan: form.jenis_kerusakan.trim(),
          note: form.note.trim(),
        },
        { withCredentials: true },
      );
      notify('success', `Informasi kurang qty ${row.no_jo} berhasil disimpan`);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError(apiError(err, 'Gagal menyimpan informasi'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Buat Informasi Kurang Qty"
      subtitle={`${row.no_jo} · ${row.produk}`}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReadonlyField label="No JO" value={row.no_jo} />
        <ReadonlyField label="Produk" value={row.produk} />
        <ReadonlyField label="Qty PO" value={fmtQty(qtyPo)} />
      </div>

      {machines.length === 0 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          JO ini belum punya data cetak, sehingga mesin cetak belum bisa
          dipilih.
        </p>
      )}

      <FormFields form={form} setForm={setForm} machines={machines} />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <InformasiKurangQtyList items={row.informasi_kurang_qty} />
    </ModalShell>
  );
}

// ─── Modal Edit ───────────────────────────────────────────────────────────────

function EditModal({
  item,
  onClose,
  onSaved,
  notify,
}: {
  item: any;
  onClose: () => void;
  onSaved: () => void;
  notify: Notify;
}) {
  const [machines, setMachines] = useState<any[]>(
    Array.isArray(item.data_cetak) ? item.data_cetak : [],
  );
  const [form, setForm] = useState<FormState>({
    id_mesin_cetak: String(item.id_mesin_cetak ?? ''),
    nama_mesin_cetak: item.nama_mesin_cetak ?? '',
    tgl_cetak: toDateInput(item.tgl_cetak),
    qty_kurang: String(item.qty_kurang ?? ''),
    jenis_kerusakan: item.jenis_kerusakan ?? '',
    note: item.note ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Ambil daftar mesin cetak JO ini dari endpoint monitoring
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API}/ppic/joMonitoringKurangQty`, {
          params: { page: 1, limit: 10, search: item.no_jo },
          withCredentials: true,
        });
        const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
        const jo = list.find((j) => j.no_jo === item.no_jo);
        if (!cancelled && jo?.data_cetak?.length) setMachines(jo.data_cetak);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item.no_jo]);

  // pastikan mesin yang tersimpan tetap muncul di dropdown
  const options =
    form.id_mesin_cetak &&
    !machines.some(
      (m) => String(m.id_mesin_cetak) === String(item.id_mesin_cetak),
    )
      ? [
          {
            id_mesin_cetak: item.id_mesin_cetak,
            nama_mesin_cetak: item.nama_mesin_cetak,
            tgl_cetak: item.tgl_cetak,
          },
          ...machines,
        ]
      : machines;

  const handleSave = async () => {
    const msg = validate(form);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    try {
      setSaving(true);
      await axios.put(
        `${API}/informasiKurangQty/${item.id}`,
        {
          qty_kurang: Number(form.qty_kurang),
          id_mesin_cetak: Number(form.id_mesin_cetak),
          nama_mesin_cetak: form.nama_mesin_cetak,
          tgl_cetak: form.tgl_cetak,
          jenis_kerusakan: form.jenis_kerusakan.trim(),
          note: form.note.trim(),
        },
        { withCredentials: true },
      );
      notify('success', 'Informasi kurang qty berhasil diubah');
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError(apiError(err, 'Gagal mengubah informasi'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Ubah Informasi Kurang Qty"
      subtitle={`${item.no_jo} · ${item.nama_produk}`}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            {saving ? 'Menyimpan...' : 'Simpan perubahan'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReadonlyField label="No JO" value={item.no_jo} />
        <ReadonlyField label="Produk" value={item.nama_produk} />
        <ReadonlyField label="Qty PO" value={fmtQty(item.qty_po)} />
      </div>
      <FormFields form={form} setForm={setForm} machines={options} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </ModalShell>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

type Filters = {
  search: string;
  id_produk: string;
  start_date: string;
  end_date: string;
};
const emptyFilters: Filters = {
  search: '',
  id_produk: '',
  start_date: '',
  end_date: '',
};

function FilterCard({
  title,
  dateLabel,
  showIdProduk,
  onApply,
}: {
  title: string;
  dateLabel: string;
  showIdProduk?: boolean;
  onApply: (f: Filters) => void;
}) {
  const [input, setInput] = useState<Filters>(emptyFilters);
  const [dateError, setDateError] = useState('');
  const set = (k: keyof Filters, v: string) =>
    setInput((p) => ({ ...p, [k]: v }));

  const apply = () => {
    if (
      input.start_date &&
      input.end_date &&
      input.end_date < input.start_date
    ) {
      setDateError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }
    setDateError('');
    onApply(input);
  };
  const reset = () => {
    setInput(emptyFilters);
    setDateError('');
    onApply(emptyFilters);
  };
  const enter = (e: React.KeyboardEvent) => e.key === 'Enter' && apply();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4">
        <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
          {title}
        </h2>
      </div>
      <div className="p-3 sm:p-4 md:p-6">
        <div
          className={`grid grid-cols-1 gap-3 mb-4 ${
            showIdProduk ? 'md:grid-cols-4' : 'md:grid-cols-3'
          }`}
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm text-gray-600 font-medium">
              Cari:
            </label>
            <input
              type="text"
              value={input.search}
              onChange={(e) => set('search', e.target.value)}
              onKeyDown={enter}
              placeholder="No JO..."
              className={inputCls}
            />
          </div>
          {showIdProduk && (
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm text-gray-600 font-medium">
                ID Produk:
              </label>
              <input
                type="number"
                value={input.id_produk}
                onChange={(e) => set('id_produk', e.target.value)}
                onKeyDown={enter}
                className={inputCls}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm text-gray-600 font-medium">
              {dateLabel} (Dari):
            </label>
            <input
              type="date"
              value={input.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              onKeyDown={enter}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm text-gray-600 font-medium">
              {dateLabel} (Sampai):
            </label>
            <input
              type="date"
              value={input.end_date}
              min={input.start_date || undefined}
              onChange={(e) => set('end_date', e.target.value)}
              onKeyDown={enter}
              className={inputCls}
            />
          </div>
        </div>
        {dateError && <p className="text-xs text-red-600 mb-3">{dateError}</p>}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={reset}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
          >
            Reset Filter
          </button>
          <button
            onClick={apply}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 transition-all rounded-lg px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ title, total }: { title: string; total: number }) {
  return (
    <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-white text-base sm:text-lg font-bold">{title}</h3>
      <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold whitespace-nowrap">
        {total} Record
      </span>
    </div>
  );
}

// ─── Tab 1: Buat informasi (daftar JO) ────────────────────────────────────────

function TabBuat({ notify }: { notify: Notify }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [createRow, setCreateRow] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/ppic/joMonitoringKurangQty`, {
        params: {
          page,
          limit,
          search: filters.search.trim() || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        },
        withCredentials: true,
      });
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(list);
      setTotalData(res.data?.total_data ?? list.length);
      setTotalPage(Math.max(1, res.data?.total_page ?? 1));
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotalData(0);
      setTotalPage(1);
      notify('error', apiError(err, 'Gagal memuat data JO'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {isLoading && <Loading />}
      {createRow && (
        <CreateModal
          row={createRow}
          onClose={() => setCreateRow(null)}
          onSaved={fetchData}
          notify={notify}
        />
      )}

      <FilterCard
        title="Buat Informasi Kurang Qty"
        dateLabel="Tanggal Kirim"
        onApply={(f) => {
          setPage(1);
          setFilters(f);
        }}
      />

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <TableHeader title="Data JO Kurang Qty" total={totalData} />
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-xs sm:text-sm min-w-[1100px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className={th}>No</th>
                <th className={th}>Nomor</th>
                <th className={th}>Customer</th>
                <th className={th}>Produk</th>
                <th className={`${th} text-right`}>Qty JO</th>
                <th className={`${th} text-right`}>Kurang Qty</th>
                <th className={th}>Mesin Cetak</th>
                <th className={th}>Tgl Kirim</th>
                <th className={`${th} text-center`}>Informasi</th>
                <th className={th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const total = row.total_informasi_kurang_qty ?? 0;
                  return (
                    <tr
                      key={row.id ?? i}
                      className="border-b hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-2 sm:p-3 text-xs text-gray-500">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <span className="block font-bold text-violet-600 whitespace-nowrap">
                          {row.no_jo || '-'}
                        </span>
                        <span className="block text-blue-600 font-medium whitespace-nowrap">
                          {row.no_so || '-'}
                        </span>
                        <span className="block text-gray-500 whitespace-nowrap">
                          {row.no_io || '-'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-xs max-w-[160px] font-medium">
                        {row.customer || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs max-w-[220px]">
                        {row.produk || '-'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-right">
                        {fmtQty(row.qty_jo)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-right font-bold text-red-600">
                        {fmtQty(row.kurang_qty)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtMesin(row.data_cetak)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                        {fmtDate(row.tgl_kirim)}
                      </td>
                      <td className="p-2 sm:p-3 text-xs text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${
                            total > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {total > 0 ? `${total} informasi` : 'Belum ada'}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3 text-xs">
                        <button
                          onClick={() => setCreateRow(row)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors whitespace-nowrap"
                        >
                          Buat informasi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          totalData={totalData}
          totalPage={totalPage}
          onPage={setPage}
          onLimit={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}

// ─── Tab 2: Daftar informasi ──────────────────────────────────────────────────

function TabDaftar({ notify }: { notify: Notify }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPage, setTotalPage] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/informasiKurangQty`, {
        params: {
          limit,
          page,
          search: filters.search.trim() || undefined,
          id_produk: filters.id_produk || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        },
        withCredentials: true,
      });
      const list: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      setRows(list);
      setTotalData(res.data?.total_data ?? list.length);
      setTotalPage(Math.max(1, res.data?.total_page ?? 1));
    } catch (err) {
      console.error(err);
      setRows([]);
      setTotalData(0);
      setTotalPage(1);
      notify('error', apiError(err, 'Gagal memuat daftar informasi'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      await axios.delete(`${API}/informasiKurangQty/${deleteItem.id}`, {
        withCredentials: true,
      });
      notify('success', `Informasi ${deleteItem.no_jo} berhasil dihapus`);
      setDeleteItem(null);
      // kalau yang dihapus item terakhir di halaman ini, mundur satu halaman
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else fetchData();
    } catch (err) {
      console.error(err);
      notify('error', apiError(err, 'Gagal menghapus informasi'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={fetchData}
          notify={notify}
        />
      )}
      {deleteItem && (
        <ConfirmModal
          title="Hapus informasi kurang qty?"
          message={
            <>
              Informasi untuk <b>{deleteItem.no_jo}</b> (mesin{' '}
              {deleteItem.nama_mesin_cetak || '-'}, kurang{' '}
              {fmtQty(deleteItem.qty_kurang)}) akan dihapus dan tidak bisa
              dikembalikan.
            </>
          }
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      <FilterCard
        title="Daftar Informasi Kurang Qty"
        dateLabel="Tanggal Cetak"
        showIdProduk
        onApply={(f) => {
          setPage(1);
          setFilters(f);
        }}
      />

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <TableHeader title="Data Informasi" total={totalData} />
        <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
          <table className="w-full text-xs sm:text-sm min-w-[1200px]">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className={th}>No</th>
                <th className={th}>No JO</th>
                <th className={th}>Produk</th>
                <th className={`${th} text-right`}>Qty PO</th>
                <th className={`${th} text-right`}>Qty Kurang</th>
                <th className={th}>Mesin Cetak</th>
                <th className={th}>Tgl Cetak</th>
                <th className={th}>Jenis Kerusakan</th>
                <th className={th}>Catatan</th>
                <th className={th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr
                    key={r.id ?? i}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-2 sm:p-3 text-xs text-gray-500">
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className="p-2 sm:p-3 text-xs font-bold text-violet-600 whitespace-nowrap">
                      {r.no_jo || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[220px]">
                      {r.nama_produk || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right">
                      {fmtQty(r.qty_po)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-right font-bold text-red-600">
                      {fmtQty(r.qty_kurang)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {r.nama_mesin_cetak || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDate(r.tgl_cetak)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[200px]">
                      {r.jenis_kerusakan || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs max-w-[200px] text-gray-500">
                      {r.note || '-'}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditItem(r)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 border border-violet-200 transition-colors"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => setDeleteItem(r)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          totalData={totalData}
          totalPage={totalPage}
          onPage={setPage}
          onLimit={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function InformasiKurangQty() {
  const [tab, setTab] = useState<'buat' | 'daftar'>('buat');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const notify: Notify = useCallback(
    (type, text) => setToast({ type, text }),
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
      active
        ? 'border-violet-600 text-violet-700 bg-white'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`;

  return (
    <main>
      {toast && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-[70] max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200 mb-4">
        <button
          className={tabCls(tab === 'buat')}
          onClick={() => setTab('buat')}
        >
          Buat Informasi
        </button>
        <button
          className={tabCls(tab === 'daftar')}
          onClick={() => setTab('daftar')}
        >
          Daftar Informasi
        </button>
      </div>

      {/* key = remount saat pindah tab, jadi daftar selalu fresh setelah create */}
      {tab === 'buat' ? (
        <TabBuat notify={notify} />
      ) : (
        <TabDaftar notify={notify} />
      )}
    </main>
  );
}

export default InformasiKurangQty;
