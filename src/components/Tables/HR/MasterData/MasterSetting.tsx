import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function MasterSettingHRD() {
    const [isLoading, setIsLoading] = useState(false);
    const [cetakMesin, setCetakMesin] = useState<any>();
    const [okh, setokh] = useState<any>();
    const [tlm, settlm] = useState<any>();
    const [tkm, settkm] = useState<any>();
    const [tpm, settpm] = useState<any>();

    useEffect(() => {
        getCetakMesin();
    }, []);

    async function getCetakMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {

                withCredentials: true,
            });

            setIsLoading(false)

            setCetakMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function putCetakMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/hr/absensi`;
        try {
            setIsLoading(true)
            const res = await axios.put(url, {
                outstanding_karyawan_hari: okh,
                terhitung_lembur_menit: tlm,
                toleransi_kedatangan_menit: tkm,
                toleransi_pulang_menit: tpm
            }, {

                withCredentials: true,
            });

            CloseEdit()
            setIsLoading(false)
            setokh('')
            settlm('')
            settkm('')
            settpm('')
            alert('Berhasil Edit')
            getCetakMesin()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showEdit, setShowEdit] = useState<any>(false)

    const OpenEdit = () => {

        setShowEdit(true);
    };
    const CloseEdit = () => {

        setShowEdit(false);
    };

    return (
        <>

            <main className="overflow-x-scroll">
                {isLoading && <Loading />}
                <div className="min-w-[700px] bg-white rounded-xl">

                    <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                        <div className="grid grid-cols-5 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Deskripsi
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Satuan
                            </label>
                            <div className='flex col-span-3 justify-end'>
                                <button
                                    onClick={OpenEdit}
                                    className='bg-blue-400  flex  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                    Edit
                                </button>
                            </div>
                            {showEdit == true && (
                                <>
                                    <ModalKosonganSmall
                                        isOpen={showEdit}
                                        onClose={() => CloseEdit()}
                                        judul={'Edit Master Setting'}
                                    >
                                        <>
                                            <div className="grid grid-cols-10 px-3 py-1  gap-2 ">
                                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                                    Outstanding Karyawan
                                                </label>
                                                <input
                                                    type='text'
                                                    onChange={(e) => setokh(e.target.value)}
                                                    defaultValue={cetakMesin?.outstanding_karyawan_hari}
                                                    className="text-neutral-500 text-sm font-semibold border-2 border-stroke col-span-4" />
                                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                    Hari
                                                </label>
                                            </div >
                                            <div className="grid grid-cols-10 px-3 py-1  gap-2 ">
                                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                                    Terhitung Lembur
                                                </label>
                                                <input
                                                    type='text'
                                                    onChange={(e) => settlm(e.target.value)}
                                                    defaultValue={cetakMesin?.terhitung_lembur_menit}
                                                    className="text-neutral-500 text-sm font-semibold border-2 border-stroke col-span-4" />
                                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                    Menit
                                                </label>
                                            </div >
                                            <div className="grid grid-cols-10 px-3 py-1  gap-2 ">
                                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                                    Toleransi Kedatangan
                                                </label>
                                                <input
                                                    type='text'
                                                    onChange={(e) => settkm(e.target.value)}
                                                    defaultValue={cetakMesin?.toleransi_kedatangan_menit}
                                                    className="text-neutral-500 text-sm font-semibold border-2 border-stroke col-span-4" />
                                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                    Menit
                                                </label>
                                            </div >
                                            <div className="grid grid-cols-10 px-3 py-1  gap-2 ">
                                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                                    Toleransi Pulang
                                                </label>
                                                <input
                                                    type='text'
                                                    onChange={(e) => settpm(e.target.value)}
                                                    defaultValue={cetakMesin?.toleransi_pulang_menit}
                                                    className="text-neutral-500 text-sm font-semibold border-2 border-stroke col-span-4" />
                                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                                    Menit
                                                </label>
                                            </div >
                                            <div className='flex w-full px-4 py-1'>
                                                <button
                                                    onClick={() => putCetakMesin()}
                                                    className='bg-blue-400 w-full  text-md font-semibold text-white border-2 rounded-md px-2 py-1'>
                                                    Simpan
                                                </button>
                                            </div>
                                        </>
                                    </ModalKosonganSmall>
                                </>
                            )}
                        </div >
                        <div className="grid grid-cols-5 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Outstanding Karyawan
                            </label>
                            <input
                                type='text'
                                readOnly
                                value={cetakMesin?.outstanding_karyawan_hari}
                                className="text-neutral-500 text-sm font-semibold border-2 border-stroke" />
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Hari
                            </label>
                        </div >
                        <div className="grid grid-cols-5 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Terhitung Lembur
                            </label>
                            <input
                                type='text'
                                readOnly
                                value={cetakMesin?.terhitung_lembur_menit}
                                className="text-neutral-500 text-sm font-semibold border-2 border-stroke" />
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Menit
                            </label>
                        </div >
                        <div className="grid grid-cols-5 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Toleransi Kedatangan
                            </label>
                            <input
                                type='text'
                                readOnly
                                value={cetakMesin?.toleransi_kedatangan_menit}
                                className="text-neutral-500 text-sm font-semibold border-2 border-stroke" />
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Menit
                            </label>
                        </div >
                        <div className="grid grid-cols-5 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Toleransi Pulang
                            </label>
                            <input
                                type='text'
                                readOnly
                                value={cetakMesin?.toleransi_pulang_menit}
                                className="text-neutral-500 text-sm font-semibold border-2 border-stroke" />
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Menit
                            </label>
                        </div >
                    </div>
                </div>
            </main>

        </>
    );
}

export default MasterSettingHRD;
