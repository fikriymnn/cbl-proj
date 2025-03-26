import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../Loading';
import convertTimeStampToDate from '../../../../../utils/convertDate';

function BuatSPKeHR() {
  const [options, setOptions] = useState([]);
  const [options2, setOptions2] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();

  useEffect(() => {
    getMe();
    getMasterUser();
    getSP();
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
  const [sp, setSP] = useState<any>();
  const [detailsp, setdetailSP] = useState<any>();
  async function getSP() {
    const url = `${import.meta.env.VITE_API_LINK}/master/sp`;
    try {
      setIsLoading(true);
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setSP(res.data.data);
      setOptions2(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama + ' - ' + item.masa_berlaku + ' Hari ',
        })),
      );
      console.log(res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
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
        res.data.data.map((item: any) => {
          const latestBagianMesin =
            item.biodata_karyawan[0]?.bagian_mesin_karyawan?.slice(-1)[0]
              ?.nama_bagian_mesin || '';

          return {
            value: item.userid,
            label: `${item.biodata_karyawan[0]?.nik} - ${item.name} - ${item.biodata_karyawan[0]?.nama_jabatan} - ${latestBagianMesin}`,
          };
        }),
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

    console.log(filteredData?.userid);
    setdetailSP(filteredData?.sp_karyawan);
    setIdKaryawan(filteredData?.userid);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();
  const [alasanIzin, setAlasanIzin] = useState<any>();
  const [namasp, setnamaSP] = useState<any>();
  const [masaBerlaku, setmasaBerlaku] = useState<any>();
  async function postIzin() {
    if (alasanIzin == null) {
      alert('Alasan SP Belum Diisi');
      return;
    }
    // console.log(idKaryawan,
    //     idPengaju,
    //     masaBerlaku,
    //     alasanIzin,
    //     namasp,)
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanSP`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          masa_berlaku: masaBerlaku,
          alasan: alasanIzin,
          nama_sp_teguran: namasp,
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

  useEffect(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 2);
  }, []);
  const [labelText, setLabelText] = useState('Alasan SP / Teguran');

  const handleChangePointSP = (selected: any) => {
    const { value } = selected;
    const filteredData = sp.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.nama, filteredData?.masa_berlaku);
    if (filteredData) {
      setnamaSP(filteredData?.nama);
      setmasaBerlaku(filteredData?.masa_berlaku);

      // Menentukan label berdasarkan nama SP
      if (filteredData.nama?.toLowerCase().includes('teguran')) {
        setLabelText('Teguran');
      } else if (filteredData.nama?.toLowerCase().includes('sp')) {
        setLabelText('Alasan SP');
      } else {
        setLabelText('Alasan SP / Teguran');
      }
    }
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
          <div className="flex flex-col gap-2">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              Pilih SP / Teguran
            </label>
            <Select
              placeholder="Cari..."
              options={options2}
              onChange={(selectedId) => {
                handleChangePointSP(selectedId);
              }}
              className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 px-7 py-4"></div>
        <div className="grid grid-cols-2 gap-5 px-7 py-4">
          <div className="flex flex-col gap-3">
            <label className=" text-[#6c6b6b] text-sm font-semibold">
              SP Aktif
            </label>
            <table className="w-auto border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-2 py-1">No</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Nama SP Teguran
                  </th>
                  <th className="border border-gray-300 px-2 py-1">Dari</th>
                  <th className="border border-gray-300 px-2 py-1">Sampai</th>
                  <th className="border border-gray-300 px-2 py-1">
                    Masa Berlaku
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailsp?.map((detailSP: any, index: any) => (
                  <tr key={index} className="text-center border-b">
                    <td className="border border-gray-300 px-2 py-1">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {detailSP.nama_sp_teguran}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {convertTimeStampToDate(detailSP.dari)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {convertTimeStampToDate(detailSP.sampai)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {detailSP.masa_berlaku}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex w-full flex-col">
              <label className="text-[#6c6b6b] text-sm font-semibold">
                {labelText}
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
        </div>
        <div className="flex w-full justify-end items-end px-7 py-4">
          <>
            <button
              onClick={() => postIzin()}
              disabled={isLoading}
              className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
            >
              AJUKAN
            </button>
          </>
        </div>
      </div>
    </main>
  );
}

export default BuatSPKeHR;
