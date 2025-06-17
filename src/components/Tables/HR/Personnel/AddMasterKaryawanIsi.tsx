import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
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
      await axios.post(
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

      window.location.reload();
    } catch (error) {
      console.error('Save Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, bagianMesin]);

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
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative z-20 h-10 bg-white dark:bg-form-input w-full">
        <select
          value={value}
          onChange={onChange}
          className="relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
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
        <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill="#637381"
              ></path>
            </g>
          </svg>
        </span>
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
        {required && <span className="text-red-600">*</span>}
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
      <div className="min-w-[700px] h-screen bg-white border-b-8 border-[#D8EAFF]">
        <div className="flex w-full bg-[#eeeeee] px-6 py-3">
          <label className="text-[#0065de] text-sm font-semibold">
            BIODATA
          </label>
        </div>

        <div className="w-full bg-white px-6 py-4 grid grid-cols-2 gap-3">
          {/* Left Column */}
          <div className="flex flex-col gap-2 justify-between">
            <div>
              <label className="text-sm font-semibold">
                NIK<span className="text-red-600">*</span>
              </label>
              <div className="flex w-full gap-7">
                <input
                  value={formData.nik}
                  onChange={(e) => updateFormData('nik', e.target.value)}
                  type="text"
                  className="border-stroke border-2 rounded-md w-[40%]"
                />
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

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">
                  Nama Karyawan<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.namaKaryawan}
                  onChange={(e) =>
                    updateFormData('namaKaryawan', e.target.value)
                  }
                  type="text"
                  className="border-stroke border-2 rounded-md w-[40%]"
                />
              </div>

              <RadioGroup
                label="Tipe Karyawan"
                name="tipeKaryawan"
                options={EMPLOYEE_TYPE_OPTIONS}
                value={formData.tipeKaryawan}
                onChange={(e) => updateFormData('tipeKaryawan', e.target.value)}
                required
              />
            </div>

            <div>
              <SelectField
                label="Department"
                value={formData.idDepartment}
                onChange={(e) => updateFormData('idDepartment', e.target.value)}
                options={masterData.department?.data?.map((data: any) => ({
                  value: data.id,
                  label: data.nama_department,
                }))}
                placeholder="PILIH DEPARTMENT"
                required
              />

              <div className="flex gap-4">
                <div className="w-[60%]">
                  <SelectField
                    label="Divisi"
                    value={formData.idDivisi}
                    onChange={(e) => updateFormData('idDivisi', e.target.value)}
                    options={masterData.divisi?.data?.map((data: any) => ({
                      value: data.id,
                      label: data.nama_divisi,
                    }))}
                    placeholder="PILIH DIVISI"
                    required
                  />
                </div>

                <div className="w-[40%]">
                  <SelectField
                    label="Grade"
                    value={formData.grade}
                    onChange={(e) => updateFormData('grade', e.target.value)}
                    options={masterData.gradeMaster?.data?.map((data: any) => ({
                      value: data.id,
                      label: data.kategori,
                    }))}
                    placeholder="PILIH GRADE"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="flex w-full gap-3">
              <div className="flex flex-col gap-1 w-[50%]">
                <label className="text-sm font-semibold">
                  Tanggal Masuk<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.tglMasuk || ''}
                  onChange={handleTglMasukChange}
                  type="date"
                  className="border-2 border-stroke rounded-md"
                />
              </div>

              <div className="w-[50%]">
                <SelectField
                  label="Status Karyawan"
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
                />
              </div>
            </div>

            <div className="flex w-full gap-3">
              <div className="flex flex-col gap-1 w-[50%]">
                <label className="text-sm font-semibold">Tanggal Keluar:</label>
                <p>{formData.tglKeluar}</p>
              </div>

              <div className="w-[50%]">
                <SelectField
                  label="Status Pajak"
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
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 w-full">
              <SelectField
                label="Tipe Penggajian"
                value={formData.tipePenggajian}
                onChange={(e) =>
                  updateFormData('tipePenggajian', e.target.value)
                }
                options={SALARY_TYPE_OPTIONS}
                placeholder="Tipe Penggajian"
                required
              />

              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold">
                  Gaji<span className="text-red-600">*</span>
                </label>
                <input
                  value={formData.gaji}
                  onChange={(e) => updateFormData('gaji', e.target.value)}
                  type="text"
                  className="border-stroke border-2 rounded-md w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 w-[50%]">
                  <div className="z-50">
                    {bagianMesin?.map((item, index) => (
                      <div
                        key={index}
                        style={{ marginBottom: '10px' }}
                        className="flex gap-1"
                      >
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
                          className={`w-[90%] ${
                            index === 0 ? 'font-bold' : 'font-normal'
                          }`}
                        />
                        <button
                          type="button"
                          className="px-1 text-white bg-red-500 hover:bg-red-600 rounded"
                          onClick={() => handleDeletePoint(index)}
                        >
                          X
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="mt-2 px-2 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded"
                    >
                      + Tambah Bagian
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-[50%]">
                  <label className="text-sm font-semibold">Level</label>
                  <input
                    value={formData.level}
                    onChange={(e) => updateFormData('level', e.target.value)}
                    type="text"
                    className="border-stroke border-2 rounded-md w-[50%]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-[50%]">
                  <SelectField
                    label="Jabatan"
                    value={formData.jabatan}
                    onChange={(e) => updateFormData('jabatan', e.target.value)}
                    options={masterData.jabatanMaster?.data?.map(
                      (data: any) => ({
                        value: data.id,
                        label: data.nama_jabatan,
                      }),
                    )}
                    placeholder="PILIH JABATAN"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 w-[50%]">
                  <label className="text-sm font-semibold">Sub-Level</label>
                  <input
                    value={formData.subLevel}
                    onChange={(e) => updateFormData('subLevel', e.target.value)}
                    type="text"
                    className="border-stroke border-2 rounded-md w-[50%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-end items-end px-8 py-5">
          <button
            onClick={tambahKaryawan}
            className="bg-blue-500 text-white text-md px-4 py-1 rounded-md font-semibold"
          >
            SIMPAN
          </button>
        </div>
      </div>
    </main>
  );
}

export default AddMasterKaryawanIsi;
