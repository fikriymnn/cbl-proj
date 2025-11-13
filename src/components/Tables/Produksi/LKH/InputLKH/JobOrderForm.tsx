import React from 'react';
import Select from 'react-select';
import { FormData, Option, JOData, TahapanData } from './types';
import { selectStyles } from './styles';

interface JobOrderFormProps {
  formData: FormData;
  loading: boolean;
  joOptions: Option[];
  tahapanOptions: Option[];
  mesinOptions: Option[];
  selectedJO: JOData | null;
  selectedTahapan: number | null;
  selectedMesin: string;
  onJOSelect: (option: Option | null) => void;
  onTahapanSelect: (option: Option | null) => void;
  onMesinSelect: (option: Option | null) => void;
  onSpekChange: (value: string) => void;
  onTanggalChange: (value: string) => void;
}

const JobOrderForm: React.FC<JobOrderFormProps> = ({
  formData,
  loading,
  joOptions,
  tahapanOptions,
  mesinOptions,
  selectedJO,
  selectedTahapan,
  selectedMesin,
  onJOSelect,
  onTahapanSelect,
  onMesinSelect,
  onSpekChange,
  onTanggalChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b">
        Informasi Job Order
      </h2>

      <div className="space-y-2">
        {/* No. JO */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            No. JO <span className="text-red-500">*</span>
          </label>
          <Select
            options={joOptions}
            value={
              selectedJO
                ? joOptions.find((opt) => opt.value === String(selectedJO.id))
                : null
            }
            onChange={onJOSelect}
            styles={selectStyles}
            placeholder="Pilih JO"
            isDisabled={loading}
            isClearable
          />
        </div>

        {/* No. IO */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            No. IO
          </label>
          <input
            type="text"
            value={formData.no_io}
            readOnly
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        {/* Nama Customer */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nama Customer
          </label>
          <input
            type="text"
            value={formData.nama_customer}
            readOnly
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
          />
        </div>

        {/* Produk */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Produk
          </label>
          <textarea
            value={formData.produk}
            readOnly
            rows={2}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* QTY */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              QTY (pcs)
            </label>
            <input
              type="number"
              value={formData.qty}
              readOnly
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* QTY Druk */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              QTY Druk
            </label>
            <input
              type="number"
              value={formData.qty_druk}
              readOnly
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>

        {/* Spek */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Spek
          </label>
          <input
            type="text"
            value={formData.spek}
            onChange={(e) => onSpekChange(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Masukkan spesifikasi"
          />
        </div>

        <div className="pt-2 border-t">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">
            Konfigurasi Proses
          </h3>

          {/* Proses */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Proses <span className="text-red-500">*</span>
            </label>
            <Select
              options={tahapanOptions}
              value={
                selectedTahapan
                  ? tahapanOptions.find(
                      (opt) => opt.value === String(selectedTahapan),
                    )
                  : null
              }
              onChange={onTahapanSelect}
              styles={selectStyles}
              placeholder="Pilih Proses"
              isDisabled={!selectedJO || loading}
              isClearable
            />
          </div>

          {/* Mesin */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Mesin <span className="text-red-500">*</span>
            </label>
            <Select
              options={mesinOptions}
              value={
                selectedMesin
                  ? mesinOptions.find((opt) => opt.value === selectedMesin)
                  : null
              }
              onChange={onMesinSelect}
              styles={selectStyles}
              placeholder="Pilih Mesin"
              isDisabled={!selectedTahapan || loading}
              isClearable
            />
          </div>

          {/* Operator */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Operator
            </label>
            <input
              type="text"
              value={formData.operator}
              readOnly
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => onTanggalChange(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOrderForm;
