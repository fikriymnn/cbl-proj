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

interface DetailPekerjaanDisplayProps {
  originalData: RiwayatPekerjaan[] | null;
  onEdit: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

const DetailPekerjaanDisplay: React.FC<DetailPekerjaanDisplayProps> = ({
  originalData,
  onEdit,
  onAdd,
  onDelete,
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

  const getBulanName = (bulan: string) => {
    return bulan || '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Riwayat Pekerjaan
        </h2>
        <button
          onClick={onAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Tambah Riwayat Pekerjaan
        </button>
      </div>

      {!originalData || originalData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Belum ada data riwayat pekerjaan</p>
          <p className="text-sm mt-2">
            Klik tombol "Tambah Riwayat Pekerjaan" untuk menambah data
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {originalData.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Perusahaan
                      </label>
                      <p className="text-gray-900 font-medium">
                        {item.nama_perusahaan || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jabatan
                      </label>
                      <p className="text-gray-900">{item.jabatan || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Periode Kerja
                      </label>
                      <p className="text-gray-900">
                        {getBulanName(item.dari_bulan)} {item.dari_tahun || '-'}{' '}
                        - {getBulanName(item.sampai_bulan)}{' '}
                        {item.sampai_tahun || '-'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keterangan
                      </label>
                      <p className="text-gray-900">{item.keterangan || '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(index)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    title="Edit"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => onDelete(index)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    title="Hapus"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetailPekerjaanDisplay;
