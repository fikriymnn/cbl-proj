import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Loading from '../../Loading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TahapanMesinOption {
  id: number;
  id_tahapan: number;
  id_mesin_tahapan: number;
  shift: string;
  tahapan?: { id: number; kode_tahapan: string; nama_tahapan: string };
  mesin?: { id: number; kode_mesin: string; nama_mesin: string };
}

interface KendalaItem {
  is_final_result: import('react/jsx-runtime').JSX.Element;
  id: number;
  id_jo: number;
  no_jo: string;
  tipe_jo: string;
  kode: string;
  deskripsi: string;
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

/** Convert jam (float) → "X Jam Y Menit Z Detik" */
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

/** Convert detik (int) → "X Jam Y Menit Z Detik" */
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
      className={`rounded-xl border p-4 flex flex-col gap-1 ${
        accent
          ? 'bg-violet-50 border-violet-200'
          : 'bg-white border-gray-100 shadow-sm'
      }`}
    >
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-lg font-bold ${
          accent ? 'text-violet-700' : 'text-gray-800'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
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
    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
      <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 min-w-[80px] bg-gray-100 rounded-full h-2">
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-4 text-white rounded-t-2xl flex justify-between items-center shrink-0">
          <h3 className="text-base font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-200 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Tidak ada data</p>
          ) : (
            <table className="w-full text-xs min-w-[1000px]">
              <thead className="bg-white sticky top-0">
                <tr>
                  {[
                    'No',
                    'No JO',
                    'Final',
                    'Deskripsi',
                    'Operator',
                    'Kategori',
                    'Waktu Mulai',
                    'Waktu Selesai',
                    'Durasi',
                    'Baik',
                    'Rusak Sebagian',
                    'Rusak Total',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    className={`border-b ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-violet-50 transition-colors`}
                  >
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-violet-600 whitespace-nowrap">
                      {item.no_jo}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.is_final_result && (
                        <span
                          title="Final Result"
                          className="text-amber-500 text-base"
                        >
                          ★
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{item.deskripsi || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item.operator?.nama || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item.kategori_kendala?.kategori || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                      {fmtDateTime(item.waktu_mulai)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                      {fmtDateTime(item.waktu_selesai)}
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
          )}
        </div>
        <div className="px-6 py-3 bg-gray-50 rounded-b-2xl flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400">{items.length} record</span>
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

  // Use total_jam from API as the authoritative denominator for percentage bars
  const totalJam = data.total_jam ?? 0;
  const pctSetting =
    totalJam > 0 ? (data.total_waktu_setting_jam / totalJam) * 100 : 0;
  const pctProduksi =
    totalJam > 0 ? (data.total_waktu_produksi_jam / totalJam) * 100 : 0;
  const pctKendala =
    totalJam > 0 ? (data.total_waktu_kendala_jam / totalJam) * 100 : 0;
  const pctOff = totalJam > 0 ? (data.total_waktu_off_jam / totalJam) * 100 : 0;

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
        {/* Main stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Total JO"
            value={fmtNum(data.total_jo)}
            sub={`${fmtNum(data.total_jo_produksi)} produksi / ${fmtNum(
              data.total_jo_proof,
            )} proof`}
          />
          <StatCard
            label="Total Jam"
            value={fmtDurasi(data.total_jam)}
            accent
          />
          <StatCard label="Net Output" value={fmtNum(data.net_output, 4)} />
          <StatCard label="Qty Baik" value={fmtNum(data.total_qty_baik)} />
          <StatCard
            label="Total Produksi"
            value={fmtNum(data.total_qty_produksi)}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            label="Rusak Sebagian"
            value={fmtNum(data.total_qty_rusak_sebagian)}
          />
          <StatCard
            label="Rusak Total"
            value={fmtNum(data.total_qty_rusak_total)}
          />
          <StatCard
            label="Waktu Kendala"
            value={fmtDurasi(data.total_waktu_kendala_jam)}
          />
        </div>

        {/* Time distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
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
              label="Off"
              pct={pctOff}
              colorClass="bg-gray-300"
              jam={data.total_waktu_off_jam}
            />
          </div>
        </div>

        {/* Detail buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              className={`border rounded-xl px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 justify-between ${color}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span>{label}</span>
              </div>
              <span className="text-xs font-normal opacity-60 bg-white bg-opacity-60 px-1.5 py-0.5 rounded">
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
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${badge}`}
                >
                  {k.kategori_kendala}
                </span>
                <div className="flex-1 min-w-0">
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
                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() =>
                        setDetailModal({
                          title: `Kendala ${k.kategori_kendala}`,
                          items: k.data_kendala,
                        })
                      }
                      className="text-xs text-violet-600 hover:underline font-semibold"
                    >
                      Lihat semua detail →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {k.data_kendala.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-4 gap-3 text-xs bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div>
                          <p className="text-gray-400">No JO</p>
                          <p className="font-medium text-violet-600">
                            {item.no_jo}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Deskripsi</p>
                          <p className="font-medium">{item.deskripsi || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Operator</p>
                          <p className="font-medium">
                            {item.operator?.nama || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Durasi</p>
                          <p className="font-bold text-red-500">
                            {fmtDetik(item.total_waktu_detik)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {k.data_kendala.length > 5 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        +{k.data_kendala.length - 5} lainnya
                      </p>
                    )}
                  </div>
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

  return (
    <div className="space-y-4">
      {data.map((op) => {
        const m = op.rekap_mesin;
        const isOpen = activeOp === op.id_operator;
        const totalJam = m.total_jam ?? 0;
        return (
          <div
            key={op.id_operator}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setActiveOp(isOpen ? null : op.id_operator)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                {op.nama_operator
                  .split(' ')
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">
                  {op.nama_operator}
                </p>
                <p className="text-xs text-gray-400">
                  {m.total_jo} JO · {fmtDurasi(m.total_jam)}
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-0.5">
                <p>
                  <span className="text-green-600 font-bold">
                    {fmtNum(m.total_qty_baik)}
                  </span>{' '}
                  baik
                </p>
                <p>Net {fmtNum(m.net_output, 4)}</p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
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
              <div className="border-t border-gray-100 p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Total JO"
                    value={fmtNum(m.total_jo)}
                    sub={`${fmtNum(m.total_jo_produksi)} produksi / ${fmtNum(
                      m.total_jo_proof,
                    )} proof`}
                  />
                  <StatCard
                    label="Total Jam"
                    value={fmtDurasi(m.total_jam)}
                    accent
                  />
                  <StatCard
                    label="Net Output"
                    value={fmtNum(m.net_output, 4)}
                  />
                  <StatCard label="Qty Baik" value={fmtNum(m.total_qty_baik)} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="Qty Produksi"
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
                  <StatCard
                    label="Waktu Kendala"
                    value={fmtDurasi(m.total_waktu_kendala_jam)}
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                      label: 'Off',
                      jam: m.total_waktu_off_jam,
                      bar: 'bg-gray-300',
                    },
                  ].map(({ label, jam, bar }) => {
                    const pct = totalJam > 0 ? (jam / totalJam) * 100 : 0;
                    return (
                      <PctBar
                        key={label}
                        label={label}
                        pct={pct}
                        colorClass={bar}
                        jam={jam}
                      />
                    );
                  })}
                </div>
                {op.rekap_kendala?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Rekap Kendala
                    </h5>
                    <div className="space-y-2">
                      {op.rekap_kendala.map((k) => (
                        <div
                          key={k.kategori_kendala}
                          className="flex items-center gap-3 text-xs"
                        >
                          <span className="w-20 text-gray-500 shrink-0">
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
  const [isFetchingOptions, setIsFetchingOptions] = useState(false);
  const [tahapanMesinList, setTahapanMesinList] = useState<
    TahapanMesinOption[]
  >([]);

  // Filter state
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedId, setSelectedId] = useState<string>(''); // id of tahapanMesin record

  // Data
  const [rekapData, setRekapData] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('mesin');

  // Load tahapanMesin options on mount (single API call)
  useEffect(() => {
    async function loadOptions() {
      setIsFetchingOptions(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_LINK}/master/tahapanMesin`,
          {
            withCredentials: true,
          },
        );
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setTahapanMesinList(list);
      } catch (err) {
        console.error('Failed to load tahapan mesin options:', err);
      } finally {
        setIsFetchingOptions(false);
      }
    }
    loadOptions();
  }, []);

  // Derive id_tahapan and id_mesin from selected record
  const selectedRecord = useMemo(
    () => tahapanMesinList.find((r) => String(r.id) === selectedId) ?? null,
    [tahapanMesinList, selectedId],
  );

  const canFetch = !!(startDate && endDate && selectedRecord);

  async function fetchRekap() {
    if (!canFetch || !selectedRecord) return;
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_LINK}/produksi/lkhRekap`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
            id_tahapan: selectedRecord.id_tahapan,
            id_mesin: selectedRecord.id_mesin_tahapan,
          },
          withCredentials: true,
        },
      );
      console.log('Rekap data response:', res.data);
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
    setSelectedId('');
    setRekapData(null);
  }

  // Build dropdown label per record
  function recordLabel(r: TahapanMesinOption) {
    const tahapan = r.tahapan
      ? `${r.tahapan.kode_tahapan} - ${r.tahapan.nama_tahapan}`
      : `Tahapan #${r.id_tahapan}`;
    const mesin = r.mesin
      ? `${r.mesin.kode_mesin || 'No Code'} - ${r.mesin.nama_mesin}`
      : `Mesin #${r.id_mesin_tahapan}`;
    return `${tahapan} / ${mesin}`;
  }

  return (
    <>
      {isLoading && <Loading />}
      <main className="space-y-5">
        {/* ── Filter Card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-3 border-b border-violet-100 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-violet-500"
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
            {!selectedId && (
              <span className="ml-auto text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Pilih Tahapan &amp; Mesin untuk memuat data
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
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
                  className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500">
                  Tahapan &amp; Mesin <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={isFetchingOptions}
                  className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all disabled:opacity-50"
                >
                  <option value="">
                    {isFetchingOptions
                      ? 'Memuat...'
                      : '-- Pilih Tahapan & Mesin --'}
                  </option>
                  {tahapanMesinList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {recordLabel(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-end mt-4">
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-gray-600"
              >
                Reset
              </button>
              <button
                onClick={fetchRekap}
                disabled={!canFetch || isLoading}
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all ${
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
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
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
              Pilih Tahapan &amp; Mesin, lalu klik{' '}
              <strong className="text-violet-600">Tampilkan Rekap</strong>
            </p>
          </div>
        )}

        {/* ── Results ── */}
        {rekapData && (
          <div className="space-y-4">
            {/* Context pills */}
            {selectedRecord && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium border border-violet-200">
                  {selectedRecord.tahapan
                    ? `${selectedRecord.tahapan.kode_tahapan} - ${selectedRecord.tahapan.nama_tahapan}`
                    : `Tahapan #${selectedRecord.id_tahapan}`}
                </span>
                <span className="text-gray-300">·</span>
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium border border-violet-200">
                  {selectedRecord.mesin
                    ? `${selectedRecord.mesin.kode_mesin || ''} - ${
                        selectedRecord.mesin.nama_mesin
                      }`
                    : `Mesin #${selectedRecord.id_mesin_tahapan}`}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-400">
                  {startDate} s/d {endDate}
                </span>
              </div>
            )}

            {/* Tabs with background */}
            <div className="flex gap-0 rounded-xl overflow-hidden border border-violet-200 w-fit shadow-sm">
              {TABS.map(({ key, label, icon }, idx) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all
                    ${idx > 0 ? 'border-l border-violet-200' : ''}
                    ${
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
