// JOPPICFormSections.tsx
import React from 'react';
import { MountingData } from '../types/jo.types';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';
// Adjust path as needed

interface BasicInfoSectionProps {
  formData: any;
  soData: any[];
  onSOChange: (soId: number) => void;
  loadingMounting: boolean;
  editMode?: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  soData,
  onSOChange,
  loadingMounting,
  editMode = false,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Informasi Dasar
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nomor SO - Now editable in edit mode too */}
        <div>
          {editMode ? (
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor SO <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.no_so}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          ) : (
            <div className="flex flex-col ">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
        </div>

        {/* Nomor JO (Auto) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor JO
          </label>
          <input
            type="text"
            value={formData.no_jo}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Nomor IO (Auto from SO) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor IO
          </label>
          <input
            type="text"
            value={formData.no_io}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <input
            type="text"
            value={formData.customer}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>

        {/* Produk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Produk
          </label>
          <input
            type="text"
            value={formData.produk}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};
interface ProductionDetailsSectionProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export const ProductionDetailsSection: React.FC<
  ProductionDetailsSectionProps
> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Detail Produksi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stock FG - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock FG
          </label>
          <input
            type="number"
            value={formData.stok_fg || 0}
            onChange={(e) => onChange('stok_fg', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Quantity - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={formData.qty || 0}
            onChange={(e) => onChange('qty', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* PO QTY - Read only (from SO) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PO QTY
          </label>
          <input
            type="number"
            value={formData.po_qty || 0}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Kalkulasi - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Kalkulasi
          </label>
          <SearchableSelect
            options={[
              { value: 'BARU', label: 'BARU' },
              { value: 'REPEAT', label: 'REPEAT' },
              { value: 'REPEAT PERUBAHAN', label: 'REPEAT PERUBAHAN' },
            ]}
            value={formData.status_kalkulasi || 'BARU'}
            onChange={(value) => onChange('status_kalkulasi', value)}
            placeholder="Pilih Status Kalkulasi"
            required
          />
        </div>

        {/* Toleransi - Read only (from Customer) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Toleransi
          </label>
          <input
            type="text"
            value={formData.toleransi || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tanggal Kirim - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Kirim
          </label>
          <input
            type="date"
            value={formData.tgl_kirim || new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('tgl_kirim', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Standar Warna - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standar Warna
          </label>
          <input
            type="text"
            value={formData.standar_warna || ''}
            onChange={(e) => onChange('standar_warna', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan standar warna"
          />
        </div>
      </div>

      {/* Text fields - All Editable */}
      <div className="grid grid-cols-1 gap-4">
        {/* Spesifikasi - Now Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spesifikasi
          </label>
          <input
            type="text"
            value={formData.spesifikasi || ''}
            onChange={(e) => onChange('spesifikasi', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan spesifikasi"
          />
          <p className="mt-1 text-xs text-gray-500">
            Auto-generated dari mounting, tapi bisa diedit manual
          </p>
        </div>

        {/* Keterangan Pengerjaan - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan Pengerjaan
          </label>
          <input
            type="text"
            value={formData.keterangan_pengerjaan || ''}
            onChange={(e) => onChange('keterangan_pengerjaan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan keterangan pengerjaan"
          />
        </div>

        {/* Alamat Pengiriman - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Pengiriman
          </label>
          <input
            type="text"
            value={formData.alamat_pengiriman || ''}
            onChange={(e) => onChange('alamat_pengiriman', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan alamat pengiriman"
          />
        </div>
      </div>
    </div>
  );
};

interface MountingSectionProps {
  mountingData: MountingData[];
  selectedMounting: number[];
  onMountingSelect: (mountingId: number) => void;
  loadingMounting: boolean;
  insheetValues: {
    [mountingId: number]: {
      jumlah_druk_cetak: number;
      jumlah_insheet_cetak: number;
      jumlah_druk_pond: number;
      jumlah_insheet_pond: number;
      jumlah_druk_finishing: number;
      jumlah_insheet_finishing: number;
      total_insheet: number;
    };
  };
}

export const MountingSection: React.FC<MountingSectionProps> = ({
  mountingData,
  selectedMounting,
  onMountingSelect,
  loadingMounting,
  insheetValues,
}) => {
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
          Pilih SO terlebih dahulu untuk melihat mounting data
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Pilih Mounting <span className="text-red-500">*</span>
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({selectedMounting.length} dari {mountingData.length} dipilih)
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {mountingData.map((mounting) => {
          // Get insheet values for this mounting
          const mountingInsheet = insheetValues[mounting.id] || {};
          const ukuranCetakBagian = mounting.ukuran_cetak_bagian_1 || 1;
          const ukuranCetakIsi = mounting.ukuran_cetak_isi_1 || 1;
          const jumlahDruk = mountingInsheet.jumlah_druk_cetak || 0;
          const jumlahLP = Math.ceil(jumlahDruk / ukuranCetakBagian);

          return (
            <div
              key={mounting.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedMounting.includes(mounting.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => onMountingSelect(mounting.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedMounting.includes(mounting.id)}
                      onChange={() => onMountingSelect(mounting.id)}
                      className="w-5 h-5 text-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold text-lg text-gray-800">
                      {mounting.nama_mounting}
                    </span>
                  </div>

                  {/* Main Info Grid */}
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

                  {/* Bagian dan Isi Info with Jumlah Druk and Jumlah LP */}
                  <div className="ml-8 mb-3 p-3 bg-white rounded border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bagian:</span>
                        <p className="font-semibold text-blue-600 text-lg">
                          {ukuranCetakBagian}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Isi:</span>
                        <p className="font-semibold text-blue-600 text-lg">
                          {ukuranCetakIsi}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Ukuran Cetak:</span>
                        <p className="font-medium">
                          {mounting.ukuran_cetak_panjang_1} x{' '}
                          {mounting.ukuran_cetak_lebar_1}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Format:</span>
                        <p className="font-medium">
                          {mounting.format_data || '-'}
                        </p>
                      </div>
                      {/* NEW: Jumlah Druk */}
                      <div className="bg-green-50 px-2 py-1 rounded">
                        <span className="text-gray-600">Jumlah Druk:</span>
                        <p className="font-bold text-green-700 text-lg">
                          {jumlahDruk.toLocaleString()}
                        </p>
                      </div>
                      {/* NEW: Jumlah LP */}
                      <div className="bg-purple-50 px-2 py-1 rounded">
                        <span className="text-gray-600">Jumlah LP:</span>
                        <p className="font-bold text-purple-700 text-lg">
                          {jumlahLP.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="ml-8 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
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
    </div>
  );
};

interface InsheetCalculationSectionProps {
  mountingData: MountingData[];
  poQty: number;
  ketentuanInsheetData: any[];
  prosesInsheetData: any[];
  insheetValues: {
    [mountingId: number]: {
      jumlah_druk_cetak: number;
      jumlah_insheet_cetak: number;
      jumlah_druk_pond: number;
      jumlah_insheet_pond: number;
      jumlah_druk_finishing: number;
      jumlah_insheet_finishing: number;
      total_insheet: number;
    };
  };
  onInsheetChange: (mountingId: number, field: string, value: number) => void;
}

export const InsheetCalculationSection: React.FC<
  InsheetCalculationSectionProps
> = ({
  mountingData,
  poQty,
  ketentuanInsheetData,
  prosesInsheetData,
  insheetValues,
  onInsheetChange,
}) => {
  if (mountingData.length === 0) {
    return null;
  }

  const getKetentuanInsheet = (qty: number): number => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return qty >= batasBawah && qty <= batasAtas;
    });

    if (!ketentuan) return 0;

    if (ketentuan.is_persentase) {
      return (qty * ketentuan.nilai) / 100;
    }
    return ketentuan.nilai;
  };

  const ketentuanInsheet = getKetentuanInsheet(poQty);

  const handleTotalInsheetChange = (mountingId: number, totalValue: number) => {
    const mountingInsheet = insheetValues[mountingId] || {};
    const jumlahDruk = mountingInsheet.jumlah_druk_cetak || 0;

    const totalPercentage = prosesInsheetData.reduce(
      (sum, proses) => sum + proses.persentase_insheet,
      0,
    );

    const newValues: any = {
      total_insheet: totalValue,
      jumlah_druk_cetak: jumlahDruk,
      jumlah_druk_pond: jumlahDruk,
      jumlah_druk_finishing: jumlahDruk,
    };

    prosesInsheetData.forEach((proses) => {
      let normalizedProses = proses.proses.toUpperCase();
      if (normalizedProses === 'PONDS' || normalizedProses === 'PONDING') {
        normalizedProses = 'POND';
      }

      const fieldName = `jumlah_insheet_${normalizedProses.toLowerCase()}`;
      const proportionalValue =
        (totalValue * proses.persentase_insheet) / totalPercentage;

      newValues[fieldName] = proportionalValue;
    });

    Object.entries(newValues).forEach(([field, value]) => {
      onInsheetChange(mountingId, field, value as number);
    });
  };

  // Add handler for jumlah druk changes
  const handleJumlahDrukChange = (mountingId: number, drukValue: number) => {
    onInsheetChange(mountingId, 'jumlah_druk_cetak', drukValue);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Perhitungan Insheet
      </h3>

      {/* Display Ketentuan Insheet */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Ketentuan Insheet: </span>
          <span className="text-blue-700 font-semibold">
            {ketentuanInsheet.toLocaleString()}
          </span>
          <span className="text-gray-600 ml-2">
            (berdasarkan PO QTY: {poQty.toLocaleString()})
          </span>
        </div>
      </div>

      {/* Editable Insheet Calculation Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left font-medium text-gray-700">
                Mounting
              </th>
              <th className="px-4 py-2 border text-center font-medium text-gray-700 bg-green-50">
                Jumlah Druk
                <br />
                <span className="text-xs text-gray-500">(Editable)</span>
              </th>
              {prosesInsheetData.map((proses) => (
                <th
                  key={proses.id}
                  className="px-4 py-2 border text-center font-medium text-gray-700"
                >
                  {proses.proses}
                  <br />
                  <span className="text-xs text-gray-500">
                    ({proses.persentase_insheet}%)
                  </span>
                </th>
              ))}
              <th className="px-4 py-2 border text-center font-medium text-gray-700 bg-yellow-100">
                Total Insheet
                <br />
                <span className="text-xs text-gray-500">(Editable)</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {mountingData.map((mounting) => {
              const mountingInsheet = insheetValues[mounting.id] || {};
              const jumlahDruk = mountingInsheet.jumlah_druk_cetak || 0;

              return (
                <tr key={mounting.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    <div className="font-medium">{mounting.nama_mounting}</div>
                    <div className="text-xs text-gray-500">
                      Isi: {mounting.ukuran_cetak_isi_1} | Bagian:{' '}
                      {mounting.ukuran_cetak_bagian_1}
                    </div>
                  </td>
                  {/* Editable Jumlah Druk */}
                  <td className="px-4 py-2 border text-center bg-green-50">
                    <input
                      type="number"
                      value={jumlahDruk}
                      onChange={(e) =>
                        handleJumlahDrukChange(
                          mounting.id,
                          Number(e.target.value),
                        )
                      }
                      className="w-24 px-2 py-1 border-2 border-green-400 rounded text-center font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </td>
                  {prosesInsheetData.map((proses) => {
                    const fieldName =
                      `jumlah_insheet_${proses.proses.toLowerCase()}` as keyof typeof mountingInsheet;
                    const value = mountingInsheet[fieldName] || 0;

                    return (
                      <td
                        key={proses.id}
                        className="px-4 py-2 border text-center bg-gray-50"
                      >
                        <div className="font-semibold text-gray-700">
                          {Math.round(value).toLocaleString()}
                        </div>
                      </td>
                    );
                  })}
                  {/* Editable Total Insheet */}
                  <td className="px-4 py-2 border text-center bg-yellow-50">
                    <input
                      type="number"
                      value={mountingInsheet.total_insheet || 0}
                      onChange={(e) =>
                        handleTotalInsheetChange(
                          mounting.id,
                          Number(e.target.value),
                        )
                      }
                      className="w-24 px-2 py-1 border-2 border-yellow-400 rounded text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      min="0"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculation Formula Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
        <div className="font-semibold mb-2">Formula Perhitungan:</div>
        <div className="space-y-1">
          <div>
            • Jumlah Druk = (PO QTY / Ukuran Cetak Isi + Ketentuan Insheet) /
            Ukuran Cetak Bagian
          </div>
          <div>• Jumlah LP = Jumlah Druk / Bagian</div>
          <div>
            • Insheet Per Proses = Jumlah Druk × Persentase Insheet Proses
            (auto-calculated)
          </div>
          <div>• Jumlah Druk dan Total Insheet dapat diubah manual</div>
        </div>
      </div>

      {/* Info about editable fields */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
        <div className="flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <strong>Catatan:</strong>
            <ul className="mt-1 ml-4 list-disc">
              <li>
                Edit <strong>Jumlah Druk</strong> untuk mengubah basis
                perhitungan
              </li>
              <li>
                Edit <strong>Total Insheet</strong> untuk override total -
                sistem akan otomatis mendistribusikan ke setiap proses
              </li>
              <li>Persentase distribusi berdasarkan master proses insheet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
