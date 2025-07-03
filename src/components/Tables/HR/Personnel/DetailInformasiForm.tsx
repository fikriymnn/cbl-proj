import React from 'react';

interface DetailInformasi {
  id_karyawan: string;
  id_biodata_karyawan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  golongan_darah: string;
  kewarganegaraan: string;
  alamat: string;
  telepon: string;
  hp: string;
  email: string;
  no_npwp: string;
  nama_npwp: string;
  alamat_npwp: string;
  tanggal_terdaftar_npwp: string;
  no_ktp: string;
  masa_berlaku_ktp: string;
  no_jamsotek: string;
  sim_1: string;
  sim_2: string;
  is_jpk_khusus: boolean;
}

interface DetailInformasiFormProps {
  detailInformasi: DetailInformasi;
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

const DetailInformasiForm: React.FC<DetailInformasiFormProps> = ({
  detailInformasi,
  onChange,
  onSave,
  onCancel,
  saving,
  isUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempat_lahir"
                value={detailInformasi.tempat_lahir}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan tempat lahir"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggal_lahir"
                value={detailInformasi.tanggal_lahir}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <select
                name="agama"
                value={detailInformasi.agama}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <select
                name="golongan_darah"
                value={detailInformasi.golongan_darah}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kewarganegaraan
              </label>
              <select
                name="kewarganegaraan"
                value={detailInformasi.kewarganegaraan}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Kontak
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                name="alamat"
                value={detailInformasi.alamat}
                onChange={onChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <input
                type="text"
                name="telepon"
                value={detailInformasi.telepon}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor telepon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HP
              </label>
              <input
                type="text"
                name="hp"
                value={detailInformasi.hp}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor HP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={detailInformasi.email}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* NPWP Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi NPWP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. NPWP
            </label>
            <input
              type="text"
              name="no_npwp"
              value={detailInformasi.no_npwp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama NPWP
            </label>
            <input
              type="text"
              name="nama_npwp"
              value={detailInformasi.nama_npwp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama sesuai NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat NPWP
            </label>
            <input
              type="text"
              name="alamat_npwp"
              value={detailInformasi.alamat_npwp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat sesuai NPWP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Terdaftar NPWP
            </label>
            <input
              type="date"
              name="tanggal_terdaftar_npwp"
              value={detailInformasi.tanggal_terdaftar_npwp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi Dokumen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. KTP
            </label>
            <input
              type="text"
              name="no_ktp"
              value={detailInformasi.no_ktp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor KTP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Berlaku KTP
            </label>
            <input
              type="date"
              name="masa_berlaku_ktp"
              value={detailInformasi.masa_berlaku_ktp}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Jamsotek
            </label>
            <input
              type="text"
              name="no_jamsotek"
              value={detailInformasi.no_jamsotek}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor Jamsotek"
            />
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_jpk_khusus"
                checked={detailInformasi.is_jpk_khusus}
                onChange={onChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                JPK Khusus
              </span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 1
            </label>
            <input
              type="text"
              name="sim_1"
              value={detailInformasi.sim_1}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor SIM 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 2
            </label>
            <input
              type="text"
              name="sim_2"
              value={detailInformasi.sim_2}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nomor SIM 2"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
        >
          Batal
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
        >
          {saving ? 'Menyimpan...' : isUpdate ? 'Update Data' : 'Simpan Data'}
        </button>
      </div>
    </div>
  );
};

export default DetailInformasiForm;
