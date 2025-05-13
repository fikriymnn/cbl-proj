import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function MasterSettingHRD() {
  const [isLoading, setIsLoading] = useState(false);
  const [cetakMesin, setCetakMesin] = useState<any>();
  const [okh, setokh] = useState<any>();
  const [tlm, settlm] = useState<any>();
  const [tkm, settkm] = useState<any>();
  const [tpm, settpm] = useState<any>();
  const [mpch, setmpch] = useState<any>(); // New state for minimal_pengajuan_cuti_hari

  useEffect(() => {
    getCetakMesin();
  }, []);

  async function getCetakMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIsLoading(false);
      setCetakMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function putCetakMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          outstanding_karyawan_hari: okh,
          terhitung_lembur_menit: tlm,
          toleransi_kedatangan_menit: tkm,
          toleransi_pulang_menit: tpm,
          minimal_pengajuan_cuti_hari: mpch, // Add new field to the PUT request
        },
        {
          withCredentials: true,
        },
      );

      CloseEdit();
      setIsLoading(false);
      setokh('');
      settlm('');
      settkm('');
      settpm('');
      setmpch(''); // Clear the new field
      alert('Berhasil Edit');
      getCetakMesin();
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [showEdit, setShowEdit] = useState<any>(false);

  const OpenEdit = () => {
    setShowEdit(true);
  };

  const CloseEdit = () => {
    setShowEdit(false);
  };

  // Common field styles for better display
  const fieldStyle =
    'px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all';
  const labelStyle = 'text-gray-700 text-sm font-semibold';
  const inputStyle =
    'text-gray-800 text-sm font-medium border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent w-full';
  const unitStyle = 'text-gray-600 text-sm font-medium ml-2';

  return (
    <>
      <main className="overflow-x-scroll p-4">
        {isLoading && <Loading />}
        <div className="min-w-[700px] bg-white rounded-xl shadow-md">
          <div className="w-full h-full flex-col">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b">
              <h2 className="text-lg font-bold text-gray-800">
                Master Setting HRD
              </h2>
              <button
                onClick={OpenEdit}
                className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2 text-sm font-semibold text-white rounded-md px-4 py-2 transition-all shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit Setting
              </button>
            </div>

            {/* Display Rows - Made prettier */}
            <div className={`grid grid-cols-12 ${fieldStyle}`}>
              <div className="col-span-5">
                <label className={labelStyle}>Reminder Status Karyawan</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  readOnly
                  value={cetakMesin?.outstanding_karyawan_hari || ''}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <label className={unitStyle}>Hari</label>
              </div>
            </div>

            <div className={`grid grid-cols-12 ${fieldStyle}`}>
              <div className="col-span-5">
                <label className={labelStyle}>Terhitung Lembur</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  readOnly
                  value={cetakMesin?.terhitung_lembur_menit || ''}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <label className={unitStyle}>Menit</label>
              </div>
            </div>

            <div className={`grid grid-cols-12 ${fieldStyle}`}>
              <div className="col-span-5">
                <label className={labelStyle}>Toleransi Kedatangan</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  readOnly
                  value={cetakMesin?.toleransi_kedatangan_menit || ''}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <label className={unitStyle}>Menit</label>
              </div>
            </div>

            <div className={`grid grid-cols-12 ${fieldStyle}`}>
              <div className="col-span-5">
                <label className={labelStyle}>Toleransi Pulang</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  readOnly
                  value={cetakMesin?.toleransi_pulang_menit || ''}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <label className={unitStyle}>Menit</label>
              </div>
            </div>

            {/* New field for minimal_pengajuan_cuti_hari */}
            <div className={`grid grid-cols-12 ${fieldStyle}`}>
              <div className="col-span-5">
                <label className={labelStyle}>Minimal Pengajuan Cuti</label>
              </div>
              <div className="col-span-4">
                <input
                  type="text"
                  readOnly
                  value={cetakMesin?.minimal_pengajuan_cuti_hari || ''}
                  className={inputStyle}
                />
              </div>
              <div className="col-span-3">
                <label className={unitStyle}>Hari</label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {showEdit && (
        <ModalKosonganSmall
          isOpen={showEdit}
          onClose={() => CloseEdit()}
          judul={'Edit Master Setting'}
        >
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-12 items-center gap-2">
              <label className="text-gray-700 text-sm font-semibold col-span-5">
                Outstanding Karyawan
              </label>
              <input
                type="text"
                onChange={(e) => setokh(e.target.value)}
                defaultValue={cetakMesin?.outstanding_karyawan_hari}
                className="text-gray-800 text-sm border border-gray-200 rounded-md px-3 py-2 col-span-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-gray-600 text-sm font-medium col-span-2">
                Hari
              </label>
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <label className="text-gray-700 text-sm font-semibold col-span-5">
                Terhitung Lembur
              </label>
              <input
                type="text"
                onChange={(e) => settlm(e.target.value)}
                defaultValue={cetakMesin?.terhitung_lembur_menit}
                className="text-gray-800 text-sm border border-gray-200 rounded-md px-3 py-2 col-span-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-gray-600 text-sm font-medium col-span-2">
                Menit
              </label>
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <label className="text-gray-700 text-sm font-semibold col-span-5">
                Toleransi Kedatangan
              </label>
              <input
                type="text"
                onChange={(e) => settkm(e.target.value)}
                defaultValue={cetakMesin?.toleransi_kedatangan_menit}
                className="text-gray-800 text-sm border border-gray-200 rounded-md px-3 py-2 col-span-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-gray-600 text-sm font-medium col-span-2">
                Menit
              </label>
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <label className="text-gray-700 text-sm font-semibold col-span-5">
                Toleransi Pulang
              </label>
              <input
                type="text"
                onChange={(e) => settpm(e.target.value)}
                defaultValue={cetakMesin?.toleransi_pulang_menit}
                className="text-gray-800 text-sm border border-gray-200 rounded-md px-3 py-2 col-span-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-gray-600 text-sm font-medium col-span-2">
                Menit
              </label>
            </div>

            {/* New field for minimal_pengajuan_cuti_hari in modal */}
            <div className="grid grid-cols-12 items-center gap-2">
              <label className="text-gray-700 text-sm font-semibold col-span-5">
                Minimal Pengajuan Cuti
              </label>
              <input
                type="text"
                onChange={(e) => setmpch(e.target.value)}
                defaultValue={cetakMesin?.minimal_pengajuan_cuti_hari}
                className="text-gray-800 text-sm border border-gray-200 rounded-md px-3 py-2 col-span-5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-gray-600 text-sm font-medium col-span-2">
                Hari
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => putCetakMesin()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-4 py-2 transition-all shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </ModalKosonganSmall>
      )}
    </>
  );
}

export default MasterSettingHRD;
