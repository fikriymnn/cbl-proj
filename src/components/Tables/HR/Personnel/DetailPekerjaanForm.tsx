import React from 'react';

interface RiwayatPekerjaan {
  id?: number;
  id_karyawan: string;
  id_biodata_karyawan: string;
  dari_tahun: string;
  dari_bulan: string;
  sampai_tahun: string;
  sampai_bulan: string;
  nama_perusahaan: string;
  jabatan: string;
  keterangan: string;
}

interface DetailPekerjaanFormProps {
  detailPekerjaan: RiwayatPekerjaan;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isUpdate: boolean;
}

const DetailPekerjaanForm: React.FC<DetailPekerjaanFormProps> = ({
  detailPekerjaan,
  onChange,
  onSave,
  onCancel,
  saving,
  isUpdate,
}) => {
  const bulanOptions = [
    'JANUARI',
    'FEBRUARI',
    'MARET',
    'APRIL',
    'MEI',
    'JUNI',
    'JULI',
    'AGUSTUS',
    'SEPTEMBER',
    'OKTOBER',
    'NOVEMBER',
    'DESEMBER',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {isUpdate ? 'Edit Riwayat Pekerjaan' : 'Tambah Riwayat Pekerjaan'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Perusahaan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_perusahaan"
            value={detailPekerjaan.nama_perusahaan}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan nama perusahaan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jabatan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="jabatan"
            value={detailPekerjaan.jabatan}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan jabatan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dari Bulan <span className="text-red-500">*</span>
          </label>
          <select
            name="dari_bulan"
            value={detailPekerjaan.dari_bulan}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pilih bulan</option>
            {bulanOptions.map((bulan) => (
              <option key={bulan} value={bulan}>
                {bulan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dari Tahun <span className="text-red-500">*</span>
          </label>
          <select
            name="dari_tahun"
            value={detailPekerjaan.dari_tahun}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pilih tahun</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sampai Bulan <span className="text-red-500">*</span>
          </label>
          <select
            name="sampai_bulan"
            value={detailPekerjaan.sampai_bulan}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pilih bulan</option>
            {bulanOptions.map((bulan) => (
              <option key={bulan} value={bulan}>
                {bulan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sampai Tahun <span className="text-red-500">*</span>
          </label>
          <select
            name="sampai_tahun"
            value={detailPekerjaan.sampai_tahun}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Pilih tahun</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keterangan
          </label>
          <textarea
            name="keterangan"
            value={detailPekerjaan.keterangan}
            onChange={onChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan keterangan (opsional)"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
          disabled={saving}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={saving}
        >
          {saving ? 'Menyimpan...' : isUpdate ? 'Perbarui' : 'Simpan'}
        </button>
      </div>
    </div>
  );
};

export default DetailPekerjaanForm;
