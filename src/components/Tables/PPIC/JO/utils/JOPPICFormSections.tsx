// JOPPICFormSections.tsx
import React from 'react';
import { MountingData } from '../types/jo.types';
import SearchableSelect from '../../../../../pages/MasterData/Marketing/SearchableSelect';

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
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-700 border-b pb-2">
        Informasi Dasar
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nomor SO */}
        <div>
          {editMode ? (
            <div className="flex flex-col">
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
            <div className="flex flex-col">
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
        </div>

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

        {/* Nomor IO (Auto from SO) */}
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

        {/* Produk - spans 2 columns for better readability */}
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
        {/* PO QTY - Read only (from SO) */}
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

        {/* Stock FG - Editable */}
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

        {/* Quantity - Editable (calculated but can be overridden) */}
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

        {/* Status Kalkulasi - Editable */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
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

        {/* Tanggal Kirim - Editable */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tanggal Kirim
          </label>
          <input
            type="date"
            value={formData.tgl_kirim || new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('tgl_kirim', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Standar Warna - Editable - Left column */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Standar Warna
          </label>
          <input
            type="text"
            value={formData.standar_warna || ''}
            onChange={(e) => onChange('standar_warna', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan standar warna"
          />
        </div>

        {/* Spesifikasi - Right column */}
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

        {/* Keterangan Pengerjaan - Left column */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Keterangan Pengerjaan
          </label>
          <textarea
            value={formData.keterangan_pengerjaan || ''}
            onChange={(e) => onChange('keterangan_pengerjaan', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan keterangan pengerjaan"
            rows={2}
          />
        </div>

        {/* Alamat Pengiriman - Right column */}
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
      </div>
    </div>
  );
};

interface MountingSectionProps {
  mountingData: MountingData[];
  selectedMounting: number | null; // Changed to single selection
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
          (Pilih 1 mounting)
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {mountingData.map((mounting) => {
          const isSelected = selectedMounting === mounting.id;
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
                    {/* Radio button instead of checkbox */}
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

                  {/* Bagian dan Isi Info */}
                  <div className="ml-8 mb-3 p-3 bg-white rounded border border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                    </div>
                  </div>

                  {/* Show calculation if selected - UPDATED JUMLAH DRUK */}
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

                  {/* Additional Info */}
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
  const isi = mounting.ukuran_cetak_isi_1 || 1;
  const bagian = mounting.ukuran_cetak_bagian_1 || 1;

  // Calculate Jumlah Druk from Qty
  const calculatedJumlahDruk = Math.ceil(qty / isi);

  // Find matching ketentuan
  const getKetentuanInsheet = (quantity: number): any => {
    const ketentuan = ketentuanInsheetData.find((k) => {
      const batasBawah = parseInt(k.batas_bawah);
      const batasAtas =
        k.batas_atas === '-' ? Infinity : parseInt(k.batas_atas);
      return quantity >= batasBawah && quantity <= batasAtas;
    });

    return (
      ketentuan || { nilai: 0, is_persentase: false, persentase_insheet: 0 }
    );
  };

  const ketentuanInsheet = getKetentuanInsheet(qty);

  // Calculate expected total insheet based on ketentuan
  const expectedTotalInsheet = ketentuanInsheet.is_persentase
    ? Math.ceil((calculatedJumlahDruk * ketentuanInsheet.nilai) / 100)
    : ketentuanInsheet.nilai;

  // Calculate DISPLAYED Jumlah Druk (Jumlah Druk + Total Insheet)
  const displayedJumlahDruk =
    insheetValues.jumlah_druk + insheetValues.total_insheet;

  // Calculate Jumlah LP
  const calculatedJumlahLP = Math.ceil(
    (insheetValues.jumlah_druk + insheetValues.total_insheet) / bagian,
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Perhitungan Insheet - {mounting.nama_mounting}
      </h3>

      {/* Formula Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm space-y-2">
          <div className="font-semibold text-blue-900 mb-2">
            Formula Perhitungan:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">1. Jumlah Druk:</span>
              <div className="ml-3 text-gray-700">
                = Qty / Isi
                <br />= {qty.toLocaleString()} / {isi}
                <br />={' '}
                <span className="font-bold text-blue-700">
                  {calculatedJumlahDruk.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">2. Ketentuan Insheet:</span>
              <div className="ml-3 text-gray-700">
                {ketentuanInsheet.is_persentase ? (
                  <>
                    = Jumlah Druk × {ketentuanInsheet.nilai}%
                    <br />= {calculatedJumlahDruk.toLocaleString()} ×{' '}
                    {ketentuanInsheet.nilai}%
                    <br />={' '}
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
              <span className="font-medium">3. Jumlah LP:</span>
              <div className="ml-3 text-gray-700">
                = (Jumlah Druk + Total Insheet) / Bagian
                <br />= ({insheetValues.jumlah_druk.toLocaleString()} +{' '}
                {insheetValues.total_insheet.toLocaleString()}) / {bagian}
                <br />={' '}
                <span className="font-bold text-purple-700">
                  {calculatedJumlahLP.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">4. Proses Insheet:</span>
              <div className="ml-3 text-gray-700">
                Distribusi berdasarkan persentase proses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Values Display - UPDATED JUMLAH DRUK */}
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

      {/* Rest of the component remains the same... */}

      {/* Editable Total Insheet */}
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

      {/* Process Distribution Table */}
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
              ) {
                normalizedProses = 'POND';
              }

              let value = 0;
              if (normalizedProses === 'CETAK') {
                value = insheetValues.jumlah_insheet_cetak;
              } else if (normalizedProses === 'POND') {
                value = insheetValues.jumlah_insheet_pond;
              } else if (normalizedProses === 'FINISHING') {
                value = insheetValues.jumlah_insheet_finishing;
              }

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

      {/* Mounting Details Reference */}
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
            <span className="text-gray-600">Ukuran Cetak:</span>
            <p className="font-medium">
              {mounting.ukuran_cetak_panjang_1} x{' '}
              {mounting.ukuran_cetak_lebar_1}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Isi:</span>
            <p className="font-medium text-blue-700">{isi}</p>
          </div>
          <div>
            <span className="text-gray-600">Bagian:</span>
            <p className="font-medium text-blue-700">{bagian}</p>
          </div>
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
