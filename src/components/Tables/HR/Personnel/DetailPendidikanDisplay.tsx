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

interface DetailPendidikanDisplayProps {
  originalData: RiwayatPendidikan[] | null;
  onEdit: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

const DetailPendidikanDisplay: React.FC<DetailPendidikanDisplayProps> = ({
  originalData,
  onEdit,
  onAdd,
  onDelete,
}) => {
  const tingkatOrder = [
    'SD',
    'SMP',
    'SMA',
    'SMK',
    'D1',
    'D2',
    'D3',
    'D4',
    'S1',
    'S2',
    'S3',
  ];

  const sortedData = originalData?.sort((a, b) => {
    const indexA = tingkatOrder.indexOf(a.tingkat);
    const indexB = tingkatOrder.indexOf(b.tingkat);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Riwayat Pendidikan
        </h2>
        <button
          onClick={onAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Tambah Riwayat Pendidikan
        </button>
      </div>

      {!sortedData || sortedData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎓</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada riwayat pendidikan
          </h3>
          <p className="text-gray-600 mb-6">
            Tambahkan riwayat pendidikan karyawan untuk melengkapi data
          </p>
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Tambah Riwayat Pendidikan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedData.map((item, index) => (
            <div
              key={item.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {item.tingkat}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {item.nama_sekolah}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kota
                      </label>
                      <p className="text-sm text-gray-900">
                        {item.kota || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jurusan
                      </label>
                      <p className="text-sm text-gray-900">
                        {item.jurusan || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Lulus
                      </label>
                      <p className="text-sm text-gray-900">
                        {item.tahun_lulus || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Berijazah
                      </label>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.berijazah === 'ya'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.berijazah === 'ya' ? '✓ Ya' : '✗ Tidak'}
                      </span>
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

export default DetailPendidikanDisplay;
