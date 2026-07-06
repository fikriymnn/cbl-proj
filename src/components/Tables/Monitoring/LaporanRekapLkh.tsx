import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Loading from '../../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tahapan {
  id?: number;
  kode_tahapan: string;
  nama_tahapan: string;
}

interface MesinTahapan {
  id?: number;
  kode_mesin?: string;
  nama_mesin: string;
  type_kapasitas: 'druk' | 'pcs' | 'lp';
}

interface KendalaItem {
  is_final_result: boolean;
  id: number;
  id_jo: number;
  no_jo: string;
  no_io?: string;
  tipe_jo: string;
  kode: string;
  deskripsi: string;
  produk?: string;
  customer?: string;
  proses: string;
  operator: { id: number; nama: string } | null;
  kategori_kendala: { id: number; kategori: string } | null;
  total_waktu_detik: number;
  total_waktu_jam: number;
  waktu_mulai: string;
  waktu_selesai: string;
  baik: number;
  rusak_sebagian: number;
  rusak_total: number;
  status: string;
  note: string;
}

interface RekapKendala {
  kategori_kendala: string;
  total_waktu_detik: number;
  total_waktu_jam: number;
  persentase: number;
  data_kendala: KendalaItem[];
}

interface RekapMesin {
  total_waktu_setting_jam: number;
  total_waktu_produksi_jam: number;
  total_waktu_kendala_jam: number;
  total_waktu_off_jam: number;
  total_waktu_perawatan_mesin_jam: number;
  net_output: number;
  total_jam: number;
  total_jo: number;
  total_jo_produksi: number;
  total_jo_proof: number;
  total_qty_baik: number;
  total_qty_produksi: number;
  total_qty_rusak_sebagian: number;
  total_qty_rusak_total: number;
  detail_setting: KendalaItem[];
  detail_produksi: KendalaItem[];
  detail_kendala: KendalaItem[];
  detail_off: KendalaItem[];
  detail_perawatan_mesin: KendalaItem[];
}

interface OperatorRekap {
  id_operator: number;
  nama_operator: string;
  rekap_mesin: RekapMesin;
  rekap_kendala: RekapKendala[];
}

interface ApiResponse {
  rekap_mesin: RekapMesin;
  rekap_operator: OperatorRekap[];
  rekap_kendala: RekapKendala[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDate()).padStart(2, '0')}`;
}
function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '-';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}
function fmtNum(val: number | null | undefined, dec = 0) {
  if (val == null) return '-';
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}
function fmtDurasi(jam: number | null | undefined): string {
  if (jam == null) return '-';
  const totalDetik = Math.round(jam * 3600);
  const h = Math.floor(totalDetik / 3600);
  const m = Math.floor((totalDetik % 3600) / 60);
  const s = totalDetik % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} Jam`);
  if (m > 0) parts.push(`${m} Menit`);
  if (s > 0 || parts.length === 0) parts.push(`${s} Detik`);
  return parts.join(' ');
}
function fmtDetik(detik: number | null | undefined): string {
  if (detik == null) return '-';
  const totalDetik = Math.round(detik);
  const h = Math.floor(totalDetik / 3600);
  const m = Math.floor((totalDetik % 3600) / 60);
  const s = totalDetik % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} Jam`);
  if (m > 0) parts.push(`${m} Menit`);
  if (s > 0 || parts.length === 0) parts.push(`${s} Detik`);
  return parts.join(' ');
}

// ─── Searchable Select ────────────────────────────────────────────────────────

function SearchableSelect<T>({
  label,
  required,
  placeholder,
  options,
  value,
  onChange,
  getKey,
  getLabel,
  disabled,
  loading,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: T[];
  value: T | null;
  onChange: (v: T | null) => void;
  getKey: (v: T) => string | number;
  getLabel: (v: T) => string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) => getLabel(o).toLowerCase().includes(q));
  }, [options, search, getLabel]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[data-searchable-select-menu]')
      ) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updateCoords() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
    }
    updateCoords();
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      <label className="text-xs font-medium text-gray-500">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setOpen((o) => !o);
              setSearch('');
            }
          }}
          className={`w-full rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 ${
            open ? 'ring-2 ring-violet-400' : ''
          }`}
        >
          <span
            className={
              value ? 'text-gray-800 truncate' : 'text-gray-400 truncate'
            }
          >
            {loading ? 'Memuat...' : value ? getLabel(value) : placeholder}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open &&
          createPortal(
            <div
              data-searchable-select-menu
              className="fixed z-[9999] bg-white border border-violet-200 rounded-xl shadow-xl overflow-hidden"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
            >
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {!required && value && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-400 hover:bg-gray-50 italic"
                  >
                    — Tidak dipilih (opsional)
                  </button>
                )}
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-6">
                    Tidak ditemukan
                  </p>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={getKey(opt)}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-violet-50 transition-colors ${
                        value && getKey(value) === getKey(opt)
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {getLabel(opt)}
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 sm:p-4 flex flex-col gap-1 min-w-0 ${
        accent
          ? 'bg-violet-50 border-violet-200'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide truncate">
        {label}
      </p>
      <p
        className={`text-base sm:text-lg font-bold truncate ${
          accent ? 'text-violet-700' : 'text-gray-800'
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] sm:text-[11px] text-gray-400 truncate">
          {sub}
        </p>
      )}
    </div>
  );
}

function PctBar({
  label,
  pct,
  colorClass,
  jam,
}: {
  label: string;
  pct: number;
  colorClass: string;
  jam: number;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
      <span className="text-xs text-gray-500 w-16 sm:w-20 shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-[60px] bg-gray-100 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
        {fmtDurasi(jam)}
      </span>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right shrink-0">
        {pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ─── Detail List Modal ────────────────────────────────────────────────────────

const TABLE_HEADERS = [
  'No',
  'Nomor',
  'Produk',
  'Customer',
  'Deskripsi',
  'Operator',
  'Kategori',
  'Waktu',
  'Durasi',
  'Baik',
  'RS',
  'RT',
];

function DetailTable({ items }: { items: KendalaItem[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      [
        item.no_jo,
        item.no_io,
        item.produk,
        item.customer,
        item.deskripsi,
        item.operator?.nama,
        item.kategori_kendala?.kategori,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari No JO, No IO, produk, customer, operator..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          Tidak ada data{search ? ' yang sesuai pencarian' : ''}
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full text-xs min-w-[1200px]">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap border-b border-gray-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-violet-50 transition-colors`}
                >
                  <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                    {i + 1}
                    {item.is_final_result && (
                      <span
                        title="Final Result"
                        className="text-amber-500 text-base"
                      >
                        ★
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium  whitespace-nowrap flex flex-col gap-1">
                    <span className="text-xs text-violet-600">
                      {' '}
                      {item.no_jo}
                    </span>

                    <span className="text-xs text-gray-500">
                      {item.no_io || '-'}
                    </span>
                    <span
                      className={`text-xs ${
                        item.tipe_jo === 'JO PRODUKSI'
                          ? 'text-green-500'
                          : 'text-blue-500'
                      }`}
                    >
                      {' '}
                      {item.tipe_jo || '-'}
                    </span>
                  </td>

                  <td className="px-3 py-2 max-w-[200px] " title={item.produk}>
                    {item.produk || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.customer || '-'}
                  </td>
                  <td className="px-3 py-2">{item.deskripsi || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.operator?.nama || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.kategori_kendala?.kategori || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 flex flex-col gap-1  ">
                    <span>Mulai : {fmtDateTime(item.waktu_mulai)}</span>
                    <span>Selesai : {fmtDateTime(item.waktu_selesai)}</span>
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap font-medium text-violet-700">
                    {fmtDetik(item.total_waktu_detik)}
                  </td>
                  <td className="px-3 py-2 text-right text-green-600 font-semibold">
                    {fmtNum(item.baik)}
                  </td>
                  <td className="px-3 py-2 text-right text-orange-500 font-semibold">
                    {fmtNum(item.rusak_sebagian)}
                  </td>
                  <td className="px-3 py-2 text-right text-red-500 font-semibold">
                    {fmtNum(item.rusak_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">
        {filtered.length} dari {items.length} record
      </p>
    </div>
  );
}

function DetailListModal({
  title,
  items,
  onClose,
}: {
  title: string;
  items: KendalaItem[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 sm:px-6 py-3 sm:py-4 text-white rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="text-sm sm:text-base font-bold pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 text-2xl font-bold leading-none shrink-0"
          >
            ×
          </button>
        </div>
        <div className="overflow-auto p-3 sm:p-4">
          <DetailTable items={items} />
        </div>
        <div className="px-4 sm:px-6 py-3 bg-gray-50 rounded-b-2xl flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Rekap Mesin Card ─────────────────────────────────────────────────────────

function RekapMesinCard({ data }: { data: RekapMesin }) {
  const [detailModal, setDetailModal] = useState<{
    title: string;
    items: KendalaItem[];
  } | null>(null);

  const totalJam = data.total_jam ?? 0;
  const pctSetting =
    totalJam > 0 ? (data.total_waktu_setting_jam / totalJam) * 100 : 0;
  const pctProduksi =
    totalJam > 0 ? (data.total_waktu_produksi_jam / totalJam) * 100 : 0;
  const pctKendala =
    totalJam > 0 ? (data.total_waktu_kendala_jam / totalJam) * 100 : 0;
  const pctOff = totalJam > 0 ? (data.total_waktu_off_jam / totalJam) * 100 : 0;
  const pctPerawatan =
    totalJam > 0 ? (data.total_waktu_perawatan_mesin_jam / totalJam) * 100 : 0;

  return (
    <>
      {detailModal && (
        <DetailListModal
          title={detailModal.title}
          items={detailModal.items}
          onClose={() => setDetailModal(null)}
        />
      )}
      <div className="space-y-5">
        {/* Row 1: Time-based */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Waktu & JO
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              label="Total Jam"
              value={fmtDurasi(data.total_jam)}
              accent
            />
            <StatCard
              label="Waktu Setting"
              value={fmtDurasi(data.total_waktu_setting_jam)}
              sub={`${pctSetting.toFixed(1)}% dari total`}
            />
            <StatCard
              label="Waktu Produksi"
              value={fmtDurasi(data.total_waktu_produksi_jam)}
              sub={`${pctProduksi.toFixed(1)}% dari total`}
            />
            <StatCard
              label="Waktu Kendala"
              value={fmtDurasi(data.total_waktu_kendala_jam)}
              sub={`${pctKendala.toFixed(1)}% dari total`}
            />
            <StatCard
              label="Waktu Off"
              value={fmtDurasi(data.total_waktu_off_jam)}
              sub={`${pctOff.toFixed(1)}% dari total`}
            />
            <StatCard
              label="Waktu Perawatan Mesin"
              value={fmtDurasi(data.total_waktu_perawatan_mesin_jam)}
              sub={`${pctPerawatan.toFixed(1)}% dari total`}
            />
            <StatCard
              label="Total JO"
              value={fmtNum(data.total_jo)}
              sub={`${fmtNum(data.total_jo_produksi)} produksi / ${fmtNum(
                data.total_jo_proof,
              )} proof`}
            />
            <StatCard label="Net Output" value={fmtNum(data.net_output, 4)} />
          </div>
        </div>

        {/* Row 2: Qty-based */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Kuantitas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              label="Qty Baik"
              value={fmtNum(data.total_qty_baik)}
              accent
            />
            <StatCard
              label="Total Produksi"
              value={fmtNum(data.total_qty_produksi)}
            />
            <StatCard
              label="Rusak Sebagian"
              value={fmtNum(data.total_qty_rusak_sebagian)}
            />
            <StatCard
              label="Rusak Total"
              value={fmtNum(data.total_qty_rusak_total)}
            />
          </div>
        </div>

        {/* Time distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">
            Distribusi Waktu Mesin
          </h4>
          <div className="space-y-3">
            <PctBar
              label="Setting"
              pct={pctSetting}
              colorClass="bg-blue-400"
              jam={data.total_waktu_setting_jam}
            />
            <PctBar
              label="Produksi"
              pct={pctProduksi}
              colorClass="bg-emerald-400"
              jam={data.total_waktu_produksi_jam}
            />
            <PctBar
              label="Kendala"
              pct={pctKendala}
              colorClass="bg-red-400"
              jam={data.total_waktu_kendala_jam}
            />
            <PctBar
              label="Perawatan"
              pct={pctPerawatan}
              colorClass="bg-indigo-400"
              jam={data.total_waktu_perawatan_mesin_jam}
            />
            <PctBar
              label="Off"
              pct={pctOff}
              colorClass="bg-gray-300"
              jam={data.total_waktu_off_jam}
            />
          </div>
        </div>

        {/* Detail buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {[
            {
              label: 'Detail Setting',
              items: data.detail_setting ?? [],
              color:
                'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
              dot: 'bg-blue-400',
            },
            {
              label: 'Detail Produksi',
              items: data.detail_produksi ?? [],
              color:
                'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
              dot: 'bg-emerald-400',
            },
            {
              label: 'Detail Kendala',
              items: data.detail_kendala ?? [],
              color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
              dot: 'bg-red-400',
            },
            {
              label: 'Detail Perawatan Mesin',
              items: data.detail_perawatan_mesin ?? [],
              color:
                'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
              dot: 'bg-indigo-400',
            },
            {
              label: 'Detail Off',
              items: data.detail_off ?? [],
              color:
                'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
              dot: 'bg-gray-400',
            },
          ].map(({ label, items, color, dot }) => (
            <button
              key={label}
              onClick={() => setDetailModal({ title: label, items })}
              className={`border rounded-xl px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 justify-between ${color}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <span className="truncate">{label}</span>
              </div>
              <span className="text-xs font-normal opacity-60 bg-white bg-opacity-60 px-1.5 py-0.5 rounded shrink-0">
                {items.length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Rekap Kendala Section ────────────────────────────────────────────────────

function RekapKendalaSection({ data }: { data: RekapKendala[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{
    title: string;
    items: KendalaItem[];
  } | null>(null);

  const BADGE: Record<string, string> = {
    Mesin: 'bg-red-100 text-red-700 border-red-200',
    Material: 'bg-orange-100 text-orange-700 border-orange-200',
    Plat: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Man: 'bg-blue-100 text-blue-700 border-blue-200',
    Design: 'bg-purple-100 text-purple-700 border-purple-200',
    Persiapan: 'bg-teal-100 text-teal-700 border-teal-200',
  };
  const BAR: Record<string, string> = {
    Mesin: 'bg-red-400',
    Material: 'bg-orange-400',
    Plat: 'bg-yellow-400',
    Man: 'bg-blue-400',
    Design: 'bg-purple-400',
    Persiapan: 'bg-teal-400',
  };

  return (
    <>
      {detailModal && (
        <DetailListModal
          title={detailModal.title}
          items={detailModal.items}
          onClose={() => setDetailModal(null)}
        />
      )}
      <div className="space-y-3">
        {data.map((k) => {
          const badge =
            BADGE[k.kategori_kendala] ??
            'bg-gray-100 text-gray-700 border-gray-200';
          const bar = BAR[k.kategori_kendala] ?? 'bg-gray-400';
          const isOpen = expanded === k.kategori_kendala;
          return (
            <div
              key={k.kategori_kendala}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : k.kategori_kendala)}
                className="w-full px-3 sm:px-5 py-4 flex items-center gap-2 sm:gap-4 hover:bg-gray-50 transition-colors flex-wrap sm:flex-nowrap"
              >
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${badge}`}
                >
                  {k.kategori_kendala}
                </span>
                <div className="flex-1 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`${bar} h-1.5 rounded-full`}
                        style={{ width: `${Math.min(k.persentase, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-10 text-right shrink-0">
                      {k.persentase.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-700">
                    {fmtDetik(k.total_waktu_detik)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {k.data_kendala.length} item
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isOpen && (
                <div className="border-t border-gray-100 px-3 sm:px-5 py-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        setDetailModal({
                          title: `Kendala ${k.kategori_kendala}`,
                          items: k.data_kendala,
                        })
                      }
                      className="text-xs text-violet-600 hover:underline font-semibold"
                    >
                      Lihat semua dalam modal →
                    </button>
                  </div>
                  <DetailTable items={k.data_kendala} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Rekap Operator Section ───────────────────────────────────────────────────

function RekapOperatorSection({ data }: { data: OperatorRekap[] }) {
  const [activeOp, setActiveOp] = useState<number | null>(null);
  const [activeOpTab, setActiveOpTab] = useState<
    Record<
      number,
      | 'ringkasan'
      | 'detail_produksi'
      | 'detail_setting'
      | 'detail_kendala'
      | 'detail_perawatan_mesin'
      | 'detail_off'
    >
  >({});

  function getOpTab(id: number) {
    return activeOpTab[id] ?? 'ringkasan';
  }

  const OP_TABS: {
    key:
      | 'ringkasan'
      | 'detail_produksi'
      | 'detail_setting'
      | 'detail_kendala'
      | 'detail_perawatan_mesin'
      | 'detail_off';
    label: string;
  }[] = [
    { key: 'ringkasan', label: 'Ringkasan' },
    { key: 'detail_produksi', label: 'Produksi' },
    { key: 'detail_setting', label: 'Setting' },
    { key: 'detail_kendala', label: 'Kendala' },
    { key: 'detail_perawatan_mesin', label: 'Perawatan' },
    { key: 'detail_off', label: 'Off' },
  ];

  return (
    <div className="space-y-4">
      {data.map((op) => {
        const m = op.rekap_mesin;
        const isOpen = activeOp === op.id_operator;
        const totalJam = m.total_jam ?? 0;
        const tab = getOpTab(op.id_operator);

        const tabItems: KendalaItem[] =
          tab === 'detail_produksi'
            ? m.detail_produksi ?? []
            : tab === 'detail_setting'
            ? m.detail_setting ?? []
            : tab === 'detail_kendala'
            ? m.detail_kendala ?? []
            : tab === 'detail_perawatan_mesin'
            ? m.detail_perawatan_mesin ?? []
            : tab === 'detail_off'
            ? m.detail_off ?? []
            : [];

        return (
          <div
            key={op.id_operator}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <button
              onClick={() => setActiveOp(isOpen ? null : op.id_operator)}
              className="w-full px-3 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors text-left flex-wrap sm:flex-nowrap"
            >
              <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                {op.nama_operator
                  .split(' ')
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="flex-1 min-w-[120px]">
                <p className="font-semibold text-gray-800 text-sm">
                  {op.nama_operator}
                </p>
                <p className="text-xs text-gray-400">
                  {m.total_jo} JO · {fmtDurasi(m.total_jam)}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5 shrink-0">
                <p>
                  <span className="text-green-600 font-bold">
                    {fmtNum(m.total_qty_baik)}
                  </span>{' '}
                  baik
                </p>
                <p>Net {fmtNum(m.net_output, 4)}</p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Sub-tabs */}
                <div className="flex gap-0 border-b border-gray-100 overflow-x-auto">
                  {OP_TABS.map(({ key, label }) => {
                    const count =
                      key === 'detail_produksi'
                        ? m.detail_produksi?.length ?? 0
                        : key === 'detail_setting'
                        ? m.detail_setting?.length ?? 0
                        : key === 'detail_kendala'
                        ? m.detail_kendala?.length ?? 0
                        : key === 'detail_perawatan_mesin'
                        ? m.detail_perawatan_mesin?.length ?? 0
                        : key === 'detail_off'
                        ? m.detail_off?.length ?? 0
                        : null;
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setActiveOpTab((prev) => ({
                            ...prev,
                            [op.id_operator]: key,
                          }))
                        }
                        className={`px-3 sm:px-4 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 shrink-0 ${
                          tab === key
                            ? 'border-violet-600 text-violet-700 bg-violet-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                        {count !== null && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tab === key
                                ? 'bg-violet-200 text-violet-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 sm:p-5 space-y-4">
                  {tab === 'ringkasan' && (
                    <>
                      {/* Time stats */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Waktu & JO
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          <StatCard
                            label="Total Jam"
                            value={fmtDurasi(m.total_jam)}
                            accent
                          />
                          <StatCard
                            label="Total JO"
                            value={fmtNum(m.total_jo)}
                            sub={`${fmtNum(
                              m.total_jo_produksi,
                            )} produksi / ${fmtNum(m.total_jo_proof)} proof`}
                          />
                          <StatCard
                            label="Net Output"
                            value={fmtNum(m.net_output, 4)}
                          />
                          <StatCard
                            label="Waktu Kendala"
                            value={fmtDurasi(m.total_waktu_kendala_jam)}
                          />
                          <StatCard
                            label="Waktu Perawatan Mesin"
                            value={fmtDurasi(m.total_waktu_perawatan_mesin_jam)}
                          />
                        </div>
                      </div>

                      {/* Qty stats */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Kuantitas
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          <StatCard
                            label="Qty Baik"
                            value={fmtNum(m.total_qty_baik)}
                            accent
                          />
                          <StatCard
                            label="Total Produksi"
                            value={fmtNum(m.total_qty_produksi)}
                          />
                          <StatCard
                            label="Rusak Sebagian"
                            value={fmtNum(m.total_qty_rusak_sebagian)}
                          />
                          <StatCard
                            label="Rusak Total"
                            value={fmtNum(m.total_qty_rusak_total)}
                          />
                        </div>
                      </div>

                      {/* Time distribution */}
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Distribusi Waktu
                        </h5>
                        {[
                          {
                            label: 'Setting',
                            jam: m.total_waktu_setting_jam,
                            bar: 'bg-blue-400',
                          },
                          {
                            label: 'Produksi',
                            jam: m.total_waktu_produksi_jam,
                            bar: 'bg-emerald-400',
                          },
                          {
                            label: 'Kendala',
                            jam: m.total_waktu_kendala_jam,
                            bar: 'bg-red-400',
                          },
                          {
                            label: 'Perawatan',
                            jam: m.total_waktu_perawatan_mesin_jam,
                            bar: 'bg-indigo-400',
                          },
                          {
                            label: 'Off',
                            jam: m.total_waktu_off_jam,
                            bar: 'bg-gray-300',
                          },
                        ].map(({ label, jam, bar }) => (
                          <PctBar
                            key={label}
                            label={label}
                            pct={totalJam > 0 ? (jam / totalJam) * 100 : 0}
                            colorClass={bar}
                            jam={jam}
                          />
                        ))}
                      </div>

                      {/* Rekap kendala */}
                      {op.rekap_kendala?.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Rekap Kendala
                          </h5>
                          <div className="space-y-2">
                            {op.rekap_kendala.map((k) => (
                              <div
                                key={k.kategori_kendala}
                                className="flex items-center gap-2 sm:gap-3 text-xs"
                              >
                                <span className="w-16 sm:w-20 text-gray-500 shrink-0">
                                  {k.kategori_kendala}
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-red-400 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(k.persentase, 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-gray-500 text-right whitespace-nowrap">
                                  {fmtDetik(k.total_waktu_detik)}
                                </span>
                                <span className="font-semibold text-gray-600 w-10 text-right">
                                  {k.persentase.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {tab !== 'ringkasan' && <DetailTable items={tabItems} />}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type ActiveTab = 'mesin' | 'kendala' | 'operator';

const TABS: { key: ActiveTab; label: string; icon: string }[] = [
  {
    key: 'mesin',
    label: 'Rekap Mesin',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    key: 'kendala',
    label: 'Rekap Kendala',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  {
    key: 'operator',
    label: 'Per Operator',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

function LaporanRekapLKH() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTahapan, setIsFetchingTahapan] = useState(false);
  const [isFetchingMesin, setIsFetchingMesin] = useState(false);
  const [tahapanList, setTahapanList] = useState<Tahapan[]>([]);
  const [mesinList, setMesinList] = useState<MesinTahapan[]>([]);

  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedTahapan, setSelectedTahapan] = useState<Tahapan | null>(null);
  const [selectedMesin, setSelectedMesin] = useState<MesinTahapan | null>(null);

  const [rekapData, setRekapData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('mesin');

  // Load tahapan options on mount
  useEffect(() => {
    async function loadTahapan() {
      setIsFetchingTahapan(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapan`,
          { withCredentials: true },
        );
        setTahapanList(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error('Failed to load tahapan:', err);
      } finally {
        setIsFetchingTahapan(false);
      }
    }
    loadTahapan();
  }, []);

  // Load mesin options on mount
  useEffect(() => {
    async function loadMesin() {
      setIsFetchingMesin(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`,
          { withCredentials: true },
        );
        setMesinList(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        console.error('Failed to load mesin:', err);
      } finally {
        setIsFetchingMesin(false);
      }
    }
    loadMesin();
  }, []);

  const canFetch = !!(startDate && endDate && selectedMesin);

  async function fetchRekap() {
    if (!canFetch || !selectedMesin) return;
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = {
        start_date: startDate,
        end_date: endDate,
        id_mesin: selectedMesin.id!,
      };
      if (selectedTahapan?.id) {
        params.id_tahapan = selectedTahapan.id;
      }
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/produksi/lkhRekap`,
        { params, withCredentials: true },
      );
      console.log('Rekap data fetched:', res.data);
      setRekapData(res.data?.data ?? res.data ?? null);
      setActiveTab('mesin');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setStartDate(firstOfMonth());
    setEndDate(todayStr());
    setSelectedTahapan(null);
    setSelectedMesin(null);
    setRekapData(null);
  }

  return (
    <>
      {isLoading && <Loading />}
      <main className="space-y-4 sm:space-y-5 px-2 sm:px-0">
        {/* ── Filter Card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl px-4 sm:px-5 py-3 border-b border-violet-100 flex items-center gap-2 flex-wrap">
            <svg
              className="w-4 h-4 text-violet-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            <h2 className="font-semibold text-violet-700 text-sm">
              Filter Data
            </h2>
            {!selectedMesin && (
              <span className="w-full sm:w-auto sm:ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium text-center sm:text-left">
                Pilih Mesin untuk memuat data
              </span>
            )}
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all w-full"
                />
              </div>
              <SearchableSelect<MesinTahapan>
                label="Mesin"
                required
                placeholder="-- Pilih Mesin --"
                options={mesinList}
                value={selectedMesin}
                onChange={setSelectedMesin}
                getKey={(r) => r.id ?? r.nama_mesin}
                getLabel={(r) =>
                  r.kode_mesin
                    ? `${r.kode_mesin} - ${r.nama_mesin}`
                    : r.nama_mesin
                }
                loading={isFetchingMesin}
              />
              <SearchableSelect<Tahapan>
                label="Tahapan"
                placeholder="-- Semua Tahapan (Opsional) --"
                options={tahapanList}
                value={selectedTahapan}
                onChange={setSelectedTahapan}
                getKey={(r) => r.id ?? r.kode_tahapan}
                getLabel={(r) => `${r.kode_tahapan} - ${r.nama_tahapan}`}
                loading={isFetchingTahapan}
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-end mt-4">
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-gray-600"
              >
                Reset
              </button>
              <button
                onClick={fetchRekap}
                disabled={!canFetch || isLoading}
                className={`flex-1 sm:flex-none rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all ${
                  canFetch && !isLoading
                    ? 'bg-violet-600 hover:bg-violet-700 active:scale-95'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Memuat...' : 'Tampilkan Rekap'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Empty State ── */}
        {!rekapData && !isLoading && (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-12 sm:py-16 flex flex-col items-center gap-3 text-center px-4">
            <svg
              className="w-12 h-12 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-sm">
              Pilih Mesin, lalu klik{' '}
              <strong className="text-violet-600">Tampilkan Rekap</strong>
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {rekapData && (
          <div className="space-y-4">
            {/* Context pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {selectedTahapan ? (
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium border border-violet-200">
                  {selectedTahapan.kode_tahapan} -{' '}
                  {selectedTahapan.nama_tahapan}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium border border-gray-200 italic">
                  Semua Tahapan
                </span>
              )}
              <span className="text-gray-300 hidden sm:inline">·</span>
              {selectedMesin && (
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium border border-violet-200">
                  {selectedMesin.kode_mesin
                    ? `${selectedMesin.kode_mesin} - `
                    : ''}
                  {selectedMesin.nama_mesin}
                </span>
              )}
              <span className="text-gray-300 hidden sm:inline">·</span>
              <span className="text-gray-400">
                {startDate} s/d {endDate}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 rounded-xl overflow-x-auto border border-violet-200 w-full sm:w-fit shadow-sm">
              {TABS.map(({ key, label, icon }, idx) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    idx > 0 ? 'border-l border-violet-200' : ''
                  } ${
                    activeTab === key
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={icon}
                    />
                  </svg>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'mesin' && rekapData.rekap_mesin && (
              <RekapMesinCard data={rekapData.rekap_mesin} />
            )}
            {activeTab === 'kendala' && rekapData.rekap_kendala && (
              <RekapKendalaSection data={rekapData.rekap_kendala} />
            )}
            {activeTab === 'operator' && rekapData.rekap_operator && (
              <RekapOperatorSection data={rekapData.rekap_operator} />
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default LaporanRekapLKH;
