import React from 'react';

interface RiwayatPendidikan {
  id?: number;
  id_karyawan: string;
  id_biodata_karyawan: string;
  tingkat: string;
  nama_sekolah: string;
  kota: string;
  jurusan: string;
  tahun_lulus: string;
  berijazah: string;
}

interface DetailPendidikanFormProps {
  detailPendidikan: RiwayatPendidikan;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isUpdate: boolean;
}

const DetailPendidikanForm: React.FC<DetailPendidikanFormProps> = ({
  detailPendidikan,
  onChange,
  onSave,
  onCancel,
  saving,
  isUpdate,
}) => {
  const tingkatOptions = [
    { value: '', label: 'Pilih Tingkat' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA', label: 'SMA' },
    { value: 'SMK', label: 'SMK' },
    { value: 'D1', label: 'D1' },
    { value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'D4', label: 'D4' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
  ];

  const berijazahOptions = [
    { value: '', label: 'Pilih Status' },
    { value: 'ya', label: 'Ya' },
    { value: 'tidak', label: 'Tidak' },
  ];

  // Generate years from 1950 to current year + 5
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear + 5; year >= 1950; year--) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isUpdate ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={saving}
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tingkat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tingkat Pendidikan <span className="text-red-500">*</span>
          </label>
          <select
            name="tingkat"
            value={detailPendidikan.tingkat}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {tingkatOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nama Sekolah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Sekolah <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="nama_sekolah"
            value={detailPendidikan.nama_sekolah}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan nama sekolah"
            required
          />
        </div>

        {/* Kota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kota
          </label>
          <input
            type="text"
            name="kota"
            value={detailPendidikan.kota}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan kota"
          />
        </div>

        {/* Jurusan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jurusan
          </label>
          <input
            type="text"
            name="jurusan"
            value={detailPendidikan.jurusan}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan jurusan"
          />
        </div>

        {/* Tahun Lulus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun Lulus
          </label>
          <select
            name="tahun_lulus"
            value={detailPendidikan.tahun_lulus}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih tahun lulus</option>
            {yearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Berijazah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Berijazah <span className="text-red-500">*</span>
          </label>
          <select
            name="berijazah"
            value={detailPendidikan.berijazah}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {berijazahOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Informasi:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Field yang bertanda (*) wajib diisi</li>
          <li>• Tingkat pendidikan akan diurutkan secara otomatis</li>
          <li>• Jurusan dapat dikosongkan untuk tingkat SD, SMP, dan SMA</li>
        </ul>
      </div>
    </div>
  );
};

export default DetailPendidikanForm;
