// JOKanbanModal.tsx
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SOData {
  id: number;
  no_so: string;
  no_io: string;
  id_io: number;
  id_customer: number;
  id_produk?: number; // ← ADDED
  customer: string;
  produk: string;
  po_qty: number;
  no_po_customer: string;
  alamat_pengiriman?: string;
  ada_standar_warna?: string;
  status_produk?: string;
  status_jo?: string;
  tgl_pengiriman?: string;
}

interface FGItem {
  id_jo: number;
  no_jo: string;
  id_customer: number;
  id_produk: number;
  jumlah_qty: number;
  jumlah_qty_keluar: number;
  jumlah_qty_sisa: number;
  produk: string;
  customer: string;
  no_so?: string;
  data_jo?: any; // full JO record including jo_mounting
  [key: string]: any;
}

interface MountingData {
  id: number;
  id_io: number;
  nama_mounting: string;
  barcode?: string;
  spesifikasi?: string;
  format_data?: string;
  ukuran_jadi_panjang?: number;
  ukuran_jadi_lebar?: number;
  ukuran_jadi_tinggi?: number;
  ukuran_jadi_terb_panjang?: number;
  ukuran_jadi_terb_lebar?: number;
  jenis_kertas?: string;
  gramature_kertas?: number;
  lebar_plano?: number;
  panjang_plano?: number;
  id_kertas?: number;
  nama_kertas?: string;
  jumlah_warna?: number;
  warna_depan?: number;
  warna_belakang?: number;
  keterangan_warna_depan?: string;
  keterangan_warna_belakang?: string;
  id_coating_depan?: number;
  id_coating_belakang?: number;
  nama_coating_depan?: string;
  nama_coating_belakang?: string;
  merk_coating_depan?: string;
  merk_coating_belakang?: string;
  id_jenis_pons?: number;
  nama_jenis_pons?: string;
  keterangan_jenis_pons?: string;
  id_lem?: number;
  nama_lem?: string;
  keterangan_lem?: string;
  merk_komp_lem?: string;
  merk_serat_kertas?: string;
  id_layout?: string;
  lebar_layout?: number;
  panjang_layout?: number;
  ukuran_cetak_panjang_1?: number;
  ukuran_cetak_lebar_1?: number;
  ukuran_cetak_bagian_1?: number;
  ukuran_cetak_isi_1?: number;
  ukuran_cetak_panjang_2?: number;
  ukuran_cetak_lebar_2?: number;
  ukuran_cetak_bagian_2?: number;
  ukuran_cetak_isi_2?: number;
  isi_dalam_1_pack?: number;
  jenis_pack?: string;
  keterangan_pack?: string;
  is_ukuran_partisi_sekat?: boolean;
  lebar_partisi_1?: number;
  panjang_partisi_1?: number;
  lebar_partisi_2?: number;
  panjang_partisi_2?: number;
  tambahan_insheet_druk?: number;
  lampiran?: string;
  untuk?: string;
  keterangan_revisi?: string;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  tahapan?: TahapanItem[];
}

interface TahapanItem {
  id: number;
  id_drying_time: number | null;
  id_setting_kapasitas: number | null;
  nama_mesin: string;
  nama_proses: string;
}

interface InsheetValues {
  jumlah_druk: number;
  jumlah_insheet_cetak: number;
  jumlah_insheet_pond: number;
  jumlah_insheet_finishing: number;
  total_insheet: number;
  jumlah_lp: number;
}

type KanbanEntryType = 'JO PRODUKSI' | 'JO KANBAN';

interface KanbanEntry {
  id: string;
  type: KanbanEntryType;
  // JO PRODUKSI fields
  qty?: number;
  selectedMounting?: number | null;
  mountingData?: MountingData[];
  insheetValues?: InsheetValues;
  loadingMounting?: boolean;
  // JO KANBAN (FG) fields
  fgItem?: FGItem;
  takenQty?: number;
}

interface JOKanbanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Helper ────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyInsheet = (): InsheetValues => ({
  jumlah_druk: 0,
  jumlah_insheet_cetak: 0,
  jumlah_insheet_pond: 0,
  jumlah_insheet_finishing: 0,
  total_insheet: 0,
  jumlah_lp: 0,
});

// ── Sub-component: Tahapan inline list ────────────────────────────────────────

const TahapanBlockReasons: React.FC<{
  tahapan: TahapanItem[];
  spesifikasi?: string;
}> = ({ tahapan, spesifikasi }) => {
  const reasons: string[] = [];
  if (!spesifikasi?.trim())
    reasons.push('Spesifikasi belum diisi pada mounting');
  if (tahapan.length === 0) {
    reasons.push('Tahapan belum diset');
  } else {
    if (tahapan.some((t) => t.id_drying_time === null))
      reasons.push('Drying time belum diset pada tahapan');
    if (tahapan.some((t) => t.id_setting_kapasitas === null))
      reasons.push('Kapasitas belum diset pada tahapan');
  }
  if (reasons.length === 0) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-md px-3 py-2 mt-2">
      <svg
        className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <div>
        <p className="text-xs font-semibold text-red-700">
          Mounting belum lengkap:
        </p>
        <ul className="list-disc list-inside space-y-0.5 mt-0.5">
          {reasons.map((r, i) => (
            <li key={i} className="text-xs text-red-600">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ── Sub-component: Produksi row (full mounting + insheet) ──────────────────────

interface ProduksiRowProps {
  entry: KanbanEntry;
  onChange: (patch: Partial<KanbanEntry>) => void;
  onRemove: () => void;
  index: number;
  previewJONumber: string;
  ketentuanInsheetData: any[];
  prosesInsheetData: any[];
}

const ProduksiRow: React.FC<ProduksiRowProps> = ({
  entry,
  onChange,
  onRemove,
  index,
  previewJONumber,
  ketentuanInsheetData,
  prosesInsheetData,
}) => {
  const [isManualInsheet, setIsManualInsheet] = useState(false);

  const mountingData = entry.mountingData ?? [];
  const selectedMountingId = entry.selectedMounting ?? null;
  const insheetValues = entry.insheetValues ?? emptyInsheet();
  const qty = entry.qty ?? 0;

  const selectedMounting =
    mountingData.find((m) => m.id === selectedMountingId) ?? null;

  // ── Insheet calculation helpers ────────────────────────────────────────────
  const getKetentuanInsheet = (rawDruk: number): any => {
    const k = ketentuanInsheetData.find((k) => {
      const low = parseInt(k.batas_bawah);
      const high = k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return rawDruk >= low && rawDruk <= high;
    });
    return k || { nilai: 0, is_persentase: false };
  };

  const calculateInsheet = (
    newQty: number,
    mounting: MountingData,
  ): InsheetValues => {
    const isi1 = mounting.ukuran_cetak_isi_1 || 0;
    const isi2 = mounting.ukuran_cetak_isi_2 || 0;
    const totalIsi = isi1 + isi2 || 1;
    const bagian = mounting.ukuran_cetak_bagian_1 || 1;
    const rawJumlahDruk = Math.ceil(newQty / totalIsi);
    const ketentuan = getKetentuanInsheet(rawJumlahDruk);
    const ketentuanValue =
      typeof ketentuan === 'object'
        ? ketentuan.is_persentase
          ? (rawJumlahDruk * ketentuan.nilai) / 100
          : ketentuan.nilai
        : ketentuan;

    const totalInsheet = Math.ceil(ketentuanValue);
    const totalPercentage =
      prosesInsheetData.reduce(
        (s: number, p: any) => s + p.persentase_insheet,
        0,
      ) || 1;

    let cetak = 0,
      pond = 0,
      finishing = 0;
    prosesInsheetData.forEach((proses: any) => {
      const value = Math.ceil(
        (totalInsheet * proses.persentase_insheet) / totalPercentage,
      );
      const name = proses.proses.toUpperCase();
      if (name === 'CETAK') cetak = value;
      else if (name === 'POND' || name === 'PONDS' || name === 'PONDING')
        pond = value;
      else if (name === 'FINISHING') finishing = value;
    });

    const displayedDruk = rawJumlahDruk + totalInsheet;
    const jumlahLP = Math.ceil(displayedDruk / bagian);

    return {
      jumlah_druk: rawJumlahDruk,
      jumlah_insheet_cetak: cetak,
      jumlah_insheet_pond: pond,
      jumlah_insheet_finishing: finishing,
      total_insheet: totalInsheet,
      jumlah_lp: jumlahLP,
    };
  };

  const handleQtyChange = (newQty: number) => {
    if (selectedMounting && !isManualInsheet) {
      const newInsheet = calculateInsheet(newQty, selectedMounting);
      onChange({ qty: newQty, insheetValues: newInsheet });
    } else {
      onChange({ qty: newQty });
    }
  };

  const handleMountingSelect = (mountingId: number) => {
    if (selectedMountingId === mountingId) {
      onChange({ selectedMounting: null, insheetValues: emptyInsheet() });
    } else {
      const m = mountingData.find((m) => m.id === mountingId);
      if (m) {
        const newInsheet = qty > 0 ? calculateInsheet(qty, m) : emptyInsheet();
        onChange({ selectedMounting: mountingId, insheetValues: newInsheet });
      }
    }
  };

  const handleTotalInsheetChange = (totalValue: number) => {
    if (!selectedMounting) return;
    setIsManualInsheet(true);
    setTimeout(() => setIsManualInsheet(false), 200);

    const isi1 = selectedMounting.ukuran_cetak_isi_1 || 0;
    const isi2 = selectedMounting.ukuran_cetak_isi_2 || 0;
    const totalIsi = isi1 + isi2 || 1;
    const bagian = selectedMounting.ukuran_cetak_bagian_1 || 1;
    const totalPercentage =
      prosesInsheetData.reduce(
        (s: number, p: any) => s + p.persentase_insheet,
        0,
      ) || 1;

    let cetak = 0,
      pond = 0,
      finishing = 0;
    prosesInsheetData.forEach((proses: any) => {
      const value = Math.ceil(
        (totalValue * proses.persentase_insheet) / totalPercentage,
      );
      const name = proses.proses.toUpperCase();
      if (name === 'CETAK') cetak = value;
      else if (name === 'POND' || name === 'PONDS' || name === 'PONDING')
        pond = value;
      else if (name === 'FINISHING') finishing = value;
    });

    const currentRawDruk = insheetValues.jumlah_druk;
    const displayedDruk = currentRawDruk + totalValue;
    const calculatedQty = displayedDruk * totalIsi;
    const jumlahLP = Math.ceil(displayedDruk / bagian);

    onChange({
      qty: calculatedQty,
      insheetValues: {
        jumlah_druk: currentRawDruk,
        jumlah_insheet_cetak: cetak,
        jumlah_insheet_pond: pond,
        jumlah_insheet_finishing: finishing,
        total_insheet: totalValue,
        jumlah_lp: jumlahLP,
      },
    });
  };

  // Derived display values
  const displayedJumlahDruk =
    insheetValues.jumlah_druk + insheetValues.total_insheet;
  const isi1 = selectedMounting?.ukuran_cetak_isi_1 || 0;
  const isi2 = selectedMounting?.ukuran_cetak_isi_2 || 0;
  const totalIsi = isi1 + isi2 || 1;
  const bagian = selectedMounting?.ukuran_cetak_bagian_1 || 1;
  const calculatedRawDruk = Math.ceil(qty / totalIsi);
  const ketentuan = getKetentuanInsheet(calculatedRawDruk);
  const expectedTotalInsheet = ketentuan.is_persentase
    ? Math.ceil((calculatedRawDruk * ketentuan.nilai) / 100)
    : ketentuan.nilai ?? 0;

  // Block reasons for selected mounting
  const selectedTahapan = selectedMounting?.tahapan ?? [];
  const blockReasons: string[] = [];
  if (selectedMounting) {
    if (!selectedMounting.spesifikasi?.trim())
      blockReasons.push('Spesifikasi belum diisi pada mounting');
    if (selectedTahapan.length === 0) blockReasons.push('Tahapan belum diset');
    else {
      if (selectedTahapan.some((t) => t.id_drying_time === null))
        blockReasons.push('Drying time belum diset pada tahapan');
      if (selectedTahapan.some((t) => t.id_setting_kapasitas === null))
        blockReasons.push('Kapasitas belum diset pada tahapan');
    }
  }

  return (
    <div className="border border-purple-200 rounded-lg p-3 bg-purple-50 space-y-3">
      {/* ── Row header ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          JO PRODUKSI #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 transition-colors"
          title="Hapus"
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
      </div>

      {/* ── Generated JO number preview ── */}
      <div className="rounded-md border border-purple-300 bg-white px-3 py-2 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">
            No JO (Preview)
          </p>
          <p className="text-sm font-bold text-purple-800 font-mono tracking-wide truncate">
            {previewJONumber}
          </p>
        </div>
        <span className="flex-shrink-0 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium">
          AUTO
        </span>
      </div>

      {/* ── Quantity ── */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Quantity Produksi <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={qty}
          min={1}
          onChange={(e) => handleQtyChange(Number(e.target.value))}
          className="w-full px-2 py-1.5 text-sm border-2 border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-purple-700"
          placeholder="Masukkan qty"
        />
      </div>

      {/* ── Mounting list ── */}
      {entry.loadingMounting ? (
        <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500" />
          Memuat data mounting...
        </div>
      ) : mountingData.length === 0 ? (
        <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-md px-3 py-2 bg-white">
          Pilih SO terlebih dahulu untuk melihat mounting
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">
            Pilih Mounting <span className="text-red-500">*</span>
          </p>
          <div className="space-y-2">
            {mountingData.map((mounting) => {
              const isSelected = selectedMountingId === mounting.id;
              const tahapan = mounting.tahapan ?? [];
              const hasBlockIssue =
                !mounting.spesifikasi?.trim() ||
                tahapan.length === 0 ||
                tahapan.some(
                  (t) =>
                    t.id_drying_time === null ||
                    t.id_setting_kapasitas === null,
                );

              return (
                <div
                  key={mounting.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-300'
                      : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleMountingSelect(mounting.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleMountingSelect(mounting.id)}
                      className="w-4 h-4 text-purple-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold text-sm text-gray-800 flex-1">
                      {mounting.nama_mounting}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
                        TERPILIH
                      </span>
                    )}
                    {hasBlockIssue && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        ⚠ Tidak Lengkap
                      </span>
                    )}
                  </div>

                  {/* Mounting quick info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-gray-600 ml-6">
                    <span>
                      Kertas:{' '}
                      <span className="font-medium text-gray-800">
                        {mounting.jenis_kertas || '-'}
                      </span>
                    </span>
                    <span>
                      Gramature:{' '}
                      <span className="font-medium text-gray-800">
                        {mounting.gramature_kertas || '-'}
                      </span>
                    </span>
                    <span>
                      Plano:{' '}
                      <span className="font-medium text-gray-800">
                        {mounting.panjang_plano}×{mounting.lebar_plano}
                      </span>
                    </span>
                    <span>
                      Bagian/Isi:{' '}
                      <span className="font-medium text-gray-800">
                        {mounting.ukuran_cetak_bagian_1}/
                        {mounting.ukuran_cetak_isi_1}
                      </span>
                    </span>
                    {mounting.spesifikasi && (
                      <span className="col-span-2 truncate">
                        Spesifikasi:{' '}
                        <span className="font-medium text-gray-800">
                          {mounting.spesifikasi}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Block reasons for this mounting */}
                  {hasBlockIssue && (
                    <TahapanBlockReasons
                      tahapan={tahapan}
                      spesifikasi={mounting.spesifikasi}
                    />
                  )}

                  {/* Selected: show calculation summary */}
                  {isSelected && (
                    <div className="mt-2 ml-6 grid grid-cols-3 gap-2">
                      <div className="bg-white border border-purple-200 rounded px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-500">Jumlah Druk</p>
                        <p className="text-sm font-bold text-blue-700">
                          {displayedJumlahDruk.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white border border-purple-200 rounded px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-500">
                          Total Insheet
                        </p>
                        <p className="text-sm font-bold text-orange-700">
                          {insheetValues.total_insheet.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white border border-purple-200 rounded px-2 py-1.5 text-center">
                        <p className="text-[10px] text-gray-500">Jumlah LP</p>
                        <p className="text-sm font-bold text-purple-700">
                          {insheetValues.jumlah_lp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Block reasons banner for selected mounting ── */}
      {selectedMounting && blockReasons.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-md px-3 py-2">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div>
            <p className="text-xs font-semibold text-red-700">
              JO tidak dapat dibuat — selesaikan dulu:
            </p>
            <ul className="list-disc list-inside space-y-0.5 mt-0.5">
              {blockReasons.map((r, i) => (
                <li key={i} className="text-xs text-red-600">
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Insheet calculation (visible when mounting selected) ── */}
      {selectedMounting && (
        <div className="border border-purple-200 rounded-lg bg-white p-3 space-y-3">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
            Perhitungan Insheet — {selectedMounting.nama_mounting}
          </p>

          {/* Formula box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-[11px] space-y-1">
            <div className="font-semibold text-blue-900 mb-1">Formula:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
              <div>
                <span className="font-medium">RAW Druk:</span>{' '}
                {qty.toLocaleString()} / ({isi1}
                {isi2 ? `+${isi2}` : ''}) ={' '}
                <span className="font-bold text-blue-700">
                  {calculatedRawDruk.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Insheet (ketentuan):</span>{' '}
                <span className="font-bold text-orange-700">
                  {expectedTotalInsheet.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Jumlah Druk:</span>{' '}
                {insheetValues.jumlah_druk.toLocaleString()} +{' '}
                {insheetValues.total_insheet.toLocaleString()} ={' '}
                <span className="font-bold text-green-700">
                  {displayedJumlahDruk.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium">Jumlah LP:</span>{' '}
                {displayedJumlahDruk.toLocaleString()} / {bagian} ={' '}
                <span className="font-bold text-purple-700">
                  {insheetValues.jumlah_lp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Qty', val: qty, color: 'text-gray-800' },
              {
                label: 'Jml Druk',
                val: displayedJumlahDruk,
                color: 'text-blue-700',
              },
              {
                label: 'Total Insheet',
                val: insheetValues.total_insheet,
                color: 'text-orange-700',
              },
              {
                label: 'Jumlah LP',
                val: insheetValues.jumlah_lp,
                color: 'text-purple-700',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-center"
              >
                <p className="text-[10px] text-gray-500">{item.label}</p>
                <p className={`text-sm font-bold ${item.color}`}>
                  {item.val.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Editable total insheet */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-md p-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Edit Total Insheet{' '}
              <span className="text-[10px] font-normal text-gray-500">
                (akan mengubah Qty & distribusi)
              </span>
            </label>
            <input
              type="number"
              value={insheetValues.total_insheet}
              min={0}
              onChange={(e) => handleTotalInsheetChange(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-yellow-400 rounded text-center font-bold text-xl text-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Expected dari ketentuan:{' '}
              <span className="font-bold">
                {expectedTotalInsheet.toLocaleString()}
              </span>
            </p>
          </div>

          {/* Process distribution table */}
          <table className="w-full text-xs border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1.5 border text-left font-medium text-gray-700">
                  Proses
                </th>
                <th className="px-2 py-1.5 border text-center font-medium text-gray-700">
                  %
                </th>
                <th className="px-2 py-1.5 border text-center font-medium text-gray-700">
                  Jumlah Insheet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {prosesInsheetData.map((proses: any) => {
                let name = proses.proses.toUpperCase();
                if (name === 'PONDS' || name === 'PONDING') name = 'POND';
                let val = 0;
                if (name === 'CETAK') val = insheetValues.jumlah_insheet_cetak;
                else if (name === 'POND')
                  val = insheetValues.jumlah_insheet_pond;
                else if (name === 'FINISHING')
                  val = insheetValues.jumlah_insheet_finishing;
                return (
                  <tr key={proses.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border font-medium">
                      {proses.proses}
                    </td>
                    <td className="px-2 py-1 border text-center">
                      {proses.persentase_insheet}%
                    </td>
                    <td className="px-2 py-1 border text-center font-semibold">
                      {Math.ceil(val).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-bold">
                <td className="px-2 py-1 border" colSpan={2}>
                  Total
                </td>
                <td className="px-2 py-1 border text-center text-orange-700">
                  {insheetValues.total_insheet.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Sub-component: FG Picker row ──────────────────────────────────────────────

interface FGPickerProps {
  fgList: FGItem[];
  entry: KanbanEntry;
  onChange: (patch: Partial<KanbanEntry>) => void;
  onRemove: () => void;
}

const FGPickerRow: React.FC<FGPickerProps> = ({
  fgList,
  entry,
  onChange,
  onRemove,
}) => {
  const selectedFG = entry.fgItem;
  const maxQty = selectedFG?.jumlah_qty_sisa ?? 0;

  // Extract mounting info from FG's data_jo
  const fgJOMounting = selectedFG?.data_jo?.jo_mounting ?? [];
  const selectedJOMounting =
    fgJOMounting.find((m: any) => m.is_selected) ?? fgJOMounting[0] ?? null;

  return (
    <div className="border border-teal-200 rounded-lg p-3 bg-teal-50 space-y-2">
      {/* ── Row header ── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          FG (JO KANBAN)
        </span>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 transition-colors"
          title="Hapus"
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
      </div>

      {/* ── FG selector ── */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Pilih No JO FG <span className="text-red-500">*</span>
        </label>
        {fgList.length === 0 ? (
          <div className="w-full px-3 py-2 text-xs text-gray-400 border border-dashed border-gray-300 rounded-md bg-white">
            Tidak ada stok FG tersedia untuk SO ini
          </div>
        ) : (
          <SearchableSelect
            options={[
              { value: 0, label: 'Pilih FG' },
              ...fgList.map((fg) => ({
                value: fg.id_jo,
                label: `${fg.no_jo} — ${fg.produk} — Stok: ${(
                  fg.jumlah_qty_sisa ?? 0
                ).toLocaleString()}`,
              })),
            ]}
            value={entry.fgItem?.id_jo ?? 0}
            onChange={(val) => {
              const found = fgList.find((f) => f.id_jo === Number(val));
              onChange({
                fgItem: found,
                takenQty: found ? found.jumlah_qty_sisa ?? 0 : 0,
              });
            }}
            placeholder="Pilih FG"
            disabled={false}
          />
        )}
      </div>

      {/* ── Selected FG detail card ── */}
      {selectedFG && (
        <>
          <div className="rounded-md border border-teal-300 bg-white p-3 space-y-2">
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide">
              Info FG yang Dipilih
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="col-span-2 flex items-center gap-2 bg-teal-50 rounded px-2 py-1.5 border border-teal-200">
                <div>
                  <span className="text-gray-500">No JO Sumber (FG):</span>{' '}
                  <span className="font-bold text-teal-800">
                    {selectedFG.no_jo}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                  Customer
                </span>
                <span className="font-medium text-gray-800 truncate">
                  {selectedFG.customer}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                  Produk
                </span>
                <span className="font-medium text-gray-800 truncate">
                  {selectedFG.produk}
                </span>
              </div>
              {selectedFG.no_so && (
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                    No SO Sumber
                  </span>
                  <span className="font-medium text-gray-800">
                    {selectedFG.no_so}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                  Total Qty FG
                </span>
                <span className="font-medium text-gray-800">
                  {(selectedFG.jumlah_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] uppercase tracking-wide">
                  Qty Keluar
                </span>
                <span className="font-medium text-orange-600">
                  {(selectedFG.jumlah_qty_keluar ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-between bg-green-50 border border-green-200 rounded px-2 py-1.5">
                <span className="text-gray-600 text-xs">
                  Stok Tersedia (Sisa):
                </span>
                <span className="font-bold text-green-700 text-sm">
                  {maxQty.toLocaleString()} unit
                </span>
              </div>
            </div>
          </div>

          {/* FG Mounting info (read-only, taken directly from FG data_jo) */}
          {selectedJOMounting && (
            <div className="rounded-md border border-teal-300 bg-white p-3 space-y-1.5">
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                  />
                </svg>
                Data Mounting dari FG{' '}
                <span className="text-[10px] font-normal text-teal-600 bg-teal-100 px-1.5 py-0.5 rounded-full ml-1">
                  Diambil otomatis
                </span>
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600">
                <span>
                  Nama Mounting:{' '}
                  <span className="font-medium text-gray-800">
                    {selectedJOMounting.nama_mounting || '-'}
                  </span>
                </span>
                <span>
                  Kertas:{' '}
                  <span className="font-medium text-gray-800">
                    {selectedJOMounting.nama_kertas || '-'}
                  </span>
                </span>
                <span>
                  Gramature:{' '}
                  <span className="font-medium text-gray-800">
                    {selectedJOMounting.gramature_kertas || '-'}
                  </span>
                </span>
                <span>
                  Plano (P×L):{' '}
                  <span className="font-medium text-gray-800">
                    {selectedJOMounting.panjang_kertas}×
                    {selectedJOMounting.lebar_kertas}
                  </span>
                </span>
                <span>
                  Jumlah Druk:{' '}
                  <span className="font-medium text-blue-700">
                    {(
                      selectedJOMounting.jumlah_druk_cetak ?? 0
                    ).toLocaleString()}
                  </span>
                </span>
                <span>
                  Total Insheet:{' '}
                  <span className="font-medium text-orange-700">
                    {(selectedJOMounting.total_insheet ?? 0).toLocaleString()}
                  </span>
                </span>
                <span>
                  Jumlah LP:{' '}
                  <span className="font-medium text-purple-700">
                    {(selectedJOMounting.jumlah_kertas ?? 0).toLocaleString()}
                  </span>
                </span>
                <span>
                  Insheet Cetak:{' '}
                  <span className="font-medium text-gray-800">
                    {(
                      selectedJOMounting.jumlah_insheet_cetak ?? 0
                    ).toLocaleString()}
                  </span>
                </span>
                <span>
                  Insheet Pond:{' '}
                  <span className="font-medium text-gray-800">
                    {(
                      selectedJOMounting.jumlah_insheet_pond ?? 0
                    ).toLocaleString()}
                  </span>
                </span>
                <span>
                  Insheet Finishing:{' '}
                  <span className="font-medium text-gray-800">
                    {(
                      selectedJOMounting.jumlah_insheet_finishing ?? 0
                    ).toLocaleString()}
                  </span>
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-teal-600 bg-teal-50 rounded px-2 py-1 border border-teal-200">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Data mounting diambil langsung dari JO FG asal dan akan
                disertakan dalam payload untuk keperluan cetak.
              </div>
            </div>
          )}

          {/* Qty ambil input */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Qty Ambil{' '}
              <span className="text-xs text-gray-500">
                (maks {maxQty.toLocaleString()})
              </span>
            </label>
            <input
              type="number"
              value={entry.takenQty ?? 0}
              min={1}
              max={maxQty}
              onChange={(e) =>
                onChange({ takenQty: Math.min(Number(e.target.value), maxQty) })
              }
              className="w-full px-2 py-1.5 text-sm border-2 border-teal-400 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-teal-700"
            />
            {maxQty > 0 && (
              <div className="mt-1.5">
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Proporsi diambil</span>
                  <span>
                    {Math.round(((entry.takenQty ?? 0) / maxQty) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((entry.takenQty ?? 0) / maxQty) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── FG Info Panel (right side) ────────────────────────────────────────────────

interface FGInfoPanelProps {
  entries: KanbanEntry[];
  soPoQty: number;
  produksiJOPreview: string;
}

const FGInfoPanel: React.FC<FGInfoPanelProps> = ({
  entries,
  soPoQty,
  produksiJOPreview,
}) => {
  const totalProduksi = entries
    .filter((e) => e.type === 'JO PRODUKSI')
    .reduce((s, e) => s + (e.qty || 0), 0);
  const totalFG = entries
    .filter((e) => e.type === 'JO KANBAN')
    .reduce((s, e) => s + (e.takenQty || 0), 0);
  const grandTotal = totalProduksi + totalFG;
  const diff = grandTotal - soPoQty;
  const isOver = diff > 0;

  const fgEntries = entries.filter((e) => e.type === 'JO KANBAN' && e.fgItem);
  const produksiEntry = entries.find((e) => e.type === 'JO PRODUKSI');

  return (
    <div className="space-y-4 h-full">
      <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
        Info JO Kanban
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">PO QTY (SO)</p>
          <p className="text-xl font-bold text-gray-800">
            {soPoQty.toLocaleString()}
          </p>
        </div>
        <div
          className={`rounded-lg p-3 border ${
            isOver
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">Grand Total QTY</p>
          <p
            className={`text-xl font-bold ${
              isOver ? 'text-yellow-700' : 'text-green-700'
            }`}
          >
            {grandTotal.toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-xs text-gray-500 mb-1">Total Produksi</p>
          <p className="text-xl font-bold text-purple-700">
            {totalProduksi.toLocaleString()}
          </p>
        </div>
        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-500 mb-1">Total dari FG</p>
          <p className="text-xl font-bold text-teal-700">
            {totalFG.toLocaleString()}
          </p>
        </div>
      </div>

      {soPoQty > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress vs PO QTY</span>
            <span>
              {Math.min(100, Math.round((grandTotal / soPoQty) * 100))}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOver ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (grandTotal / soPoQty) * 100)}%`,
              }}
            />
          </div>
          {isOver ? (
            <p className="text-xs text-yellow-600 mt-1">
              ⚠ Melebihi PO QTY sebesar {diff.toLocaleString()} unit
            </p>
          ) : grandTotal > 0 ? (
            <p className="text-xs text-gray-500 mt-1">
              Sisa: {(soPoQty - grandTotal).toLocaleString()} unit
            </p>
          ) : null}
        </div>
      )}

      {/* JO Produksi summary */}
      {produksiEntry && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            JO Produksi yang Akan Dibuat
          </h4>
          <div className="bg-white rounded-lg border border-purple-200 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between bg-purple-50 rounded px-2 py-1.5 border border-purple-200">
              <span className="text-gray-500">No JO (Generated):</span>
              <span className="font-bold text-purple-800 font-mono">
                {produksiJOPreview}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Qty Produksi:</span>
              <span className="font-semibold text-purple-700">
                {(produksiEntry.qty ?? 0).toLocaleString()} unit
              </span>
            </div>
            {produksiEntry.selectedMounting && produksiEntry.mountingData && (
              <>
                {(() => {
                  const m = produksiEntry.mountingData!.find(
                    (m) => m.id === produksiEntry.selectedMounting,
                  );
                  return m ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Mounting:</span>
                        <span className="font-semibold text-gray-800">
                          {m.nama_mounting}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Spesifikasi:</span>
                        <span className="font-semibold text-gray-800 truncate max-w-[60%] text-right">
                          {m.spesifikasi || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Jumlah Druk:</span>
                        <span className="font-semibold text-blue-700">
                          {(
                            (produksiEntry.insheetValues?.jumlah_druk ?? 0) +
                            (produksiEntry.insheetValues?.total_insheet ?? 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Total Insheet:</span>
                        <span className="font-semibold text-orange-700">
                          {(
                            produksiEntry.insheetValues?.total_insheet ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Jumlah LP:</span>
                        <span className="font-semibold text-purple-700">
                          {(
                            produksiEntry.insheetValues?.jumlah_lp ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>
                    </>
                  ) : null;
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* FG detail list */}
      {fgEntries.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Detail FG Dipilih
          </h4>
          <div className="space-y-2">
            {fgEntries.map((e) => {
              const fgJOMounting = e.fgItem?.data_jo?.jo_mounting ?? [];
              const selectedM =
                fgJOMounting.find((m: any) => m.is_selected) ??
                fgJOMounting[0] ??
                null;
              return (
                <div
                  key={e.id}
                  className="bg-white rounded-lg border border-teal-200 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between bg-teal-50 rounded px-2 py-1 border border-teal-200">
                    <span className="text-gray-500">No JO Sumber (FG):</span>
                    <span className="font-bold text-teal-800">
                      {e.fgItem!.no_jo}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-gray-600">
                    <span>Produk:</span>
                    <span className="font-medium text-gray-800 truncate">
                      {e.fgItem!.produk}
                    </span>
                    <span>Customer:</span>
                    <span className="font-medium text-gray-800 truncate">
                      {e.fgItem!.customer}
                    </span>
                    {e.fgItem!.no_so && (
                      <>
                        <span>No SO Sumber:</span>
                        <span className="font-medium text-gray-800">
                          {e.fgItem!.no_so}
                        </span>
                      </>
                    )}
                    <span>Stok Sisa:</span>
                    <span className="font-medium text-green-700">
                      {(e.fgItem!.jumlah_qty_sisa ?? 0).toLocaleString()}
                    </span>
                    <span>Qty Ambil:</span>
                    <span className="font-semibold text-teal-700">
                      {(e.takenQty ?? 0).toLocaleString()}
                    </span>
                    {selectedM && (
                      <>
                        <span>Mounting:</span>
                        <span className="font-medium text-gray-800">
                          {selectedM.nama_mounting || '-'}
                        </span>
                        <span>Jumlah Druk:</span>
                        <span className="font-medium text-blue-700">
                          {(selectedM.jumlah_druk_cetak ?? 0).toLocaleString()}
                        </span>
                        <span>Total Insheet:</span>
                        <span className="font-medium text-orange-700">
                          {(selectedM.total_insheet ?? 0).toLocaleString()}
                        </span>
                        <span>Jumlah LP:</span>
                        <span className="font-medium text-purple-700">
                          {(selectedM.jumlah_kertas ?? 0).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <svg
            className="w-10 h-10 mb-2 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm">Belum ada JO ditambahkan</p>
        </div>
      )}
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────

const JOKanbanModal: React.FC<JOKanbanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [soData, setSOData] = useState<SOData[]>([]);
  const [selectedSO, setSelectedSO] = useState<SOData | null>(null);
  const [fgList, setFGList] = useState<FGItem[]>([]);
  const [loadingFG, setLoadingFG] = useState(false);
  const [entries, setEntries] = useState<KanbanEntry[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [jumlahJO, setJumlahJO] = useState(0);
  const [ketentuanInsheetData, setKetentuanInsheetData] = useState<any[]>([]);
  const [prosesInsheetData, setProsesInsheetData] = useState<any[]>([]);
  // ← NEW: customer toleransi fetched after SO selection
  const [toleransi, setToleransi] = useState<string>('');

  // ── Fetch on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    fetchSOData();
    fetchJumlahJO();
    fetchKetentuanInsheet();
    fetchProsesInsheet();
  }, [isOpen]);

  const fetchSOData = async () => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/so`,
        {
          params: { is_jo_done: false },
          withCredentials: true,
        },
      );
      setSOData(res.data.data || []);
    } catch {
      setSOData([]);
    }
  };

  const fetchFGByJO = async (idIO: number) => {
    setLoadingFG(true);
    setFGList([]);
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/gudangFinishGoodByJo`,
        { params: { id_io: idIO }, withCredentials: true },
      );
      setFGList(res.data.data || []);
    } catch {
      setFGList([]);
    } finally {
      setLoadingFG(false);
    }
  };

  const fetchJumlahJO = async () => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/ppic/joJumlahData`,
        { withCredentials: true },
      );
      setJumlahJO(res.data.total_data ?? 0);
    } catch {
      setJumlahJO(0);
    }
  };

  const fetchKetentuanInsheet = async () => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/ketentuanInsheet`,
        { withCredentials: true },
      );

      setKetentuanInsheetData(res.data.data || []);
    } catch {
      setKetentuanInsheetData([]);
    }
  };

  const fetchProsesInsheet = async () => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/prosesInsheet`,
        { withCredentials: true },
      );

      setProsesInsheetData(res.data.data || []);
    } catch {
      setProsesInsheetData([]);
    }
  };

  // ← NEW: fetch customer toleransi (same as JOPPICCreateModal)
  const fetchCustomerData = async (idCus: number) => {
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/marketing/customer/${idCus}`,
        { withCredentials: true },
      );
      setToleransi(res.data.data?.toleransi_pengiriman || '');
    } catch {
      setToleransi('');
    }
  };

  const fetchMountingForEntry = async (entryId: string, idIO: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, loadingMounting: true } : e)),
    );
    try {
      const res: AxiosResponse = await axios.get(
        `${import.meta.env.VITE_API_LINK}/marketing/io/${idIO}`,
        { withCredentials: true },
      );
      const mountings: MountingData[] = res.data.data?.io_mounting || [];
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, mountingData: mountings, loadingMounting: false }
            : e,
        ),
      );
    } catch {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, mountingData: [], loadingMounting: false }
            : e,
        ),
      );
    }
  };

  // ── SO change ─────────────────────────────────────────────────────────────
  const handleSOChange = (soId: number) => {
    const so = soData.find((s) => s.id === soId) ?? null;
    setSelectedSO(so);
    setEntries([]);
    setFGList([]);
    setToleransi('');
    if (so) {
      fetchFGByJO(so.id_io);
      fetchCustomerData(so.id_customer); // ← NEW
    }
  };

  // ── Generate JO number ────────────────────────────────────────────────────
  const generateJONumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const num = String(jumlahJO + 1).padStart(5, '0');
    return `JO-${num}/${month}/${year}`;
  };

  // ── Build jo_mounting payload for JO PRODUKSI ─────────────────────────────
  const buildProduksiJOMounting = (entry: KanbanEntry) => {
    const mountingData = entry.mountingData ?? [];
    const selectedId = entry.selectedMounting;
    const insheet = entry.insheetValues ?? emptyInsheet();
    const displayedDruk = insheet.jumlah_druk + insheet.total_insheet;

    return mountingData.map((m) => {
      const isSelected = m.id === selectedId;
      if (isSelected) {
        return {
          id: null,
          id_jo: null,
          id_io_mounting: m.id,
          id_kertas: m.id_kertas,
          nama_kertas: m.nama_kertas,
          nama_mounting: m.nama_mounting,
          gramature_kertas: m.gramature_kertas,
          panjang_kertas: m.panjang_plano,
          lebar_kertas: m.lebar_plano,
          jumlah_kertas: insheet.jumlah_lp,
          ukuran_cetak_panjang_1: m.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: m.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: m.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: m.ukuran_cetak_isi_1,
          jumlah_cetak_1: 0,
          tambahan_insheet_1: 0,
          ukuran_cetak_panjang_2: m.ukuran_cetak_panjang_2 || 0,
          ukuran_cetak_lebar_2: m.ukuran_cetak_lebar_2 || 0,
          ukuran_cetak_bagian_2: m.ukuran_cetak_bagian_2 || 0,
          ukuran_cetak_isi_2: m.ukuran_cetak_isi_2 || 0,
          jumlah_cetak_2: 0,
          tambahan_insheet_2: 0,
          jumlah_druk_cetak: displayedDruk,
          jumlah_insheet_cetak: insheet.jumlah_insheet_cetak,
          jumlah_druk_pond: displayedDruk,
          jumlah_insheet_pond: insheet.jumlah_insheet_pond,
          jumlah_druk_finishing: displayedDruk,
          jumlah_insheet_finishing: insheet.jumlah_insheet_finishing,
          total_insheet: insheet.total_insheet,
          is_selected: true,
        };
      } else {
        return {
          id: null,
          id_jo: null,
          id_io_mounting: m.id,
          nama_mounting: m.nama_mounting,
          id_kertas: m.id_kertas,
          nama_kertas: m.nama_kertas,
          gramature_kertas: m.gramature_kertas,
          panjang_kertas: m.panjang_plano,
          lebar_kertas: m.lebar_plano,
          jumlah_kertas: 0,
          ukuran_cetak_panjang_1: m.ukuran_cetak_panjang_1,
          ukuran_cetak_lebar_1: m.ukuran_cetak_lebar_1,
          ukuran_cetak_bagian_1: m.ukuran_cetak_bagian_1,
          ukuran_cetak_isi_1: m.ukuran_cetak_isi_1,
          jumlah_cetak_1: 0,
          tambahan_insheet_1: 0,
          ukuran_cetak_panjang_2: m.ukuran_cetak_panjang_2 || 0,
          ukuran_cetak_lebar_2: m.ukuran_cetak_lebar_2 || 0,
          ukuran_cetak_bagian_2: m.ukuran_cetak_bagian_2 || 0,
          ukuran_cetak_isi_2: m.ukuran_cetak_isi_2 || 0,
          jumlah_cetak_2: 0,
          tambahan_insheet_2: 0,
          jumlah_druk_cetak: 0,
          jumlah_insheet_cetak: 0,
          jumlah_druk_pond: 0,
          jumlah_insheet_pond: 0,
          jumlah_druk_finishing: 0,
          jumlah_insheet_finishing: 0,
          total_insheet: 0,
          is_selected: false,
        };
      }
    });
  };

  // ── Build jo_mounting payload for JO KANBAN (from FG, no calc — direct copy) ──
  const buildKanbanJOMounting = (entry: KanbanEntry) => {
    const fgJOMounting: any[] = entry.fgItem?.data_jo?.jo_mounting ?? [];
    if (fgJOMounting.length === 0) return [];
    return fgJOMounting.map((m: any) => ({
      id: null,
      id_jo: null,
      id_io_mounting: m.id_io_mounting,
      id_kertas: m.id_kertas,
      nama_kertas: m.nama_kertas,
      nama_mounting: m.nama_mounting,
      gramature_kertas: m.gramature_kertas,
      panjang_kertas: m.panjang_kertas,
      lebar_kertas: m.lebar_kertas,
      jumlah_kertas: m.jumlah_kertas,
      ukuran_cetak_panjang_1: m.ukuran_cetak_panjang_1,
      ukuran_cetak_lebar_1: m.ukuran_cetak_lebar_1,
      ukuran_cetak_bagian_1: m.ukuran_cetak_bagian_1,
      ukuran_cetak_isi_1: m.ukuran_cetak_isi_1,
      jumlah_cetak_1: m.jumlah_cetak_1 ?? 0,
      tambahan_insheet_1: m.tambahan_insheet_1 ?? 0,
      ukuran_cetak_panjang_2: m.ukuran_cetak_panjang_2 ?? 0,
      ukuran_cetak_lebar_2: m.ukuran_cetak_lebar_2 ?? 0,
      ukuran_cetak_bagian_2: m.ukuran_cetak_bagian_2 ?? 0,
      ukuran_cetak_isi_2: m.ukuran_cetak_isi_2 ?? 0,
      jumlah_cetak_2: m.jumlah_cetak_2 ?? 0,
      tambahan_insheet_2: m.tambahan_insheet_2 ?? 0,
      jumlah_druk_cetak: m.jumlah_druk_cetak ?? 0,
      jumlah_insheet_cetak: m.jumlah_insheet_cetak ?? 0,
      jumlah_druk_pond: m.jumlah_druk_pond ?? 0,
      jumlah_insheet_pond: m.jumlah_insheet_pond ?? 0,
      jumlah_druk_finishing: m.jumlah_druk_finishing ?? 0,
      jumlah_insheet_finishing: m.jumlah_insheet_finishing ?? 0,
      total_insheet: m.total_insheet ?? 0,
      is_selected: m.is_selected ?? true,
    }));
  };

  // ── Build full payload for a single entry ─────────────────────────────────
  const buildPayload = (entry: KanbanEntry) => {
    if (!selectedSO) return {};
    const isKanban = entry.type === 'JO KANBAN';
    const joMounting = isKanban
      ? buildKanbanJOMounting(entry)
      : buildProduksiJOMounting(entry);

    const insheet = entry.insheetValues ?? emptyInsheet();
    const displayedDruk = insheet.jumlah_druk + insheet.total_insheet;

    // For JO PRODUKSI: derive spesifikasi from the selected mounting
    const selectedMounting =
      !isKanban && entry.selectedMounting && entry.mountingData
        ? entry.mountingData.find((m) => m.id === entry.selectedMounting) ??
          null
        : null;

    // For JO KANBAN: derive spesifikasi from the source FG's selected mounting
    const fgSelectedMounting = isKanban
      ? (entry.fgItem?.data_jo?.jo_mounting ?? []).find(
          (m: any) => m.is_selected,
        ) ??
        (entry.fgItem?.data_jo?.jo_mounting ?? [])[0] ??
        null
      : null;

    return {
      // ── Core identifiers (same as before) ──────────────────────────────
      id_so: selectedSO.id,
      id_io: selectedSO.id_io,
      id_customer: selectedSO.id_customer,
      // ← NEW: id_produk was missing
      id_produk: isKanban
        ? entry.fgItem?.id_produk ?? 0
        : selectedSO.id_produk ?? 0,

      // ── JO number ──────────────────────────────────────────────────────
      no_jo: isKanban ? entry.fgItem?.no_jo ?? '' : generateJONumber(),

      // ── References ─────────────────────────────────────────────────────
      no_so: selectedSO.no_so,
      no_io: selectedSO.no_io,
      no_po_customer: selectedSO.no_po_customer, // ← was missing
      customer: selectedSO.customer,
      produk: selectedSO.produk,
      po_qty: selectedSO.po_qty,

      // ── Delivery / product info ─────────────────────────────────────────
      alamat_pengiriman: selectedSO.alamat_pengiriman || '',
      standar_warna: selectedSO.ada_standar_warna || '',
      status_produk: selectedSO.status_produk || '',
      tgl_kirim: selectedSO.tgl_pengiriman
        ? selectedSO.tgl_pengiriman.split('T')[0]
        : new Date().toISOString().split('T')[0],

      // ← NEW: toleransi from customer API (fetched on SO select)
      toleransi,

      // ── JO type & quantities ───────────────────────────────────────────
      tipe_jo: entry.type,
      qty: isKanban ? 0 : entry.qty ?? 0,
      stok_fg: isKanban ? entry.takenQty ?? 0 : 0,
      id_fg: isKanban ? entry.fgItem?.id_jo ?? null : null,

      // ← NEW: qty_druk and qty_lp (jumlah druk cetak & jumlah LP)
      qty_druk: isKanban ? 0 : displayedDruk,
      qty_lp: isKanban ? 0 : insheet.jumlah_lp,

      // ← NEW: spesifikasi from selected mounting
      spesifikasi: isKanban
        ? fgSelectedMounting?.spesifikasi ?? ''
        : selectedMounting?.spesifikasi ?? '',

      // ← NEW: keterangan_pengerjaan (empty default — no UI field yet)
      keterangan_pengerjaan: '',

      // ── Mounting payload ───────────────────────────────────────────────
      jo_mounting: joMounting,
    };
  };

  // ── Entry management ──────────────────────────────────────────────────────
  const hasProduksi = (prev: KanbanEntry[]) =>
    prev.some((e) => e.type === 'JO PRODUKSI');

  const addEntry = (type: KanbanEntryType) => {
    if (type === 'JO PRODUKSI' && hasProduksi(entries)) {
      alert('Hanya boleh ada 1 JO PRODUKSI dalam satu batch.');
      setShowTypeSelector(false);
      return;
    }
    const newEntry: KanbanEntry = {
      id: uid(),
      type,
      qty: type === 'JO PRODUKSI' ? 0 : undefined,
      takenQty: 0,
      selectedMounting: null,
      mountingData: [],
      insheetValues: emptyInsheet(),
      loadingMounting: false,
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowTypeSelector(false);

    if (type === 'JO PRODUKSI' && selectedSO) {
      setTimeout(() => {
        fetchMountingForEntry(newEntry.id, selectedSO.id_io);
      }, 0);
    }
  };

  const updateEntry = (id: string, patch: Partial<KanbanEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): string[] => {
    const errors: string[] = [];
    if (!selectedSO) {
      errors.push('Pilih SO terlebih dahulu.');
      return errors;
    }
    if (entries.length === 0) {
      errors.push('Tambahkan minimal 1 JO.');
      return errors;
    }

    entries.forEach((e, i) => {
      if (e.type === 'JO PRODUKSI') {
        if (!e.qty || e.qty <= 0)
          errors.push(`JO PRODUKSI #${i + 1}: Qty harus > 0.`);
        if (!e.selectedMounting)
          errors.push(`JO PRODUKSI #${i + 1}: Pilih mounting terlebih dahulu.`);
        if (e.selectedMounting && e.mountingData) {
          const m = e.mountingData.find((m) => m.id === e.selectedMounting);
          if (m) {
            const tahapan = m.tahapan ?? [];
            if (!m.spesifikasi?.trim())
              errors.push(
                `JO PRODUKSI #${i + 1}: Spesifikasi mounting belum diisi.`,
              );
            if (tahapan.length === 0)
              errors.push(
                `JO PRODUKSI #${i + 1}: Tahapan mounting belum diset.`,
              );
            else {
              if (tahapan.some((t) => t.id_drying_time === null))
                errors.push(`JO PRODUKSI #${i + 1}: Drying time belum diset.`);
              if (tahapan.some((t) => t.id_setting_kapasitas === null))
                errors.push(`JO PRODUKSI #${i + 1}: Kapasitas belum diset.`);
            }
          }
        }
      }
      if (e.type === 'JO KANBAN') {
        if (!e.fgItem?.id_jo)
          errors.push(`FG entry #${i + 1}: Pilih FG terlebih dahulu.`);
        if (e.fgItem?.id_jo && (!e.takenQty || e.takenQty <= 0))
          errors.push(`FG entry #${i + 1}: Qty ambil harus > 0.`);
      }
    });
    return errors;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      alert('Validasi gagal:\n' + errors.map((e) => `• ${e}`).join('\n'));
      return;
    }

    const totalQty = entries.reduce((sum, e) => {
      if (e.type === 'JO PRODUKSI') return sum + (e.qty || 0);
      if (e.type === 'JO KANBAN') return sum + (e.takenQty || 0);
      return sum;
    }, 0);

    if (totalQty > (selectedSO?.po_qty ?? 0)) {
      const ok = window.confirm(
        `Total qty (${totalQty.toLocaleString()}) melebihi PO QTY SO (${(
          selectedSO?.po_qty ?? 0
        ).toLocaleString()}).\nLanjutkan?`,
      );
      if (!ok) return;
    }

    const jobOrders = entries.map((entry) => buildPayload(entry));

    try {
      setLoading(true);
      console.log('Submitting payload:', jobOrders);
      const res: AxiosResponse = await axios.post(
        `${import.meta.env.VITE_API_LINK}/ppic/joKanban`,
        { job_orders: jobOrders },
        { withCredentials: true },
      );
      if (res.data.success || res.data.succes) {
        alert('JO Kanban berhasil dibuat!');
        onSuccess();
        handleClose();
      } else {
        alert(res.data.message || res.data.msg || 'Gagal membuat JO Kanban');
      }
    } catch (error: any) {
      alert(error.response?.data?.msg || 'Gagal membuat JO Kanban');
    } finally {
      setLoading(false);
    }
  };

  // ── Close ─────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setSelectedSO(null);
    setEntries([]);
    setFGList([]);
    setShowTypeSelector(false);
    setToleransi('');
    onClose();
  };

  if (!isOpen) return null;

  const produksiCount = entries.filter((e) => e.type === 'JO PRODUKSI').length;
  const kanbanCount = entries.filter((e) => e.type === 'JO KANBAN').length;
  const produksiJOPreview = generateJONumber();

  const hasProduksiBlockIssues = entries.some((e) => {
    if (e.type !== 'JO PRODUKSI') return false;
    if (!e.selectedMounting || !e.mountingData) return true;
    const m = e.mountingData.find((m) => m.id === e.selectedMounting);
    if (!m) return true;
    const tahapan = m.tahapan ?? [];
    return (
      !m.spesifikasi?.trim() ||
      tahapan.length === 0 ||
      tahapan.some(
        (t) => t.id_drying_time === null || t.id_setting_kapasitas === null,
      )
    );
  });

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="flex items-center justify-center w-full h-full px-4 py-4">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />
        <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg flex flex-col">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
                <h2 className="text-xl font-bold text-white">
                  Tambah JO Kanban
                </h2>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Gabungkan JO Produksi &amp; JO Kanban (dari FG) dalam satu batch
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>

          {/* ── Body: 2-column ── */}
          <div className="flex-1 overflow-hidden flex">
            {/* LEFT: SO selector + entry list */}
            <div className="w-1/2 border-r overflow-y-auto p-6 bg-gray-50 space-y-5">
              {/* SO picker */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 border-b pb-2 mb-3">
                  1. Pilih Sales Order <span className="text-red-500">*</span>
                </h3>
                <SearchableSelect
                  options={[
                    { value: 0, label: 'Pilih SO' },
                    ...soData.map((so) => ({
                      value: so.id,
                      label: `${so.no_so} — ${so.customer} — ${
                        so.produk
                      } (PO: ${so.po_qty?.toLocaleString()})`,
                    })),
                  ]}
                  value={selectedSO?.id ?? 0}
                  onChange={(val) => handleSOChange(Number(val))}
                  placeholder="Pilih SO"
                  disabled={false}
                />
                {selectedSO && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-800">
                        {selectedSO.customer}
                      </p>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                      <p className="text-gray-500">Produk</p>
                      <p className="font-medium text-gray-800 truncate">
                        {selectedSO.produk}
                      </p>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                      <p className="text-gray-500">No IO</p>
                      <p className="font-medium text-gray-800">
                        {selectedSO.no_io || '-'}
                      </p>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                      <p className="text-gray-500">PO QTY</p>
                      <p className="font-bold text-indigo-700">
                        {selectedSO.po_qty?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                      <p className="text-gray-500">No PO Customer</p>
                      <p className="font-medium text-gray-800">
                        {selectedSO.no_po_customer || '-'}
                      </p>
                    </div>
                    {toleransi && (
                      <div className="bg-white rounded-md border border-gray-200 px-3 py-2">
                        <p className="text-gray-500">Toleransi</p>
                        <p className="font-medium text-gray-800">{toleransi}</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedSO && loadingFG && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-500" />
                    Memuat data stok FG...
                  </div>
                )}
                {selectedSO && !loadingFG && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        fgList.length > 0
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {fgList.length > 0
                        ? `${fgList.length} stok FG tersedia`
                        : 'Tidak ada stok FG untuk SO ini'}
                    </span>
                  </div>
                )}
              </div>

              {/* Entry list */}
              {selectedSO && (
                <div>
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <h3 className="text-base font-semibold text-gray-700">
                      2. Daftar JO
                      {entries.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          ({produksiCount} produksi, {kanbanCount} FG)
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowTypeSelector(!showTypeSelector)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Tambah JO
                    </button>
                  </div>

                  {/* Type selector dropdown */}
                  {showTypeSelector && (
                    <div className="mb-3 border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                      <div className="px-4 py-2 border-b bg-gray-50">
                        <p className="text-xs font-medium text-gray-600">
                          Pilih tipe JO yang akan ditambahkan:
                        </p>
                      </div>
                      <div className="grid grid-cols-2 divide-x">
                        <button
                          onClick={() => addEntry('JO PRODUKSI')}
                          disabled={entries.some(
                            (e) => e.type === 'JO PRODUKSI',
                          )}
                          className="flex flex-col items-center py-4 px-3 hover:bg-purple-50 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            JO PRODUKSI
                          </span>
                          <span className="text-xs text-gray-500 text-center mt-0.5">
                            {entries.some((e) => e.type === 'JO PRODUKSI')
                              ? 'Sudah ditambahkan'
                              : 'Input qty + pilih mounting'}
                          </span>
                          {!entries.some((e) => e.type === 'JO PRODUKSI') && (
                            <span className="mt-1.5 text-[10px] font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                              {produksiJOPreview}
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => addEntry('JO KANBAN')}
                          disabled={loadingFG}
                          className="flex flex-col items-center py-4 px-3 hover:bg-teal-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-teal-200">
                            {loadingFG ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600" />
                            ) : (
                              <svg
                                className="w-5 h-5 text-teal-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            FG (JO KANBAN)
                          </span>
                          <span className="text-xs text-gray-500 text-center mt-0.5">
                            {loadingFG
                              ? 'Memuat stok FG...'
                              : fgList.length === 0
                              ? 'Tidak ada stok FG'
                              : `${fgList.length} stok tersedia`}
                          </span>
                        </button>
                      </div>
                      <div className="border-t px-4 py-2 bg-gray-50">
                        <button
                          onClick={() => setShowTypeSelector(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Entry rows */}
                  <div className="space-y-3">
                    {entries.length === 0 && (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        <svg
                          className="w-8 h-8 mx-auto mb-2 opacity-40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <p className="text-sm">Klik "Tambah JO" untuk mulai</p>
                      </div>
                    )}
                    {entries.map((entry, idx) => {
                      const prodIdx = entries
                        .slice(0, idx)
                        .filter((e) => e.type === 'JO PRODUKSI').length;
                      if (entry.type === 'JO KANBAN') {
                        return (
                          <FGPickerRow
                            key={entry.id}
                            fgList={fgList}
                            entry={entry}
                            onChange={(patch) => updateEntry(entry.id, patch)}
                            onRemove={() => removeEntry(entry.id)}
                          />
                        );
                      }
                      return (
                        <ProduksiRow
                          key={entry.id}
                          entry={entry}
                          index={prodIdx}
                          onChange={(patch) => updateEntry(entry.id, patch)}
                          onRemove={() => removeEntry(entry.id)}
                          previewJONumber={produksiJOPreview}
                          ketentuanInsheetData={ketentuanInsheetData}
                          prosesInsheetData={prosesInsheetData}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {!selectedSO && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg
                    className="w-12 h-12 mb-3 opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm">Pilih SO terlebih dahulu</p>
                </div>
              )}
            </div>

            {/* RIGHT: summary panel */}
            <div className="w-1/2 overflow-y-auto p-6">
              <FGInfoPanel
                entries={entries}
                soPoQty={selectedSO?.po_qty ?? 0}
                produksiJOPreview={produksiJOPreview}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500">
              {entries.length > 0
                ? `${entries.length} JO akan dibuat — ${
                    entries.filter((e) => e.type === 'JO PRODUKSI').length
                  } produksi, ${
                    entries.filter((e) => e.type === 'JO KANBAN').length
                  } FG`
                : 'Belum ada JO'}
              {hasProduksiBlockIssues && (
                <span className="ml-2 text-red-500 font-medium">
                  ⚠ JO Produksi belum lengkap
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || entries.length === 0 || !selectedSO}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed border border-transparent rounded-md flex items-center gap-2 transition-colors"
              >
                {loading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {loading ? 'Menyimpan...' : `Simpan ${entries.length} JO`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default JOKanbanModal;
