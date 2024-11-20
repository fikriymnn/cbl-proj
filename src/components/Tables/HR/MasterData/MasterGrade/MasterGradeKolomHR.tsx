import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalKosonganSmall from '../../../../Modals/ModalKosonganSmall';
import Loading from '../../../../Loading';

function MasterGradeKolom() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getGrade();

    }, []);

    const [grade, setGrade] = useState<any>();

    async function getGrade() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/hr/gradeColumn`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setGrade(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [namaGrade, setNamaGrade] = useState<any>();

    async function postMasterMesin() {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/gradeColumn`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    name: namaGrade,

                },
                {

                    withCredentials: true,
                });

            window.location.reload();
            getGrade()
            console.log(res.data);
            setIsLoading(false)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [showEdit, setShowEdit] = useState<any>([]);
    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setShowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setShowEdit(onchangeVal);
    };

    const [namaCutiEdit, setNamaCutiEdit] = useState<any>();

    async function editMasterMesin(id: number) {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/gradeColumn/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    name: namaCutiEdit,

                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();
            getGrade()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function deleteMasterMesin(id: number) {

        const url = `${import.meta.env.VITE_API_LINK}/master/hr/gradeColumn/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.delete(url,
                {

                    withCredentials: true,
                });
            setIsLoading(false)
            window.location.reload();
            getGrade()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [showDelete, setShowDelete] = useState<any>([]);
    const openDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = true;

        setShowDelete(onchangeVal);
    };
    const closeDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = false;

        setShowDelete(onchangeVal);
    };


    return (
        <div>
            <>
                <main className="overflow-x-scroll">
                    {isLoading && <Loading />}

                    <div className="min-w-[700px] bg-white rounded-xl">
                        <div className='flex w-full  pr-8 border-b-8 border-[#D8EAFF] pb-2'>
                            <div className='px-2 py-1 flex w-full justify-end items-center'>
                                <button
                                    onClick={() => openModalHistory()}
                                    className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-2'>
                                    TAMBAH GRADE COLUMN
                                </button>
                                {showHistory == true && (
                                    <>
                                        <ModalKosonganSmall
                                            isOpen={showHistory}
                                            onClose={() => closeModalHistory()}
                                            judul={'Tambah Grade Column'}
                                        >
                                            <>
                                                <div className="grid   gap-3 w-full px-5 py-2">
                                                    <>
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault()
                                                            postMasterMesin()
                                                        }}>
                                                            <div className="flex w-full flex-col">
                                                                <label className="text-black text-xs font-bold">
                                                                    Nama Grade Column
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_grade"
                                                                        onChange={(e) => { setNamaGrade(e.target.value) }}
                                                                        type="text"
                                                                        className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                    />
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
                                                    </>
                                                </div>
                                            </>
                                        </ModalKosonganSmall>
                                    </>
                                )
                                }
                            </div>
                        </div>

                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-11 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">

                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    No
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  col-span-2">
                                    Nama Grade Column
                                </label>

                            </div>
                            <div className="w-2 h-full "></div>
                            {grade != null &&
                                grade?.data?.map((data: any, i: any) => (
                                    <>
                                        <div className="grid grid-cols-11 gap-4 px-3 items-center py-2 border-b-8 border-[#D8EAFF] ">

                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  col-span-8">
                                                {data.name}
                                            </label>
                                            <button
                                                onClick={() => openEdit(i)}
                                                className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                EDIT
                                            </button>
                                            {showEdit[i] == true && (

                                                <ModalKosonganSmall
                                                    isOpen={showEdit[i]}
                                                    onClose={() => closeEdit(i)}
                                                    judul={'Edit Grade Column'}
                                                >
                                                    <>
                                                        <div className="grid   gap-3 w-full px-5 py-2">
                                                            <>

                                                                <div className="flex w-full flex-col">
                                                                    <label className="text-black text-xs font-bold">
                                                                        Nama Grade Column
                                                                    </label>
                                                                    <div className="flex w-full">
                                                                        <input
                                                                            defaultValue={data.name}
                                                                            required
                                                                            name="nama_cuti"
                                                                            onChange={(e) => { setNamaCutiEdit(e.target.value) }}
                                                                            type="text"
                                                                            className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                        />
                                                                    </div>

                                                                </div>


                                                                <div className=" pt-3">
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => editMasterMesin(data.id)}
                                                                        className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                    >
                                                                        SIMPAN
                                                                    </button>
                                                                </div>

                                                            </>
                                                        </div>
                                                    </>
                                                </ModalKosonganSmall>
                                            )}
                                            <button
                                                onClick={() => openDelete(i)}
                                                className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                DELETE
                                            </button>
                                            {showDelete[i] == true && (
                                                <>
                                                    <ModalKosonganSmall
                                                        isOpen={showDelete[i]}
                                                        onClose={() => closeDelete(i)}
                                                        judul={'Hapus Grade Column'}
                                                    >
                                                        <>
                                                            <div className="flex w-full flex-col pt-7 px-2 py-3 justify-center items-center">
                                                                <>
                                                                    <label className="text-black text-xl font-bold">
                                                                        {data.name}
                                                                    </label>
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => deleteMasterMesin(data.id)}
                                                                        className='bg-red-600 h-7 w-full rounded-md text-white text-xs font-bold px-4 py-1'>
                                                                        HAPUS GRADE COLUMN
                                                                    </button>
                                                                </>
                                                            </div>
                                                        </>
                                                    </ModalKosonganSmall>
                                                </>
                                            )
                                            }
                                        </div>
                                    </>
                                ))}
                        </div>
                    </div>
                </main>

            </>

        </div>
    )
}

export default MasterGradeKolom
