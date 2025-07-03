import React from 'react';

interface DetailKeluargaDisplayProps {
  originalData: any;
  onEdit: () => void;
  convertTimeStampToDateOnly: (timestamp: string) => string;
}

const DetailKeluargaDisplay: React.FC<DetailKeluargaDisplayProps> = ({
  originalData,
  onEdit,
  convertTimeStampToDateOnly,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return convertTimeStampToDateOnly(dateString);
    } catch (error) {
      return dateString;
    }
  };

  const renderField = (label: string, value: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded border">
        {value || '-'}
      </div>
    </div>
  );

  if (!originalData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada data keluarga
          </h3>
          <p className="text-gray-500 mb-4">
            Tambahkan informasi keluarga untuk melengkapi data karyawan
          </p>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Tambah Data Keluarga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Detail Keluarga</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Pernikahan */}
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
              Status Pernikahan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Status Kawin', originalData.status_kawin)}
              {renderField('Jumlah Tanggungan', originalData.jumlah_tanggungan)}
            </div>
          </div>

          {/* Data Pasangan */}
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
              Data Pasangan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Nama Pasangan', originalData.nama_pasangan)}
              {renderField(
                'Tempat Lahir Pasangan',
                originalData.tempat_lahir_pasangan,
              )}
              {renderField(
                'Tanggal Lahir Pasangan',
                formatDate(originalData.tanggal_lahir_pasangan),
              )}
              {renderField(
                'Pendidikan Pasangan',
                originalData.pendidikan_pasangan,
              )}
              {renderField(
                'Pekerjaan Pasangan',
                originalData.pekerjaan_pasangan,
              )}
            </div>
          </div>

          {/* Data Ayah */}
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
              Data Ayah
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Nama Ayah', originalData.nama_ayah)}
              {renderField('Tempat Lahir Ayah', originalData.tempat_lahir_ayah)}
              {renderField(
                'Tanggal Lahir Ayah',
                formatDate(originalData.tanggal_lahir_ayah),
              )}
              {renderField('Pendidikan Ayah', originalData.pendidikan_ayah)}
              {renderField('Pekerjaan Ayah', originalData.pekerjaan_ayah)}
            </div>
          </div>

          {/* Data Ibu */}
          <div className="md:col-span-2">
            <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
              Data Ibu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Nama Ibu', originalData.nama_ibu)}
              {renderField('Tempat Lahir Ibu', originalData.tempat_lahir_ibu)}
              {renderField(
                'Tanggal Lahir Ibu',
                formatDate(originalData.tanggal_lahir_ibu),
              )}
              {renderField('Pendidikan Ibu', originalData.pendidikan_ibu)}
              {renderField('Pekerjaan Ibu', originalData.pekerjaan_ibu)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-end px-4 py-4">
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

export default DetailKeluargaDisplay;
