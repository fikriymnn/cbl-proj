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
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  soData,
  onSOChange,
  loadingMounting,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
        Informasi Dasar
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nomor SO */}
        <div>
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
        {/* Stock FG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock FG
          </label>
          <input
            type="number"
            value={formData.stok_fg}
            onChange={(e) => onChange('stok_fg', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={formData.qty}
            onChange={(e) => onChange('qty', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PO QTY */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PO QTY
          </label>
          <input
            type="number"
            value={formData.po_qty}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Kalkulasi */}
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
            value={formData.status_kalkulasi}
            onChange={(value) => onChange('status_kalkulasi', value)}
            placeholder="Pilih Status Kalkulasi"
            required
          />
        </div>

        {/* Toleransi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Toleransi
          </label>
          <input
            type="text"
            value={formData.toleransi}
            onChange={(e) => onChange('toleransi', e.target.value)}
            placeholder=""
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tanggal Kirim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Kirim
          </label>
          <input
            type="date"
            value={formData.tgl_kirim}
            onChange={(e) => onChange('tgl_kirim', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Standar Warna */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standar Warna
          </label>
          <input
            type="text"
            value={formData.standar_warna}
            onChange={(e) => onChange('standar_warna', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Spesifikasi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Spesifikasi
        </label>
        <textarea
          value={formData.spesifikasi}
          onChange={(e) => onChange('spesifikasi', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Keterangan Pengerjaan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Keterangan Pengerjaan
        </label>
        <textarea
          value={formData.keterangan_pengerjaan}
          onChange={(e) => onChange('keterangan_pengerjaan', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Alamat Pengiriman */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alamat Pengiriman
        </label>
        <textarea
          value={formData.alamat_pengiriman}
          onChange={(e) => onChange('alamat_pengiriman', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

interface MountingSectionProps {
  mountingData: MountingData[];
  selectedMounting: number[];
  onMountingSelect: (mountingId: number) => void;
  loadingMounting: boolean;
}

export const MountingSection: React.FC<MountingSectionProps> = ({
  mountingData,
  selectedMounting,
  onMountingSelect,
  loadingMounting,
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
        {mountingData.map((mounting) => (
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
                <div className="flex items-center gap-3 mb-2">
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

                <div className="ml-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                    <span className="text-gray-600">Ukuran:</span>
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

                {/* Additional Info */}
                <div className="ml-8 mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div>
                    <span>Format: </span>
                    <span className="font-medium">
                      {mounting.format_data || '-'}
                    </span>
                  </div>
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
        ))}
      </div>
    </div>
  );
};
