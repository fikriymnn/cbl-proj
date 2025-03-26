import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../../Loading';

function BuatSakitKeHR() {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<any>();

  useEffect(() => {
    getMe();
    getMasterUser();
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

    setIdKaryawan(filteredData?.userid);
  };

  const [idKaryawan, setIdKaryawan] = useState<any>();

  const [tglDari, setTglDari] = useState<any>();
  const [tglSampai, setTglSampai] = useState<any>();

  async function postSakit() {
    if (tglDari == null) {
      alert('Tanggal Dari Belum Diisi');
      return;
    }
    if (tglSampai == null) {
      alert('Tanggal Sampai Belum Diisi');
      return;
    }

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanSakit`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_karyawan: idKaryawan,
          id_pengaju: idPengaju,
          dari: tglDari,
          sampai: tglSampai,
          jumlah_hari: daysDifference,
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

  const [daysDifference, setDaysDifference] = useState<any>();
  const [showError, setShowError] = useState(false);
  const [showErrorEarlyDate, setShowErrorEarlyDate] = useState(false);

  useEffect(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 2);

    if (tglDari && tglSampai) {
      if (tglDari <= tglSampai) {
        if (tglDari <= threeDaysLater) {
          setShowErrorEarlyDate(true);
        } else if (
          tglDari <= today ||
          (tglDari > today && tglDari >= threeDaysLater)
        ) {
          setShowErrorEarlyDate(false);
        }
        const diffInMs = Math.abs(tglSampai - tglDari);
        const days = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
        setDaysDifference(days + 1);
        setShowError(false); // Hide error message
      } else {
        setDaysDifference(null);
        setShowError(true); // Show error message
        setShowErrorEarlyDate(false);
      }
    } else {
      setDaysDifference(null);
      setShowError(false); // Hide error message
      setShowErrorEarlyDate(false);
    }
  }, [tglDari, tglSampai]);

  const handleStartDateChange = (event: any) => {
    setTglDari(new Date(event.target.value));
  };

  const handleEndDateChange = (event: any) => {
    setTglSampai(new Date(event.target.value));
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
        </div>
        <div className="grid grid-cols-2 gap-5 px-7 py-4">
          <div className="flex w-full flex-col">
            <label className="text-[#6c6b6b] text-sm font-semibold">
              Lampiran
            </label>
            <div className="flex w-full h-full">
              <input name="lampiran" type="file" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col  gap-2">
                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                  Dari
                </p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-2"
                  type="date"
                  //onChange={(e) => setDateFrom4(e.target.value)}
                  onChange={handleStartDateChange}
                ></input>
              </div>
              <div className="flex flex-col  gap-2">
                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                  Sampai
                </p>
                <input
                  className="rounded-md bg-[#D8EAFF] px-2"
                  type="date"
                  onChange={handleEndDateChange}
                  //onChange={(e) => setDateFrom4(e.target.value)}
                ></input>
              </div>
            </div>

            {daysDifference !== null && !showError && (
              <label className=" text-[#6c6b6b] text-sm font-semibold">
                Jumlah Hari: {daysDifference}
              </label>
            )}

            {showError && (
              <div className="text-red-500">
                Tanggal dari tidak boleh kurang dari Tanggal Sampai
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full justify-end items-end px-7 py-4">
          {!showError ? (
            <>
              <button
                onClick={() => postSakit()}
                disabled={isLoading}
                className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
              >
                AJUKAN
              </button>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default BuatSakitKeHR;
