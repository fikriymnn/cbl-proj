import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../Loading';

function BuatPinjamanKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();

  useEffect(() => {
    getMe();
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
      getMasterUser(res?.data.karyawan.biodata_karyawan[0]?.id_department);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getMasterUser(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        params: {
          is_active: true,
          id_department: id,
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
            item.biodata_karyawan[0]?.nama_jabatan +
            ' - ' +
            (item.biodata_karyawan[0]?.bagian_mesin_karyawan == null
              ? ''
              : item.biodata_karyawan[0]?.bagian_mesin_karyawan[0]
                  ?.nama_bagian_mesin),
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const [statusPinjaman, setStatusPinjaman] = useState<any>();
  const [tipeCicilan, settipeCicilan] = useState<any>();

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = userList.find(
      (item: any) => item.userid == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.userid);

    if (filteredData) {
      setIdKaryawan(filteredData?.userid);

      const hasBelumLunasPinjaman =
        filteredData.karyawan?.pinjaman_karyawan?.some(
          (pinjaman: any) => pinjaman.status_pinjaman === 'belum lunas',
        );

      setStatusPinjaman(hasBelumLunasPinjaman);
    } else {
      setStatusPinjaman(false); // Reset button state if user not found
    }
    settipeCicilan(filteredData?.tipe_penggajian);
    setLimit(filteredData?.limit_pinjaman);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();

  const [keperluanPinjaman, setKeperluanPinjaman] = useState<any>();
  const [jumlahPinjaman, setJumlahPinjaman] = useState<any>();
  const [jumlahCicilan, setJumlahCicilan] = useState<any>();
  const [tempoCicilan, setTempoCicilan] = useState<any>();

  const [jaminanPinjaman, setJaminanPinjaman] = useState<any>();
  const [limit, setLimit] = useState<any>();

  async function postPinjaman() {
    if (jumlahPinjaman == null) {
      alert('Jumlah Pinjaman Belum Diisi');
      return;
    }
    if (tempoCicilan == null) {
      alert('Tempo Cicilan Belum Diisi');
      return;
    }
    if (jaminanPinjaman == null) {
      alert('Jaminan Pinjaman Belum Diisi');
      return;
    }

    if (keperluanPinjaman == null) {
      alert('Keperluan Pinjaman Belum Diisi');
      return;
    }
    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanPinjaman`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          jumlah_pinjaman: jumlahPinjaman,
          jumlah_cicilan: jumlahCicilan,
          tempo_cicilan: tempoCicilan,
          tipe_cicilan: tipeCicilan,
          jaminan_pinjaman: jaminanPinjaman,
          keperluan_pinjaman: keperluanPinjaman,
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
    if (jumlahPinjaman > 0 && tempoCicilan > 0) {
      const calculatedJumlahCicilan = jumlahPinjaman / tempoCicilan;
      setJumlahCicilan(calculatedJumlahCicilan);
    } else {
      setJumlahCicilan(0);
    }
  }, [jumlahPinjaman, tempoCicilan]);

  const formatCurrency = (amount: number): string => {
    return `Rp. ${amount?.toLocaleString('id-ID')}`;
  };
  return (
    <main className="overflow-x-scroll">
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
              className={`relative z-40 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
            ></Select>
          </div>
          <div>
            {!statusPinjaman && (
              <label className=" text-[#6c6b6b] text-sm font-semibold">
                Limit Pinjaman : {formatCurrency(limit)}
              </label>
            )}
            {statusPinjaman && (
              <>
                <div className="text-red-500 items-center flex w-full h-full">
                  Karyawan memiliki pinjaman yang belum lunas
                </div>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 px-7 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col w-full">
              <label className="text-[#6c6b6b] text-sm font-semibold">
                Jumlah Pinjaman
              </label>
              <input
                onChange={(e) => setJumlahPinjaman(parseFloat(e.target.value))}
                type="number"
                className="border-2 border-stroke rounded md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col w-full">
                {tipeCicilan == 'bulanan' ? (
                  <>
                    <label className="text-[#6c6b6b] text-sm font-semibold">
                      Tempo Cicilan (Bulanan)
                    </label>
                    <input
                      placeholder="Masukan Tempo Cicilan (total bulan)"
                      onChange={(e) =>
                        setTempoCicilan(parseFloat(e.target.value))
                      }
                      type="number"
                      className="border-2 border-stroke rounded md"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-[#6c6b6b] text-sm font-semibold">
                      Tempo Cicilan (Mingguan)
                    </label>
                    <input
                      placeholder="Masukan Tempo Cicilan (total minggu)"
                      onChange={(e) =>
                        setTempoCicilan(parseFloat(e.target.value))
                      }
                      type="number"
                      className="border-2 border-stroke rounded md"
                    />
                  </>
                )}
              </div>
              <div className="flex flex-col w-full">
                <label className="text-[#6c6b6b] text-sm font-semibold">
                  Jumlah Cicilan
                </label>
                <input
                  value={jumlahCicilan}
                  readOnly
                  type="number"
                  className="border-2 border-stroke rounded md"
                />
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="text-[#6c6b6b] text-sm font-semibold">
                Jaminan Pinjaman
              </label>
              <input
                onChange={(e) => setJaminanPinjaman(e.target.value)}
                type="text"
                className="border-2 border-stroke rounded md"
              />
            </div>
          </div>

          <div className="flex w-full flex-col">
            <label className="text-[#6c6b6b] text-sm font-semibold">
              Keperluan Pinjaman
            </label>
            <div className="flex w-full h-full">
              <textarea
                name="keperluan_pinjaman"
                onChange={(e) => {
                  setKeperluanPinjaman(e.target.value);
                }}
                className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
              />
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end items-end px-7 py-4">
          {!statusPinjaman && (
            <>
              <button
                onClick={() => {
                  console.log(tipeCicilan);
                  postPinjaman();
                }}
                disabled={isLoading}
                className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
              >
                AJUKAN
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default BuatPinjamanKeHR;
