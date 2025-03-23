import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../Loading';

function BuatPlusKaryawanKeHR() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getMe();
    getjabatan();
    getDepartment();
  }, []);

  const [me, setMe] = useState<any>();
  const [idPengaju, setIdPengaju] = useState<any>();
  const [namaPemohon, setnamaPemohon] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMe(res.data);
      setIdPengaju(res.data.id_karyawan || 40);
      setnamaPemohon(res.data.nama);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [department, setDepartment] = useState<any>();
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [idDepartment, setidDepartment] = useState<any>();

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/department`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setDepartment(res.data.data);

      // Create department options
      const options = res.data.data.map((dept: any) => ({
        value: dept.id,
        label: dept.nama_department,
      }));
      setDepartmentOptions(options);

      console.log('dept', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [jabatan, setjabatan] = useState<any>();
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [idJabatan, setIdjabatan] = useState<any>();

  async function getjabatan() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/jabatan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setjabatan(res.data.data);

      // Create jabatan options
      const options = res.data.data.map((jab: any) => ({
        value: jab.id,
        label: jab.nama_jabatan,
      }));
      setJabatanOptions(options);

      console.log('jabatan', res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [formData, setFormData] = useState({
    jenis_kelamin: 'Pria/Wanita',
    pendidikan: '',
    usia: '',
    pengalaman: '',
    syarat_Khusus: '',
    jumlahDetail: '',
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  async function postKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanKaryawan`;
    try {
      setIsLoading(true);
      console.log(formData, idDepartment, idJabatan, idPengaju);
      const res = await axios.post(
        url,
        {
          ...formData,
          untuk_id_jabatan: idJabatan,
          untuk_id_department: idDepartment,
          id_pengaju: idPengaju,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      //window.location.reload();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = department.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.id);

    setidDepartment(filteredData?.id);
  };

  const handleChangePointJabatan = (selected: any) => {
    const { value } = selected;
    const filteredData = jabatan.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.id);

    setIdjabatan(filteredData?.id);
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            postKaryawan();
          }}
        >
          <div className="space-y-4 mb-6">
            <div className="flex">
              <label className="w-1/4 font-semibold">Pemohon</label>
              <span className="w-8 text-center">:</span>
              <input
                type="text"
                name="pemohon"
                readOnly
                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                value={namaPemohon}
              />
            </div>

            <div className="flex">
              <label className="w-1/4 font-semibold">Department</label>
              <span className="w-8 text-center">:</span>
              <Select
                placeholder="Pilih Department..."
                options={departmentOptions}
                onChange={handleChangePointDepatment}
                className={`relative z-40 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white'`}
              />
            </div>

            <div className="flex">
              <label className="w-1/4 font-semibold">Jabatan</label>
              <span className="w-8 text-center">:</span>
              <Select
                placeholder="Pilih Jabatan..."
                options={jabatanOptions}
                onChange={handleChangePointJabatan}
                className={`relative z-30 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white'`}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-3">PERSYARATAN:</h3>
            <div className="space-y-3 pl-6">
              <div className="flex">
                <label className="w-1/4 font-semibold">1. Jenis kelamin</label>
                <span className="w-8 text-center">:</span>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Pria"
                      className="mr-2"
                      checked={formData.jenis_kelamin === 'Pria'}
                      onChange={handleChange}
                    />
                    Pria
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Wanita"
                      className="mr-2"
                      checked={formData.jenis_kelamin === 'Wanita'}
                      onChange={handleChange}
                    />
                    Wanita
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Pria/Wanita"
                      className="mr-2"
                      checked={formData.jenis_kelamin === 'Pria/Wanita'}
                      onChange={handleChange}
                    />
                    Pria/Wanita
                  </label>
                </div>
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">2. Jumlah</label>
                <span className="w-8 text-center">:</span>
                <input
                  type="number"
                  name="jumlahDetail"
                  className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.jumlahDetail}
                  onChange={handleChange}
                />
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">3. Pendidikan</label>
                <span className="w-8 text-center">:</span>
                <input
                  type="text"
                  name="pendidikan"
                  className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.pendidikan}
                  onChange={handleChange}
                />
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">4. Usia</label>
                <span className="w-8 text-center">:</span>
                <input
                  type="text"
                  name="usia"
                  className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.usia}
                  onChange={handleChange}
                />
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">5. Pengalaman</label>
                <span className="w-8 text-center">:</span>
                <input
                  type="text"
                  name="pengalaman"
                  className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                  value={formData.pengalaman}
                  onChange={handleChange}
                />
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">6. Syarat khusus</label>
                <span className="w-8 text-center">:</span>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="syarat_Khusus"
                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      value={formData.syarat_Khusus}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={isLoading}
            >
              Ajukan
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default BuatPlusKaryawanKeHR;
