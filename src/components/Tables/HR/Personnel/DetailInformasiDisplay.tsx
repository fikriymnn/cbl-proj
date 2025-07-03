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

interface DetailInformasiDisplayProps {
  originalData: DetailInformasi | null;
  onEdit: () => void;
  convertTimeStampToDateOnly: (timestamp: string) => string;
}

const DetailInformasiDisplay: React.FC<DetailInformasiDisplayProps> = ({
  originalData,
  onEdit,
  convertTimeStampToDateOnly,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Display */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.tempat_lahir || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {convertTimeStampToDateOnly(
                  originalData?.tanggal_lahir || '',
                ) || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.agama || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Golongan Darah
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.golongan_darah || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kewarganegaraan
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.kewarganegaraan || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Display */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Informasi Kontak
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 min-h-[76px]">
                {originalData?.alamat || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.telepon || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HP
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.hp || '-'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                {originalData?.email || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NPWP Information Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi NPWP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.nama_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.alamat_npwp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Terdaftar NPWP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {convertTimeStampToDateOnly(
                originalData?.tanggal_terdaftar_npwp || '',
              ) || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Information Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Informasi Dokumen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. KTP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_ktp || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Masa Berlaku KTP
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {convertTimeStampToDateOnly(
                originalData?.masa_berlaku_ktp || '',
              ) || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Jamsotek
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.no_jamsotek || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JPK Khusus
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.is_jpk_khusus ? 'Ya' : 'Tidak'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 1
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.sim_1 || '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIM 2
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
              {originalData?.sim_2 || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons for Display Mode */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onEdit}
          className="inline-flex items-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
};

export default DetailInformasiDisplay;
