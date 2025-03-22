import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../Loading';
import ptcbl from '../../../../../images/ptcbl.png';
function BuatPlusKaryawanKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getMe();
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
      setIdPengaju(res.data.id_karyawan);
      setnamaPemohon(res.data.nama);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  const [formData, setFormData] = useState({
    pemohon: '',
    jabatan: '',

    jenisKelamin: 'Pria/Wanita',
    jumlahDetail: '',
    pendidikan: '',
    usia: '',
    pengalaman: '',
    syaratKhusus1: '',
    syaratKhusus2: '',
    syaratKhusus3: '',
    tanggalPengajuan: '',
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <main className="overflow-x-scroll">
      {isLoading && <Loading />}
      <div className="min-w-[700px] bg-white rounded-xl p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
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
              <label className="w-1/4 font-semibold">
                Untuk bagian/jabatan
              </label>
              <span className="w-8 text-center">:</span>
              <input
                type="text"
                name="jabatan"
                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                onChange={handleChange}
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
                      name="jenisKelamin"
                      value="Pria"
                      className="mr-2"
                      onChange={handleChange}
                    />
                    Pria
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Wanita"
                      className="mr-2"
                      onChange={handleChange}
                    />
                    Wanita
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value="Pria/Wanita"
                      className="mr-2"
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
                  onChange={handleChange}
                />
              </div>

              <div className="flex">
                <label className="w-1/4 font-semibold">6. Syarat khusus</label>
                <span className="w-8 text-center">:</span>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <span>a.</span>
                    <input
                      type="text"
                      name="syaratKhusus1"
                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <span>b.</span>
                    <input
                      type="text"
                      name="syaratKhusus2"
                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <span>c.</span>
                    <input
                      type="text"
                      name="syaratKhusus3"
                      className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500"
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
