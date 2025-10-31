import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Add this import
import Loading from '../../../Loading';
import Select from 'react-select';

// Constants
const API_BASE = import.meta.env.VITE_API_LINK;
const API_BASE_P1 = import.meta.env.VITE_API_LINK_P1;

const TAX_STATUS_OPTIONS = [
  'TK0',
  'TK1',
  'TK2',
  'TK3',
  'K0',
  'K1',
  'K2',
  'K3',
  'KI0',
  'KI1',
  'KI2',
  'KI3',
];

const SALARY_TYPE_OPTIONS = [
  { value: 'mingguan', label: 'MINGGUAN' },
  { value: 'bulanan', label: 'BULANAN' },
];

const GENDER_OPTIONS = [
  { value: 'Laki-Laki', label: 'Laki-Laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'produksi', label: 'Produksi' },
  { value: 'staff', label: 'Staff' },
];

// Custom hook for API calls
const useApiData = () => {
  const [isLoading, setIsLoading] = useState<any>(false);
  const [masterData, setMasterData] = useState<any>({
    department: null,
    bagian: null,
    divisi: null,
    gradeMaster: null,
    karyawanStatus: null,
    jabatanMaster: null,
    mesinMaster: [],
    mesinOptions: [],
  });

  const apiCall = useCallback(
    async (url: string, params = {}, setter: (data: any) => void) => {
      try {
        setIsLoading(true);
        const config = {
          withCredentials: true,
          ...params,
        };
        const res = await axios.get(url, config);
        setter(res.data);
        return res.data;
      } catch (error) {
        console.error('API Error:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchMasterData = useCallback(async () => {
    const endpoints = [
      {
        url: `${API_BASE}/master/hr/department`,
        key: 'department',
        params: { params: { is_active: true } },
      },
      { url: `${API_BASE}/master/hr/bagian`, key: 'bagian' },
      { url: `${API_BASE}/master/hr/divisi`, key: 'divisi' },
      { url: `${API_BASE}/master/hr/grade`, key: 'gradeMaster' },
      { url: `${API_BASE}/master/statusKaryawan`, key: 'karyawanStatus' },
      { url: `${API_BASE}/master/hr/jabatan`, key: 'jabatanMaster' },
    ];

    const results = await Promise.allSettled(
      endpoints.map((endpoint) =>
        apiCall(endpoint.url, endpoint.params || {}, (data) => data),
      ),
    );

    const newMasterData = { ...masterData };
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        newMasterData[endpoints[index].key] = result.value;
      }
    });

    // Fetch mesin data separately
    try {
      const mesinRes = await axios.get(`${API_BASE_P1}/api/list-mesin`);
      newMasterData.mesinMaster = mesinRes.data.data;
      newMasterData.mesinOptions = mesinRes.data.data.map((item: any) => ({
        value: item.mesin,
        label: item.mesin,
      }));
    } catch (error) {
      console.error('Mesin API Error:', error);
    }

    setMasterData(newMasterData);
  }, [apiCall]);

  return { masterData, isLoading, fetchMasterData, setIsLoading };
};

// Form state hook
const useFormState = () => {
  const [formData, setFormData] = useState({
    namaKaryawan: '',
    nik: '',
    jenisKelamin: '',
    idDivisi: '',
    idDepartment: '',
    idStatusKaryawan: '',
    idBagian: '',
    grade: '',
    tglMasuk: null,
    tglKeluar: null,
    tipePenggajian: '',
    jabatan: '',
    statusPajak: '',
    level: '',
    subLevel: '',
    gaji: 0,
    tipeKaryawan: '',
  });

  const [bagianMesin, setBagianMesin] = useState([
    {
      id_bagian_mesin: null,
      nama_bagian_mesin: '',
    },
  ]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { formData, bagianMesin, setBagianMesin, updateFormData };
};

function AddMasterKaryawanIsi() {
  const navigate = useNavigate(); // Add this hook
  const { masterData, isLoading, setIsLoading, fetchMasterData } = useApiData();
  const { formData, bagianMesin, setBagianMesin, updateFormData } =
    useFormState();

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  // Date calculation utility
  const recalculateWaktuKeluar = useCallback(
    (masukDate: string | null, waktuBulan: number | null, type: string) => {
      if (!masukDate || !waktuBulan) return null;
      const date = new Date(masukDate);

      if (type === 'hari') {
        date.setDate(date.getDate() + waktuBulan);
      } else {
        date.setMonth(date.getMonth() + waktuBulan);
      }

      return date.toISOString().split('T')[0];
    },
    [],
  );

  // Event handlers
  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedId = e.target.value;
      updateFormData('idStatusKaryawan', selectedId);

      const selectedStatus = masterData.karyawanStatus?.data?.find(
        (data: any) => data.id === parseInt(selectedId),
      );

      if (selectedStatus) {
        const defaultTglMasuk =
          formData.tglMasuk || new Date().toISOString().split('T')[0];
        const recalculatedKeluar = recalculateWaktuKeluar(
          defaultTglMasuk,
          selectedStatus.waktu_bulan,
          selectedStatus.type,
        );
        updateFormData('tglKeluar', recalculatedKeluar);
      }
    },
    [
      masterData.karyawanStatus,
      formData.tglMasuk,
      updateFormData,
      recalculateWaktuKeluar,
    ],
  );

  const handleTglMasukChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputDate = e.target.value;
      updateFormData('tglMasuk', inputDate);

      const selectedStatus = masterData.karyawanStatus?.data?.find(
        (data: any) => data.id === parseInt(formData.idStatusKaryawan),
      );

      if (selectedStatus) {
        const recalculatedKeluar = recalculateWaktuKeluar(
          inputDate,
          selectedStatus.waktu_bulan,
          selectedStatus.type,
        );
        updateFormData('tglKeluar', recalculatedKeluar);
      }
    },
    [
      masterData.karyawanStatus,
      formData.idStatusKaryawan,
      updateFormData,
      recalculateWaktuKeluar,
    ],
  );

  const handleAddPoint = useCallback(() => {
    setBagianMesin((prev) => [
      ...prev,
      { id_bagian_mesin: null, nama_bagian_mesin: '' },
    ]);
  }, [setBagianMesin]);

  const handleDeletePoint = useCallback(
    (index: number) => {
      setBagianMesin((prev) => prev.filter((_, i) => i !== index));
    },
    [setBagianMesin],
  );

  const handleChangePointDepartment = useCallback(
    (selected: any, index: number) => {
      setBagianMesin((prev) => {
        const updated = [...prev];
        updated[index] = {
          id_bagian_mesin: null,
          nama_bagian_mesin: selected.value,
        };
        return updated;
      });
    },
    [setBagianMesin],
  );

  const tambahKaryawan = useCallback(async () => {
    const url = `${API_BASE}/hr/karyawan`;
    try {
      setIsLoading(true);
      const response = await axios.post(
        url,
        {
          id_status_karyawan: formData.idStatusKaryawan,
          nama_karyawan: formData.namaKaryawan,
          tipe_karyawan: formData.tipeKaryawan,
          nik: formData.nik,
          jenis_kelamin: formData.jenisKelamin,
          id_divisi: formData.idDivisi,
          id_department: formData.idDepartment,
          bagian_mesin: bagianMesin,
          id_grade: formData.grade,
          tgl_masuk: formData.tglMasuk,
          tgl_keluar: formData.tglKeluar,
          tipe_penggajian: formData.tipePenggajian,
          id_jabatan: formData.jabatan,
          status_pajak: formData.statusPajak,
          level: formData.level,
          sub_level: formData.subLevel,
          gaji: formData.gaji,
          kontrak_dari: null,
          kontrak_sampai: null,
        },
        { withCredentials: true },
      );
      console.log(response);
      // Check if the request was successful and get the ID from response
      if (response.status === 200 || response.status === 201) {
        // Assuming the API returns the created karyawan data with an ID
        // Adjust the property name based on your API response structure
        const karyawanId = response.data.id || response.data.data?.id_karyawan;

        if (karyawanId) {
          // Navigate to the edit page with the ID
          navigate(`/hr/personnel/employee/edit/${karyawanId}`);
        } else {
          console.error('No ID returned from API response');
          // Optionally show an error message to the user
        }
      }
    } catch (error) {
      console.error('Save Error:', error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  }, [formData, bagianMesin, navigate]);

  // SelectField props interface
  interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options?: Array<{ value: string | number; label: string }>;
    placeholder: string;
    required?: boolean;
  }

  // Reusable components
  const SelectField = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    required = false,
  }: SelectFieldProps) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold">
        {label}
        {required}
      </label>
      <div className="relative z-20 h-10 bg-white dark:bg-form-input w-full">
        <select
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none"
        >
          <option
            value=""
            disabled
            className="text-[#646464] text-xs dark:text-bodydark"
          >
            {placeholder}
          </option>
          {options?.map((option, i) => (
            <option
              key={i}
              value={option.value}
              className="text-gray-800 text-xs font-light dark:text-bodydark"
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );

  interface RadioGroupProps {
    label: string;
    name: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }

  const RadioGroup = ({
    label,
    name,
    options,
    value,
    onChange,
    required = false,
  }: RadioGroupProps) => (
    <div className="flex flex-col gap-1 pt-2">
      <label className="text-sm font-semibold">
        {label}
        {required}
      </label>
      <div className="flex w-full gap-7">
        {options.map((option, i) => (
          <div key={i} className="flex gap-1">
            <input
              type="radio"
              name={name}
              id={`${name}${i}`}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
            />
            <label htmlFor={`${name}${i}`}>{option.label}</label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-t-md border-b-8 border-[#D8EAFF] h-12"></div>
      <div className="min-w-[700px] bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex w-full bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-4 rounded-t-lg">
          <label className="text-[#0065de] text-lg font-bold tracking-wide">
            BIODATA KARYAWAN
          </label>
        </div>

        <div className="w-full bg-white px-8 py-8 grid grid-cols-2 gap-8 rounded-b-lg">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* NIK and Gender Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NIK<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.nik}
                  onChange={(e) => updateFormData('nik', e.target.value)}
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="space-y-2">
                  <RadioGroup
                    name="kelamin"
                    options={GENDER_OPTIONS}
                    value={formData.jenisKelamin}
                    onChange={(e) =>
                      updateFormData('jenisKelamin', e.target.value)
                    }
                    label={''}
                  />
                </div>
              </div>
            </div>

            {/* Nama Karyawan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Karyawan<span className="text-red-600">*</span>
              </label>
              <input
                value={formData.namaKaryawan}
                onChange={(e) => updateFormData('namaKaryawan', e.target.value)}
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Tipe Karyawan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipe Karyawan<span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                <RadioGroup
                  name="tipeKaryawan"
                  options={EMPLOYEE_TYPE_OPTIONS}
                  value={formData.tipeKaryawan}
                  onChange={(e) =>
                    updateFormData('tipeKaryawan', e.target.value)
                  }
                  required
                  label={''}
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department<span className="text-red-600">*</span>
              </label>
              <SelectField
                value={formData.idDepartment}
                onChange={(e) => updateFormData('idDepartment', e.target.value)}
                options={masterData.department?.data?.map((data: any) => ({
                  value: data.id,
                  label: data.nama_department,
                }))}
                placeholder="PILIH DEPARTMENT"
                required
                label={''}
              />
            </div>

            {/* Divisi and Grade Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Divisi<span className="text-red-600">*</span>
                </label>
                <SelectField
                  value={formData.idDivisi}
                  onChange={(e) => updateFormData('idDivisi', e.target.value)}
                  options={masterData.divisi?.data?.map((data: any) => ({
                    value: data.id,
                    label: data.nama_divisi,
                  }))}
                  placeholder="PILIH DIVISI"
                  required
                  label={''}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jabatan<span className="text-red-600">*</span>
                </label>
                <SelectField
                  value={formData.jabatan}
                  onChange={(e) => updateFormData('jabatan', e.target.value)}
                  options={masterData.jabatanMaster?.data?.map((data: any) => ({
                    value: data.id,
                    label: data.nama_jabatan,
                  }))}
                  placeholder="PILIH JABATAN"
                  required
                  label={''}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Grade<span className="text-red-600">*</span>
              </label>
              <SelectField
                value={formData.grade}
                onChange={(e) => updateFormData('grade', e.target.value)}
                options={masterData.gradeMaster?.data?.map((data: any) => ({
                  value: data.id,
                  label: data.kategori,
                }))}
                placeholder="PILIH GRADE"
                required
                label={''}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Tanggal Masuk and Status Karyawan Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Masuk<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.tglMasuk || ''}
                  onChange={handleTglMasukChange}
                  type="date"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Karyawan<span className="text-red-600">*</span>
                </label>
                <SelectField
                  value={formData.idStatusKaryawan}
                  onChange={handleStatusChange}
                  options={masterData.karyawanStatus?.data?.map(
                    (data: any) => ({
                      value: data.id,
                      label:
                        data.nama_status === 'tetap' ||
                        data.nama_status === 'keluar'
                          ? data.nama_status
                          : `${data.nama_status} - ${data.waktu_bulan} - ${
                              data.type === null ? 'Bulan' : data.type
                            }`,
                    }),
                  )}
                  placeholder="PILIH STATUS KARYAWAN"
                  required
                  label={''}
                />
              </div>
            </div>

            {/* Tanggal Keluar and Status Pajak Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Keluar
                </label>
                <div className="px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700">
                  {formData.tglKeluar || '-'}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Pajak<span className="text-red-600">*</span>
                </label>
                <SelectField
                  value={formData.statusPajak}
                  onChange={(e) =>
                    updateFormData('statusPajak', e.target.value)
                  }
                  options={TAX_STATUS_OPTIONS.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                  placeholder="Status Pajak"
                  required
                  label={''}
                />
              </div>
            </div>

            {/* Tipe Penggajian and Gaji Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipe Penggajian<span className="text-red-600">*</span>
                </label>
                <SelectField
                  value={formData.tipePenggajian}
                  onChange={(e) =>
                    updateFormData('tipePenggajian', e.target.value)
                  }
                  options={SALARY_TYPE_OPTIONS}
                  placeholder="Tipe Penggajian"
                  required
                  label={''}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gaji<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.gaji}
                  onChange={(e) => updateFormData('gaji', e.target.value)}
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Bagian Mesin */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bagian Mesin
              </label>
              <div className="space-y-3">
                {bagianMesin?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Select
                        options={masterData.mesinOptions}
                        onChange={(selected) =>
                          handleChangePointDepartment(selected, index)
                        }
                        value={
                          item.nama_bagian_mesin
                            ? masterData.mesinOptions.find(
                                (option: any) =>
                                  option.value === item.nama_bagian_mesin,
                              )
                            : null
                        }
                        placeholder="Select Mesin"
                      />
                    </div>
                    <button
                      type="button"
                      className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      onClick={() => handleDeletePoint(index)}
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
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
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
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Tambah Bagian
                </button>
              </div>
            </div>

            {/* Jabatan and Level Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Level
                </label>
                <input
                  value={formData.level}
                  onChange={(e) => updateFormData('level', e.target.value)}
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Masukkan level"
                />
              </div>
            </div>

            {/* Sub-Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sub-Level
              </label>
              <input
                value={formData.subLevel}
                onChange={(e) => updateFormData('subLevel', e.target.value)}
                type="text"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Masukkan sub-level"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={tambahKaryawan}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            SIMPAN
          </button>
        </div>
      </div>
    </main>
  );
}

export default AddMasterKaryawanIsi;
