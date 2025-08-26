import React from 'react';
import { KalkulasiFormData } from './KalkulasiModal';

interface BasicInfoFormProps {
  formData: KalkulasiFormData;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onInputChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xs font-semibold text-gray-800 mb-6 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
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
        Informasi Dasar
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Tanggal Kalkulasi
          </label>
          <input
            type="date"
            name="tgl_kalkulasi"
            value={formData.tgl_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Status
          </label>
          <select
            name="status_kalkulasi"
            value={formData.status_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="Baru">Baru</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Customer
          </label>
          <select
            name="nama_customer"
            value={formData.nama_customer}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Pilih Customer</option>
            <option value="PT TROPICA MAS PHARMACEUTICALS">
              PT TROPICA MAS PHARMACEUTICALS
            </option>
            <option value="TRIMAN">TRIMAN</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Marketing
          </label>
          <select
            name="nama_marketing"
            value={formData.nama_marketing}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Pilih Marketing</option>
            <option value="Marketing 1">Marketing 1</option>
            <option value="Marketing 2">Marketing 2</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Produk
          </label>
          <select
            name="nama_produk"
            value={formData.nama_produk}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Pilih Produk</option>
            <option value="DUS ZULTROP SUSPENSI 60 ML">
              DUS ZULTROP SUSPENSI 60 ML
            </option>
            <option value="BROSUR MELOXICAM">BROSUR MELOXICAM</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Area Pengiriman
          </label>
          <select
            name="nama_area_pengiriman"
            value={formData.nama_area_pengiriman}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Pilih Area Pengiriman</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">Qty</label>
          <input
            type="number"
            name="qty_kalkulasi"
            value={formData.qty_kalkulasi}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Presentase Insheet %
          </label>
          <input
            type="number"
            name="presentase_insheet"
            value={formData.presentase_insheet}
            onChange={onInputChange}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            min="0"
            max="100"
            step="0.01"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Spesifikasi
        </label>
        <textarea
          name="spesifikasi"
          value={formData.spesifikasi}
          onChange={onInputChange}
          rows={3}
          className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Masukkan spesifikasi produk..."
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;
