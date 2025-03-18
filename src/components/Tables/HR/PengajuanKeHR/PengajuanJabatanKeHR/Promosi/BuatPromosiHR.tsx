import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../../Loading';

function BuatPromosiHR() {
  const [options, setOptions] = useState([]);
  const [optionsDept, setOptionsDept] = useState([]);
  const [optionsDivisi, setOptionsDivisi] = useState([]);
  const [optionsJabatan, setOptionsJabatan] = useState([]);
  const [optionsGrade, setOptionsGrade] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();
  const [deptList, setdeptList] = useState<any>();
  const [divisiList, setdivisiList] = useState<any>();
  const [jabatanList, setjabatanList] = useState<any>();
  const [gradeList, setgradeList] = useState<any>();
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [idDept, setidDept] = useState<any>();
  const [idDivisi, setidDivisi] = useState<any>();
  const [idJabatan, setidJabatan] = useState<any>();
  const [idGrade, setidGrade] = useState<any>();

  useEffect(() => {
    getMe();
    getMasterUser();
    getMasterDept();
    getMasterDivisi();
    getMasterJabatan();
    getMasterGrade();
  }, []);

  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan);

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterUser() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });

      setUserList(res.data.data);
      console.log('user list', res.data.data);
      setOptions(
        res.data.data.map((item: any) => ({
          value: item.userid,
          label:
            item.biodata_karyawan[0]?.nik +
            ' - ' +
            item.name +
            ' - ' +
            item.biodata_karyawan[0]?.nama_jabatan,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  async function getMasterDept() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setdeptList(res.data.data);
      console.log('Dept list', res.data.data);
      setOptionsDept(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama_department,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  async function getMasterDivisi() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setdivisiList(res.data.data);
      console.log('Divisi list', res.data.data);
      setOptionsDivisi(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama_divisi,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  async function getMasterJabatan() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/jabatan`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setjabatanList(res.data.data);
      console.log('Jabatan list', res.data.data);
      setOptionsJabatan(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama_jabatan,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  async function getMasterGrade() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/grade`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setgradeList(res.data.data);
      console.log('Grade list', res.data.data);
      setOptionsGrade(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.kategori,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }
  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: any) => item.userid == value,
      // item.id.includes(parseInt(value));
    );
    if (filteredData) {
      setSelectedEmployee(filteredData);
    }
    console.log(filteredData?.userid);

    setIdKaryawan(filteredData?.userid);
  };

  const handleChangePointDept = (selected: any) => {
    const { value } = selected;
    const filteredData = deptList.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.id);
    setidDept(filteredData?.id);
  };
  const handleChangePointDivisi = (selected: any) => {
    const { value } = selected;
    const filteredData = divisiList.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.id);
    setidDivisi(filteredData?.id);
  };
  const handleChangePointJabatan = (selected: any) => {
    const { value } = selected;
    const filteredData = jabatanList.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.id);
    setidJabatan(filteredData?.id);
  };
  const handleChangePointGrade = (selected: any) => {
    const { value } = selected;
    const filteredData = gradeList.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.id);
    setidGrade(filteredData?.id);
  };
  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [alasanIzin, setAlasanIzin] = useState<any>();

  const [gaji, setGaji] = useState<string>(''); // Formatted display
  const [gajiRaw, setGajiRaw] = useState<number | null>(null);
  const [masaKerja, setMasaKerja] = useState<string>('');
  const [tanggalDari, setTanggalDari] = useState<string>('');
  const [tanggalSampai, setTanggalSampai] = useState<string>('');

  async function postIzin() {
    if (alasanIzin == null) {
      alert('Alasan Promosi Belum Diisi');
      return;
    }
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPromosi`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          id_department_promosi: idDept,
          id_jabatan_promosi: idJabatan,
          id_divisi_promosi: idDivisi,
          id_grade_promosi: idGrade,
          gaji_promosi: gajiRaw,
          masa_kerja: masaKerja,
          alasan_promosi: alasanIzin,
          type: type,
          tanggal_to: tanggalSampai,
          tanggal_from: tanggalDari,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      window.location.reload();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleGajiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-numeric chars
    setGaji(new Intl.NumberFormat('id-ID').format(Number(rawValue))); // Format display
    setGajiRaw(Number(rawValue)); // Store raw number for API
  };

  // Handle date input changes and calculate `masa_kerja`
  const handleDateChange = () => {
    if (tanggalDari && tanggalSampai) {
      const startDate = new Date(tanggalDari);
      const endDate = new Date(tanggalSampai);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
      const diffMonths = Math.floor(
        (diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30),
      );

      setMasaKerja(`${diffYears} tahun ${diffMonths} bulan`);
    }
  };
  const [type, setType] = useState('promosi'); // Default "promosi"

  const handleTypeChange = (selectedType: any) => {
    setType(selectedType.value);
  };

  return (
    <main className="overflow-x-scroll min-h-screen">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl ">
        <div className="grid grid-cols-2 gap-5  border-b-8 border-[#D8EAFF] px-7 py-4 ">
          <div className="flex flex-col gap-1">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Nama
            </label>
            <Select
              placeholder="Cari..."
              options={options}
              onChange={(selectedId) => {
                handleChangePointDepatment(selectedId);
              }}
              className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#6c6b6b] text-sm font-semibold">
              Jenis Pengajuan
            </label>
            <Select
              options={[
                { value: 'promosi', label: 'Promosi' },
                { value: 'demosi', label: 'Demosi' },
                { value: 'mutasi', label: 'Mutasi' },
              ]}
              defaultValue={{ value: 'promosi', label: 'Promosi' }}
              onChange={handleTypeChange}
              className="w-full rounded border border-stroke py-2 px-3 focus:border-primary"
            />
          </div>
        </div>
        <div className="grid  gap-5  border-b-8 border-[#D8EAFF] px-7 py-4 ">
          {selectedEmployee && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-blue-600 bg-white shadow-lg rounded-lg">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="p-3 border border-blue-400">NIK</th>
                    <th className="p-3 border border-blue-400">Nama</th>
                    <th className="p-3 border border-blue-400">Jabatan</th>
                    <th className="p-3 border border-blue-400">Status</th>
                    <th className="p-3 border border-blue-400">Departemen</th>
                    <th className="p-3 border border-blue-400">Divisi</th>
                    <th className="p-3 border border-blue-400">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center hover:bg-blue-100 transition">
                    <td className="p-3 border border-blue-300">
                      {selectedEmployee.biodata_karyawan[0]?.nik}
                    </td>
                    <td className="p-3 border border-blue-300">
                      {selectedEmployee.name}
                    </td>
                    <td className="p-3 border border-blue-300">
                      {
                        selectedEmployee.biodata_karyawan[0]?.jabatan
                          ?.nama_jabatan
                      }
                    </td>
                    <td className="p-3 border border-blue-300">
                      {
                        selectedEmployee.biodata_karyawan[0]?.status
                          ?.nama_status
                      }
                    </td>
                    <td className="p-3 border border-blue-300">
                      {
                        selectedEmployee.biodata_karyawan[0]?.department
                          ?.nama_department
                      }
                    </td>
                    <td className="p-3 border border-blue-300">
                      {
                        selectedEmployee.biodata_karyawan[0]?.divisi
                          ?.nama_divisi
                      }
                    </td>
                    <td className="p-3 border border-blue-300">
                      {selectedEmployee.biodata_karyawan[0]?.grade?.kategori}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-5 px-7 py-4">
          {type === 'mutasi' && (
            <div className="flex flex-col gap-1">
              <label className="text-[#6c6b6b] text-sm font-semibold">
                Department Tujuan
              </label>
              <Select
                options={optionsDept}
                onChange={(selectedId) => handleChangePointDept(selectedId)}
                className="w-full rounded border border-stroke py-2 px-3 focus:border-primary"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Divisi Tujuan
            </label>
            <Select
              placeholder="Cari..."
              options={optionsDivisi}
              onChange={(selectedId) => {
                handleChangePointDivisi(selectedId);
              }}
              className={`relative w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Jabatan Tujuan
            </label>
            <Select
              placeholder="Cari..."
              options={optionsJabatan}
              onChange={(selectedId) => {
                handleChangePointJabatan(selectedId);
              }}
              className={`relative w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Grade Tujuan
            </label>
            <Select
              placeholder="Cari..."
              options={optionsGrade}
              onChange={(selectedId) => {
                handleChangePointGrade(selectedId);
              }}
              className={`relative  w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Gaji Promosi</label>
            <input
              type="text"
              value={gaji}
              onChange={handleGajiChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Masukkan gaji"
            />
          </div>

          {/* Tanggal Dari */}
          <div className="mb-4">
            <label className="block text-gray-700">Tanggal Dari</label>
            <input
              type="date"
              value={tanggalDari}
              onChange={(e) => {
                setTanggalDari(e.target.value);
                handleDateChange();
              }}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Tanggal Sampai */}
          <div className="mb-4">
            <label className="block text-gray-700">Tanggal Sampai</label>
            <input
              type="date"
              value={tanggalSampai}
              onChange={(e) => {
                setTanggalSampai(e.target.value);
                handleDateChange();
              }}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Masa Kerja */}
          <div className="mb-4">
            <label className="block text-gray-700">Masa Kerja</label>
            <input
              type="text"
              value={masaKerja}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-200"
            />
          </div>
          <div className="flex w-full flex-col">
            <label className="text-[#6c6b6b] text-sm font-semibold">
              {type === 'promosi'
                ? 'Alasan Promosi'
                : type === 'demosi'
                ? 'Alasan Demosi'
                : 'Alasan Mutasi'}
            </label>
            <div className="flex w-full h-full">
              <textarea
                name="alasan_cuti"
                onChange={(e) => {
                  setAlasanIzin(e.target.value);
                }}
                className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end items-end px-7 py-4">
          <button
            onClick={() => postIzin()}
            disabled={isLoading}
            className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
          >
            AJUKAN
          </button>
        </div>
      </div>
    </main>
  );
}

export default BuatPromosiHR;
