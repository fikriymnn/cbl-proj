// JOPPICFormSections.tsx
import React, { useState } from 'react';
import { MountingData } from '../types/jo.types';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
import TahapanPopup from './TahapanPopup';

interface BasicInfoSectionProps {
  formData: any;
  soData: any[];
  // NEW: IO proof list + handler
  ioProofData?: any[];
  onSOChange: (soId: number) => void;
  onIOChange?: (ioId: number) => void;
  loadingMounting: boolean;
  editMode?: boolean;
  // NEW: true when creating JO PROOF from IO
  isIOProofMode?: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  soData,
  ioProofData = [],
  onSOChange,
  onIOChange,
  loadingMounting,
  editMode = false,
  isIOProofMode = false,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
        Informasi Dasar
        {/* NEW: source badge */}
        {isIOProofMode && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
            IO Proof
          </span>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ── SO or IO selector depending on mode ─────────────────────────── */}
        {isIOProofMode ? (
          /* IO PROOF MODE — show IO dropdown */
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor IO <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={[
                { value: 0, label: 'Pilih IO' },
                ...ioProofData.map((io) => ({
                  value: io.id,
                  label: `${io.no_io} - ${io.customer} - ${io.produk}`,
                })),
              ]}
              value={formData.id_io || 0}
              onChange={(value) => onIOChange && onIOChange(Number(value))}
              placeholder="Pilih IO"
              disabled={loadingMounting}
              required
            />
          </div>
        ) : editMode ? (
          /* EDIT MODE — show read-only SO */
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor SO <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.no_so}
              disabled
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        ) : (
          /* CREATE MODE (SO) — show SO dropdown */
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor SO <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              options={[
                { value: 0, label: 'Pilih SO' },
                ...soData.map((so) => ({
                  value: so.id,
                  label: `${so.no_so} - ${so.customer} - ${so.produk}`,
                })),
              ]}
              value={formData.id_so || 0}
              onChange={(value) => onSOChange(Number(value))}
              placeholder="Pilih SO"
              disabled={loadingMounting}
              required
            />
          </div>
        )}

        {/* Nomor JO (Auto) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nomor JO
          </label>
          <input
            type="text"
            value={formData.no_jo}
            disabled
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Nomor IO (Auto from SO / selected IO) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Nomor IO
          </label>
          <input
            type="text"
            value={formData.no_io}
            disabled
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Nomor PO — hidden for IO proof (no SO / PO) */}
        {!isIOProofMode && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor PO
            </label>
            <input
              type="text"
              value={formData.no_po_customer}
              disabled
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        )}

        {/* Tanggal PO — hidden for IO proof */}
        {!isIOProofMode && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tanggal PO
            </label>
            <input
              type="text"
              value={
                formData.tgl_po_customer ||
                new Date().toISOString().split('T')[0]
              }
              disabled
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        )}

        {/* Customer */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Customer
          </label>
          <input
            type="text"
            value={formData.customer}
            disabled
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Produk */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Produk
          </label>
          <input
            type="text"
            value={formData.produk}
            disabled
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* NEW: info banner for IO proof */}
        {isIOProofMode && (
          <div className="md:col-span-2 flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-md px-3 py-2">
            <svg
              className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0"
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
            <p className="text-xs text-teal-700">
              JO Proof dari IO tidak memerlukan Sales Order. Data PO dan status
              SO tidak akan diisi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductionDetailsSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  onQtyChange: (newQty: number) => void;
}

export const ProductionDetailsSection: React.FC<
  ProductionDetailsSectionProps
> = ({ formData, onChange, onQtyChange }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
        Detail Produksi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* PO QTY */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            PO QTY
          </label>
          <input
            type="number"
            value={formData.po_qty || 0}
            disabled
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100 font-semibold"
          />
        </div>

        {/* Stock FG */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Stock FG
          </label>
          <input
            type="number"
            value={formData.stok_fg || 0}
            onChange={(e) => onChange('stok_fg', Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quantity <span className="text-xs text-gray-500">(Editable)</span>
          </label>
          <input
            type="number"
            value={formData.qty || 0}
            onChange={(e) => onQtyChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 text-sm border-2 border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto: PO QTY - Stock FG ={' '}
            {(formData.po_qty || 0) - (formData.stok_fg || 0)}
          </p>
        </div>

        {/* Status Kalkulasi */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status Kalkulasi
          </label>
          <input
            type="text"
            value={formData.status_jo || ''}
            onChange={(value) => onChange('status_jo', value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>

        {/* Toleransi */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Toleransi
          </label>
          <input
            type="text"
            value={formData.toleransi || ''}
            readOnly
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Tanggal Kirim */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tanggal Kirim
          </label>
          <input
            disabled
            type="date"
            value={formData.tgl_kirim || new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('tgl_kirim', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Alamat Pengiriman */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Alamat Pengiriman
          </label>
          <textarea
            value={formData.alamat_pengiriman || ''}
            onChange={(e) => onChange('alamat_pengiriman', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan alamat pengiriman"
            rows={2}
          />
        </div>

        {/* Spesifikasi */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Spesifikasi
          </label>
          <textarea
            value={formData.spesifikasi || ''}
            onChange={(e) => onChange('spesifikasi', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan spesifikasi"
            rows={2}
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-generated dari mounting
          </p>
        </div>

        {/* Keterangan Pengerjaan */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Keterangan Pengerjaan
          </label>
          <textarea
            value={formData.keterangan_pengerjaan || ''}
            onChange={(e) => onChange('keterangan_pengerjaan', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan keterangan pengerjaan"
            rows={5}
          />
        </div>
      </div>
    </div>
  );
};

interface MountingSectionProps {
  mountingData: MountingData[];
  selectedMounting: number | null;
  onMountingSelect: (mountingId: number) => void;
  loadingMounting: boolean;
  insheetValues: {
    jumlah_druk: number;
    jumlah_insheet_cetak: number;
    jumlah_insheet_pond: number;
    jumlah_insheet_finishing: number;
    total_insheet: number;
    jumlah_lp: number;
  };
}

export const MountingSection: React.FC<MountingSectionProps> = ({
  mountingData,
  selectedMounting,
  onMountingSelect,
  loadingMounting,
  insheetValues,
}) => {
  const [showTahapanPopup, setShowTahapanPopup] = useState(false);
  const [selectedTahapanData, setSelectedTahapanData] = useState<{
    tahapan: any[];
    mountingName: string;
  }>({ tahapan: [], mountingName: '' });

  const handleShowTahapan = (mounting: MountingData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTahapanData({
      tahapan: mounting.tahapan || [],
      mountingName: mounting.nama_mounting,
    });
    setShowTahapanPopup(true);
  };

  if (loadingMounting) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
          Mounting Data
        </h3>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading mounting data...</p>
        </div>
      </div>
    );
  }

  if (mountingData.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
          Mounting Data
        </h3>
        <div className="text-center py-8 text-gray-500">
          Pilih SO / IO terlebih dahulu untuk melihat mounting data
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Pilih Mounting <span className="text-red-500">*</span>
        <span className="text-sm font-normal text-gray-500 ml-2">
          (Pilih 1 mounting)
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {mountingData.map((mounting) => {
          const isSelected = selectedMounting === mounting.id;
          console.log(
            'Mounting:',
            mounting.nama_mounting,
            'Selected:',
            isSelected,
            mounting.id,
            selectedMounting,
          );
          const ukuranCetakBagian = mounting.ukuran_cetak_bagian_1 || 1;
          const ukuranCetakIsi = mounting.ukuran_cetak_isi_1 || 1;
          const displayedJumlahDruk =
            insheetValues.jumlah_druk + insheetValues.total_insheet;

          return (
            <div
              key={mounting.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onClick={() => onMountingSelect(mounting.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onMountingSelect(mounting.id)}
                      className="w-5 h-5 text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold text-lg text-gray-800">
                      {mounting.nama_mounting}
                    </span>
                    {isSelected && (
                      <span className="ml-auto px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                        TERPILIH
                      </span>
                    )}
                    <button
                      onClick={(e) => handleShowTahapan(mounting, e)}
                      className="ml-2 px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-full font-semibold transition-colors flex items-center gap-1"
                      title="Lihat Tahapan Proses"
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Lihat Tahapan
                    </button>
                  </div>

                  {/* Main info grid */}
                  <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Jenis Kertas:</span>
                      <p className="font-medium">
                        {mounting.jenis_kertas || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gramature:</span>
                      <p className="font-medium">
                        {mounting.gramature_kertas || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ukuran Plano:</span>
                      <p className="font-medium">
                        {mounting.panjang_plano} x {mounting.lebar_plano}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jumlah Warna:</span>
                      <p className="font-medium">
                        {mounting.jumlah_warna || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Bagian & Isi */}
                  <div className="ml-8 mb-3 p-3 bg-white rounded border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">UK Cetak A (P×L):</span>
                        <p className="font-medium">
                          {mounting.ukuran_cetak_panjang_1} x{' '}
                          {mounting.ukuran_cetak_lebar_1}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Bagian A:</span>
                        <p className="font-semibold text-blue-600 text-lg">
                          {ukuranCetakBagian}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Isi A:</span>
                        <p className="font-semibold text-blue-600 text-lg">
                          {ukuranCetakIsi}
                        </p>
                      </div>
                      {mounting.ukuran_cetak_panjang_2 ||
                      mounting.ukuran_cetak_lebar_2 ? (
                        <>
                          <div>
                            <span className="text-gray-600">
                              UK Cetak B (P×L):
                            </span>
                            <p className="font-medium">
                              {mounting.ukuran_cetak_panjang_2} x{' '}
                              {mounting.ukuran_cetak_lebar_2}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Bagian B:</span>
                            <p className="font-semibold text-blue-600 text-lg">
                              {mounting.ukuran_cetak_bagian_2 || 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Isi B:</span>
                            <p className="font-semibold text-blue-600 text-lg">
                              {mounting.ukuran_cetak_isi_2 || 0}
                            </p>
                          </div>
                        </>
                      ) : null}
                      <div>
                        <span className="text-gray-600">Format:</span>
                        <p className="font-medium">
                          {mounting.format_data || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected calculation */}
                  {isSelected && (
                    <div className="ml-8 mt-3 p-3 bg-green-50 rounded border border-green-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Jumlah Druk:</span>
                          <p className="font-bold text-green-700 text-lg">
                            {displayedJumlahDruk.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Insheet:</span>
                          <p className="font-bold text-orange-700 text-lg">
                            {insheetValues.total_insheet.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jumlah LP:</span>
                          <p className="font-bold text-purple-700 text-lg">
                            {insheetValues.jumlah_lp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional info */}
                  <div className="ml-8 mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div>
                      <span>Coating Depan: </span>
                      <span className="font-medium">
                        {mounting.nama_coating_depan || '-'}
                      </span>
                    </div>
                    <div>
                      <span>Coating Belakang: </span>
                      <span className="font-medium">
                        {mounting.nama_coating_belakang || '-'}
                      </span>
                    </div>
                    <div>
                      <span>Jenis Pons: </span>
                      <span className="font-medium">
                        {mounting.nama_jenis_pons || '-'}
                      </span>
                    </div>
                    <div>
                      <span>Lem: </span>
                      <span className="font-medium">
                        {mounting.nama_lem || '-'}
                      </span>
                    </div>
                    <div>
                      <span>Warna: </span>
                      <span className="font-medium">
                        D:{mounting.warna_depan || 0} / B:
                        {mounting.warna_belakang || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <TahapanPopup
        isOpen={showTahapanPopup}
        onClose={() => setShowTahapanPopup(false)}
        tahapanData={selectedTahapanData.tahapan}
        mountingName={selectedTahapanData.mountingName}
      />
    </div>
  );
};

interface InsheetCalculationSectionProps {
  mounting: MountingData;
  qty: number;
  ketentuanInsheetData: any[];
  prosesInsheetData: any[];
  insheetValues: {
    jumlah_druk: number;
    jumlah_insheet_cetak: number;
    jumlah_insheet_pond: number;
    jumlah_insheet_finishing: number;
    total_insheet: number;
    jumlah_lp: number;
  };
  onTotalInsheetChange: (totalValue: number) => void;
}

export const InsheetCalculationSection: React.FC<
  InsheetCalculationSectionProps
> = ({
  mounting,
  qty,
  ketentuanInsheetData,
  prosesInsheetData,
  insheetValues,
  onTotalInsheetChange,
}) => {
  const isi1 = mounting.ukuran_cetak_isi_1 || 0;
  const isi2 = mounting.ukuran_cetak_isi_2 || 0;
  const totalIsi = isi1 + isi2 || 1;
  const bagian = mounting.ukuran_cetak_bagian_1 || 1;
  const calculatedRawJumlahDruk = Math.ceil(qty / totalIsi);

  const getKetentuanInsheet = (rawDruk: number): any => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return rawDruk >= batasBawah && rawDruk <= batasAtas;
    });
    return (
      ketentuan || { nilai: 0, is_persentase: false, persentase_insheet: 0 }
    );
  };

  const ketentuanInsheet = getKetentuanInsheet(calculatedRawJumlahDruk);
  const expectedTotalInsheet = ketentuanInsheet.is_persentase
    ? Math.ceil((calculatedRawJumlahDruk * ketentuanInsheet.nilai) / 100)
    : ketentuanInsheet.nilai;

  const displayedJumlahDruk =
    insheetValues.jumlah_druk + insheetValues.total_insheet;
  const calculatedJumlahLP = Math.ceil(
    (insheetValues.jumlah_druk + insheetValues.total_insheet) / bagian,
  );
  const ukuranCetakBagian = mounting.ukuran_cetak_bagian_1 || 1;
  const ukuranCetakIsi = mounting.ukuran_cetak_isi_1 || 1;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Perhitungan Insheet - {mounting.nama_mounting}
      </h3>

      {/* Formula explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm space-y-2">
          <div className="font-semibold text-blue-900 mb-2">
            Formula Perhitungan:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">1. RAW Jumlah Druk:</span>
              <div className="ml-3 text-gray-700">
                = Qty / (Isi A{isi2 ? ' + Isi B' : ''})
                <br />= {qty.toLocaleString()} / ({isi1}
                {isi2 ? ` + ${isi2}` : ''})
                <br />={' '}
                <span className="font-bold text-blue-700">
                  {calculatedRawJumlahDruk.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">2. Ketentuan Insheet:</span>
              <div className="ml-3 text-gray-700">
                <span className="text-red-600">(Based on RAW Druk)</span>
                <br />
                {ketentuanInsheet.is_persentase ? (
                  <>
                    = RAW Druk × {ketentuanInsheet.nilai}%<br />={' '}
                    {calculatedRawJumlahDruk.toLocaleString()} ×{' '}
                    {ketentuanInsheet.nilai}%<br />={' '}
                    <span className="font-bold text-orange-700">
                      {expectedTotalInsheet.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    = Fixed Value
                    <br />={' '}
                    <span className="font-bold text-orange-700">
                      {ketentuanInsheet.nilai}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium">3. Displayed Jumlah Druk:</span>
              <div className="ml-3 text-gray-700">
                = RAW Druk + Total Insheet
                <br />= {insheetValues.jumlah_druk.toLocaleString()} +{' '}
                {insheetValues.total_insheet.toLocaleString()}
                <br />={' '}
                <span className="font-bold text-green-700">
                  {displayedJumlahDruk.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">4. Jumlah LP:</span>
              <div className="ml-3 text-gray-700">
                = (RAW Druk + Total Insheet) / Bagian
                <br />= ({insheetValues.jumlah_druk.toLocaleString()} +{' '}
                {insheetValues.total_insheet.toLocaleString()}) / {bagian}
                <br />={' '}
                <span className="font-bold text-purple-700">
                  {calculatedJumlahLP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
            <span className="font-semibold text-yellow-900">
              Reverse Formula (saat edit Total Insheet):
            </span>
            <br />
            Qty = (RAW Druk + Total Insheet) × Isi
          </div>
        </div>
      </div>

      {/* Current values */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-600 mb-1">Quantity</div>
            <div className="text-2xl font-bold text-gray-800">
              {qty.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Jumlah Druk</div>
            <div className="text-2xl font-bold text-blue-700">
              {displayedJumlahDruk.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Total Insheet</div>
            <div className="text-2xl font-bold text-orange-700">
              {insheetValues.total_insheet.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Jumlah LP</div>
            <div className="text-2xl font-bold text-purple-700">
              {insheetValues.jumlah_lp.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Editable total insheet */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Edit Total Insheet{' '}
          <span className="text-xs font-normal text-gray-600">
            (akan mengubah Qty dan distribusi proses)
          </span>
        </label>
        <input
          type="number"
          value={insheetValues.total_insheet || 0}
          onChange={(e) => onTotalInsheetChange(Number(e.target.value))}
          className="w-full px-4 py-3 border-2 border-yellow-400 rounded-md text-center font-bold text-2xl text-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          min="0"
        />
        <p className="mt-2 text-xs text-gray-600">
          Expected dari ketentuan:{' '}
          <span className="font-bold">
            {expectedTotalInsheet.toLocaleString()}
          </span>
        </p>
      </div>

      {/* Process distribution table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left font-medium text-gray-700">
                Proses
              </th>
              <th className="px-4 py-2 border text-center font-medium text-gray-700">
                Persentase
              </th>
              <th className="px-4 py-2 border text-center font-medium text-gray-700">
                Jumlah Insheet
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {prosesInsheetData.map((proses) => {
              let normalizedProses = proses.proses.toUpperCase();
              if (
                normalizedProses === 'PONDS' ||
                normalizedProses === 'PONDING'
              )
                normalizedProses = 'POND';

              let value = 0;
              if (normalizedProses === 'CETAK')
                value = insheetValues.jumlah_insheet_cetak;
              else if (normalizedProses === 'POND')
                value = insheetValues.jumlah_insheet_pond;
              else if (normalizedProses === 'FINISHING')
                value = insheetValues.jumlah_insheet_finishing;

              return (
                <tr key={proses.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border font-medium">
                    {proses.proses}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {proses.persentase_insheet}%
                  </td>
                  <td className="px-4 py-2 border text-center font-semibold text-gray-700">
                    {Math.ceil(value).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold">
              <td className="px-4 py-2 border" colSpan={2}>
                Total
              </td>
              <td className="px-4 py-2 border text-center text-orange-700">
                {insheetValues.total_insheet.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mounting reference */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Referensi Mounting</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-600">Jenis Kertas:</span>
            <p className="font-medium">{mounting.jenis_kertas || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Gramature:</span>
            <p className="font-medium">{mounting.gramature_kertas || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Ukuran Plano:</span>
            <p className="font-medium">
              {mounting.panjang_plano} x {mounting.lebar_plano}
            </p>
          </div>
          <div>
            <span className="text-gray-600">UK Cetak A (P×L):</span>
            <p className="font-medium">
              {mounting.ukuran_cetak_panjang_1} x{' '}
              {mounting.ukuran_cetak_lebar_1}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Bagian A:</span>
            <p className="font-semibold text-blue-600 text-lg">
              {ukuranCetakBagian}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Isi A:</span>
            <p className="font-semibold text-blue-600 text-lg">
              {ukuranCetakIsi}
            </p>
          </div>
          {mounting.ukuran_cetak_panjang_2 || mounting.ukuran_cetak_lebar_2 ? (
            <>
              <div>
                <span className="text-gray-600">UK Cetak B (P×L):</span>
                <p className="font-medium">
                  {mounting.ukuran_cetak_panjang_2} x{' '}
                  {mounting.ukuran_cetak_lebar_2}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Bagian B:</span>
                <p className="font-semibold text-blue-600 text-lg">
                  {mounting.ukuran_cetak_bagian_2 || 0}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Isi B:</span>
                <p className="font-semibold text-blue-600 text-lg">
                  {mounting.ukuran_cetak_isi_2 || 0}
                </p>
              </div>
            </>
          ) : null}
          <div>
            <span className="text-gray-600">Format:</span>
            <p className="font-medium">{mounting.format_data || '-'}</p>
          </div>
          <div>
            <span className="text-gray-600">Jumlah Warna:</span>
            <p className="font-medium">{mounting.jumlah_warna || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
