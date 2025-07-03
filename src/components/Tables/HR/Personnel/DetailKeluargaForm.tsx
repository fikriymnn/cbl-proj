import React from 'react';

interface DetailKeluarga {
  id_karyawan: string;
  id_biodata_karyawan: string;
  status_kawin: string;
  jumlah_tanggungan: number;
  nama_pasangan: string;
  tempat_lahir_pasangan: string;
  tanggal_lahir_pasangan: string;
  pendidikan_pasangan: string;
  pekerjaan_pasangan: string;
  nama_ayah: string;
  tempat_lahir_ayah: string;
  tanggal_lahir_ayah: string;
  pendidikan_ayah: string;
  pekerjaan_ayah: string;
  nama_ibu: string;
  tempat_lahir_ibu: string;
  tanggal_lahir_ibu: string;
  pendidikan_ibu: string;
  pekerjaan_ibu: string;
}

interface DetailKeluargaFormProps {
  detailKeluarga: DetailKeluarga;
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

const DetailKeluargaForm: React.FC<DetailKeluargaFormProps> = ({
  detailKeluarga,
  onChange,
  onSave,
  onCancel,
  saving,
  isUpdate,
}) => {
  const statusKawinOptions = [
    { value: '', label: 'Pilih Status Kawin' },
    { value: 'Belum Menikah', label: 'Belum Menikah' },
    { value: 'Menikah', label: 'Menikah' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' },
  ];

  const pendidikanOptions = [
    { value: '', label: 'Pilih Pendidikan' },
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA/SMK', label: 'SMA/SMK' },
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' },
  ];

  const renderField = (
    label: string,
    name: string,
    type: string = 'text',
    required: boolean = false,
    options?: { value: string; label: string }[],
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={(detailKeluarga as any)[name] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'number' ? (
        <input
          type="number"
          name={name}
          value={(detailKeluarga as any)[name] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
          min="0"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={(detailKeluarga as any)[name] || ''}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {isUpdate ? 'Edit Data Keluarga' : 'Tambah Data Keluarga'}
        </h3>
      </div>

      <div className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="space-y-8">
            {/* Status Pernikahan */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
                Status Pernikahan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField(
                  'Status Kawin',
                  'status_kawin',
                  'select',
                  true,
                  statusKawinOptions,
                )}
                {renderField(
                  'Jumlah Tanggungan',
                  'jumlah_tanggungan',
                  'number',
                  false,
                )}
              </div>
            </div>

            {/* Data Pasangan */}
            {detailKeluarga.status_kawin === 'Menikah' && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
                  Data Pasangan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Nama Pasangan', 'nama_pasangan', 'text', false)}
                  {renderField(
                    'Tempat Lahir Pasangan',
                    'tempat_lahir_pasangan',
                    'text',
                    false,
                  )}
                  {renderField(
                    'Tanggal Lahir Pasangan',
                    'tanggal_lahir_pasangan',
                    'date',
                    false,
                  )}
                  {renderField(
                    'Pendidikan Pasangan',
                    'pendidikan_pasangan',
                    'select',
                    false,
                    pendidikanOptions,
                  )}
                  {renderField(
                    'Pekerjaan Pasangan',
                    'pekerjaan_pasangan',
                    'text',
                    false,
                  )}
                </div>
              </div>
            )}

            {/* Data Ayah */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
                Data Ayah
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Nama Ayah', 'nama_ayah', 'text', false)}
                {renderField(
                  'Tempat Lahir Ayah',
                  'tempat_lahir_ayah',
                  'text',
                  false,
                )}
                {renderField(
                  'Tanggal Lahir Ayah',
                  'tanggal_lahir_ayah',
                  'date',
                  false,
                )}
                {renderField(
                  'Pendidikan Ayah',
                  'pendidikan_ayah',
                  'select',
                  false,
                  pendidikanOptions,
                )}
                {renderField('Pekerjaan Ayah', 'pekerjaan_ayah', 'text', false)}
              </div>
            </div>

            {/* Data Ibu */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 border-b pb-2">
                Data Ibu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('Nama Ibu', 'nama_ibu', 'text', false)}
                {renderField(
                  'Tempat Lahir Ibu',
                  'tempat_lahir_ibu',
                  'text',
                  false,
                )}
                {renderField(
                  'Tanggal Lahir Ibu',
                  'tanggal_lahir_ibu',
                  'date',
                  false,
                )}
                {renderField(
                  'Pendidikan Ibu',
                  'pendidikan_ibu',
                  'select',
                  false,
                  pendidikanOptions,
                )}
                {renderField('Pekerjaan Ibu', 'pekerjaan_ibu', 'text', false)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <>
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
                  Menyimpan...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isUpdate ? 'Perbarui' : 'Simpan'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailKeluargaForm;
