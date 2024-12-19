import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Loading from '../../../../Loading';
import formatInteger from '../../../../../utils/formaterInteger';

function MasterPayroll() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getMasterPayroll();
    }, []);


    const [payroll, setPayroll] = useState<any>();
    const [uangMakanLemburPer, setUangMakanLemburPer] = useState<any>();
    const [upahSakit, setUpahSakit] = useState<any>();

    const [showEdit, setShowEdit] = useState<any>(false);
    const openEdit = () => {

        setShowEdit(true);
    };
    const closeEdit = () => {


        setShowEdit(false);
    };

    async function getMasterPayroll() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/payroll/1`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setPayroll(res.data)

            console.log('grade', res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function editMasterPayroll() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/payroll/`;
        try {
            setIsLoading(true)
            const res = await axios.put(
                url,
                {
                    uang_makan_lembur_per: uangMakanLemburPer,
                    upah_sakit: upahSakit
                },

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            getMasterPayroll()
            closeEdit()
            alert("success")
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    return (
        <main className="overflow-x-scroll">
            {isLoading && <Loading />}
            <div className="min-w-[700px] bg-white rounded-xl ">

                <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF] py-4 justify-end items-end flex px-[4%]">
                    <button
                        onClick={() => openEdit()}
                        className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2'>
                        EDIT MASTER
                    </button>
                    {showEdit == true && (
                        <>
                            <ModalKosonganSmall
                                isOpen={showEdit}
                                onClose={() => closeEdit()}
                                judul={'Edit Master Payroll'}
                            >
                                <>
                                    <div className="grid   gap-3 w-full px-5 py-2">

                                        <form onSubmit={(e) => {
                                            e.preventDefault()

                                            editMasterPayroll()
                                        }}>
                                            <div className="flex w-full flex-col">
                                                <label className="text-black text-xs font-bold">
                                                    Uang Makan Lembur Per
                                                </label>
                                                <div className="flex w-full">
                                                    <input
                                                        required
                                                        name="nama_grade"
                                                        defaultValue={payroll?.uang_makan_lembur_per}
                                                        onChange={(e) => { setUangMakanLemburPer(e.target.value) }}
                                                        type="text"
                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                    />
                                                    <p>Jam</p>
                                                </div>
                                            </div>
                                            <div className="flex w-full flex-col">
                                                <label className="text-black text-xs font-bold">
                                                    Upah Sakit
                                                </label>
                                                <div className="flex w-full">
                                                    <input
                                                        required
                                                        name="nama_grade"
                                                        defaultValue={payroll?.upah_sakit}
                                                        onChange={(e) => { setUpahSakit(e.target.value) }}
                                                        type="text"
                                                        className=" w-[387px] h-6 border-2 border-stroke rounded-md"
                                                    />
                                                    <p>%</p>
                                                </div>
                                            </div>
                                            <div className=" pt-3">
                                                <button
                                                    disabled={isLoading}
                                                    type='submit'
                                                    value='submit'
                                                    className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                >
                                                    SIMPAN
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </>
                            </ModalKosonganSmall>

                        </>
                    )}
                </div>
                <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                    <div className="grid grid-cols-10 gap-2 px-3 items-center py-2 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">
                        <label className="text-neutral-500 text-xs font-semibold  col-span-4">
                            Uang Makan Lembur Per
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold col-span-6">
                            Upah Sakit
                        </label>
                    </div>
                    <div className="w-2 h-full "></div>

                    <div className="flex gap-2 px-3 py-4 border-b-8 border-[#D8EAFF] overflow-x-scroll max-w-screen">
                        <label className="text-neutral-500 text-xs font-semibold  w-[40%]">
                            {`${payroll?.uang_makan_lembur_per} Jam`}
                        </label>
                        <label className="text-neutral-500 text-xs font-semibold w-[30%]">
                            {`${payroll?.upah_sakit} %`}
                        </label>

                        <div className="text-neutral-500 text-xs font-semibold  w-[30%]">

                        </div>
                    </div>


                </div >

            </div>
        </main>
    )
}

export default MasterPayroll
