import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';

function MasterKaryawanIsi() {
  useEffect(() => {
    getKaryawan();
  }, []);

  const [karyawan, setKaryawan] = useState<any>();

  async function getKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {},
        withCredentials: true,
      });
      setKaryawan(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function deleteKaryawan(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Karyawan ini?')) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/${id}`;
      try {
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        getKaryawan();
      } catch (error: any) {
        console.log(error);
      }
    }
  }

  async function cutOffKaryawan(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Cut-Off Karyawan ini?')) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan/cutOff/${id}`;
      try {
        const res = await axios.put(url, {
          withCredentials: true,
        });
        getKaryawan();
      } catch (error: any) {
        console.log(error);
      }
    }
  }
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredAbsen = karyawan?.data?.filter((data: any) => {
    // Name filter
    const nameMatches = data.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Status filter
    const status = data.biodata_karyawan[0]?.status_active || '';
    let statusMatches = true;

    if (statusFilter !== 'all') {
      if (statusFilter === 'lain-lain') {
        // "lain-lain" should match anything that's not "active" or "cut off"
        statusMatches = status !== 'active' && status !== 'cut off';
      } else {
        // Match the specific status
        statusMatches = status === statusFilter;
      }
    }

    return nameMatches && statusMatches;
  });
  return (
    <div>
      <>
        <main className="overflow-x-scroll">
          <div className="min-w-[700px] bg-white rounded-xl">
            <div className=" w-full h-full flex border-b-8 border-[#D8EAFF] px-2 py-3 justify-between">
              <div className="flex gap-10">
                <input
                  type="text"
                  placeholder="Cari Karyawan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-1 w-full border-stroke px-2 py-1 rounded-md bg-blue-100"
                />
                <div className="flex gap-4">
                  <label htmlFor="statusFilter" className="mr-2 font-medium">
                    Status:
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border-1 border-stroke px-2 py-1 rounded-md bg-blue-100"
                  >
                    <option value="active">Active</option>
                    <option value="all">All</option>
                    <option value="cut off">Cut Off</option>
                    <option value="lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>
              <Link to={'/hr/pm/masterkaryawan/add'}>
                <button className="px-8 py-1 text-sm bg-blue-600 items-center justify-center text-white font-semibold rounded-md">
                  TAMBAH PERSONNEL
                </button>
              </Link>
            </div>
            <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
              <div className="grid grid-cols-12 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">
                <div className="flex gap-3">
                  <label className="text-black text-xs font-bold">No</label>
                  <label className="text-neutral-500 text-xs font-semibold ">
                    NIK
                  </label>
                </div>

                <label className="text-neutral-500 text-xs font-semibold ] ">
                  Nama
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  Jenis Kelamin
                </label>

                <label className="text-neutral-500 text-xs font-semibold  ">
                  Divisi
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  Department
                </label>

                <label className="text-neutral-500 text-xs font-semibold  ">
                  Jabatan
                </label>
                <label className="text-neutral-500 text-xs font-semibold ">
                  Tipe Penggajian
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  Tanggal Masuk
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  Tanggal Berhenti
                </label>
                <label className="text-neutral-500 text-xs font-semibold  ">
                  Status Karyawan
                </label>
                <div className="flex justify-center "></div>
              </div>
              <div className="w-2 h-full "></div>
              {karyawan != null &&
                filteredAbsen?.map((data: any, i: any) => (
                  <>
                    <div
                      className={`grid grid-cols-12 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ${
                        data.biodata_karyawan[0]?.status_active == 'cut off'
                          ? 'bg-orange-200'
                          : ''
                      }
                          `}
                    >
                      <div className="flex gap-3">
                        <label className="text-black text-xs font-bold ">
                          {i + 1}
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold ">
                          {data.biodata_karyawan[0]?.nik}
                        </label>
                      </div>

                      <label className="text-neutral-500 text-xs font-semibold ">
                        {data.name}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold">
                        {data.biodata_karyawan[0]?.jenis_kelamin}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.divisi?.nama_divisi}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.department?.nama_department}
                      </label>

                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.nama_jabatan}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.tipe_penggajian}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.tgl_masuk == ''
                          ? '-'
                          : convertTimeStampToDateOnly(
                              data.biodata_karyawan[0]?.tgl_masuk,
                            )}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  ">
                        {data.biodata_karyawan[0]?.tgl_keluar == null
                          ? '-'
                          : convertTimeStampToDateOnly(
                              data.biodata_karyawan[0]?.tgl_keluar,
                            )}
                      </label>
                      <label className="text-neutral-500 text-xs font-semibold  col-span-2">
                        {data.biodata_karyawan[0]?.status?.nama_status ==
                          null ||
                        data.biodata_karyawan[0]?.status?.nama_status == 0
                          ? '-'
                          : data.biodata_karyawan[0]?.status?.nama_status}
                      </label>
                      <div className="lg:flex-col md:flex-col sm:flex  gap-1">
                        <Link
                          className="px-2 py-1  text-xs bg-yellow-400 items-center justify-center text-white font-semibold rounded-md flex w-full"
                          to={`/hr/pm/masterkaryawan/lengkapi`}
                        >
                          <button className=" ">LENGKAPI</button>
                        </Link>
                        <Link
                          className="px-2 py-1  text-xs bg-green-600 items-center justify-center text-white font-semibold rounded-md  flex"
                          to={`/hr/pm/masterkaryawan/detail/${data.userid}`}
                        >
                          <button>DETAIL</button>
                        </Link>
                        <Link
                          className="px-2 py-1 text-xs bg-blue-600 items-center justify-center text-white font-semibold rounded-md  flex"
                          to={`/hr/pm/masterkaryawan/edit/${data.userid}`}
                        >
                          <button>EDIT</button>
                        </Link>
                        <button
                          onClick={() => deleteKaryawan(data.userid)}
                          className="bg-red-600 px-2 py-1 text-xs  items-center justify-center text-white font-semibold rounded-md  flex"
                        >
                          DELETE
                        </button>
                        {data.biodata_karyawan[0]?.status_active !=
                          'cut off' && (
                          <>
                            <button
                              onClick={() => cutOffKaryawan(data.userid)}
                              className="bg-orange-400 px-2 py-1 text-xs  items-center justify-center text-white font-semibold rounded-md  flex"
                            >
                              CUT-OFF
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ))}
            </div>
          </div>
        </main>
      </>
    </div>
  );
}

export default MasterKaryawanIsi;
