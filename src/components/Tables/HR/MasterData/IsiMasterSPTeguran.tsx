import React, { useEffect, useState } from 'react'
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function IsiMasterSPTeguran() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getKaryawan();

    }, []);

    const [karyawan, setKaryawan] = useState<any>();

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/sp`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setKaryawan(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [namaDepartment, setnamaDepartment] = useState<any>();
    const [masaBerlaku, setmasaBerlaku] = useState<any>();
    async function postMasterMesin() {

        const url = `${import.meta.env.VITE_API_LINK}/master/sp`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    nama: namaDepartment,
                    masa_berlaku: masaBerlaku
                },
                {

                    withCredentials: true,
                });
            setnamaDepartment(null)
            setmasaBerlaku(null)
            closeModalHistory()
            setIsLoading(false)
            getKaryawan()
            console.log(res.data);
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

    const [namaDepartmentEdit, setnamaDepartmentEdit] = useState<any>();
    const [masaBerlakuEdit, setmasaBerlakuEdit] = useState<any>();

    async function editMasterMesin(id: number, i: any) {

        const url = `${import.meta.env.VITE_API_LINK}/master/sp/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    nama: namaDepartmentEdit,
                    masa_berlaku: masaBerlakuEdit

                },
                {

                    withCredentials: true,
                });
            setnamaDepartmentEdit(null)
            setmasaBerlakuEdit(null)
            setIsLoading(false)
            closeEdit(i)
            getKaryawan()
            console.log(res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

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
                                    TAMBAH SP / Teguran
                                </button>
                                {showHistory == true && (
                                    <>
                                        <ModalKosonganSmall
                                            isOpen={showHistory}
                                            onClose={() => closeModalHistory()}
                                            judul={'Tambah SP / Teguran'}
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
                                                                    Nama SP / Teguran
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_divisi"
                                                                        onChange={(e) => { setnamaDepartment(e.target.value) }}
                                                                        type="text"
                                                                        className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>

                                                            </div>
                                                            <div className="flex w-full flex-col">
                                                                <label className="text-black text-xs font-bold">
                                                                    Masa Berlaku (Hari)
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_divisi"
                                                                        onChange={(e) => { setmasaBerlaku(e.target.value) }}
                                                                        type="number"
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
                                    Nama
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  col-span-6">
                                    Masa Berlaku
                                </label>

                            </div>
                            <div className="w-2 h-full "></div>
                            {karyawan != null &&
                                karyawan?.data?.map((data: any, i: any) => (
                                    <>
                                        <div className="grid grid-cols-11 gap-4 px-3 items-center py-2 border-b-8 border-[#D8EAFF] ">

                                            <label className="text-neutral-500 text-xs font-semibold  ">
                                                {i + 1}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  col-span-2">
                                                {data.nama}
                                            </label>
                                            <label className="text-neutral-500 text-xs font-semibold  col-span-6">
                                                {data.masa_berlaku} Hari
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
                                                    judul={'Edit SP / Teguran'}
                                                >
                                                    <>
                                                        <div className="grid   gap-3 w-full px-5 py-2">
                                                            <>

                                                                <div className="flex w-full flex-col">
                                                                    <label className="text-black text-xs font-bold">
                                                                        Nama  SP / Teguran
                                                                    </label>
                                                                    <div className="flex w-full">
                                                                        <input
                                                                            name="nama_divisi"
                                                                            defaultValue={data.nama}
                                                                            onChange={(e) => { setnamaDepartmentEdit(e.target.value) }}
                                                                            type="text"
                                                                            className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                        />
                                                                    </div>

                                                                </div>
                                                                <div className="flex w-full flex-col">
                                                                    <label className="text-black text-xs font-bold">
                                                                        Masa Berlaku (Hari)
                                                                    </label>
                                                                    <div className="flex w-full">
                                                                        <input
                                                                            name="nama_divisi"
                                                                            defaultValue={data.masa_berlaku}
                                                                            onChange={(e) => { setmasaBerlakuEdit(e.target.value) }}
                                                                            type="number"
                                                                            className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                        />
                                                                    </div>

                                                                </div>
                                                                <div className=" pt-3">
                                                                    <button
                                                                        disabled={isLoading}
                                                                        onClick={() => editMasterMesin(data.id, i)}
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

export default IsiMasterSPTeguran
