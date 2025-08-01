import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
function MasterDrying() {
    const [isLoading, setIsLoading] = useState(false);
    const [dryingTime, setMasterDryingTime] = useState<any>();
    useEffect(() => {
        getmasterKategori()
    }, []);

    async function getmasterKategori() {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/dryingTime`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                withCredentials: true,
            });
            setIsLoading(false)
            setMasterDryingTime(res.data);
            console.log('DryingTime', res.data);
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);

    const [nama, setNama] = useState<any>();
    const [jam, setJam] = useState<any>();

    async function postMasterDryingTime() {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/dryingTime`;
        try {
            setIsLoading(true)
            const res = await axios.post(url, {

                nama: nama,
                jam: jam,

            }, {
                withCredentials: true,
            });
            setIsLoading(false)

            setNama('')
            setJam('')

            getmasterKategori();
            closeModalHistory()
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    const [namaEdit, setNamaEdit] = useState<any>();
    const [jamEdit, setJamEdit] = useState<any>(0);

    async function putMasterDryingTime(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/ppic/dryingTime/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url, {

                nama: namaEdit,
                jam: jamEdit,

            }, {
                withCredentials: true,
            });
            setIsLoading(false)

            setNamaEdit('')
            setJamEdit(0)

            getmasterKategori();
            closeModalHistory()
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    async function hapusDryingTime(id: any) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Drying Time Ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/master/ppic/dryingTime/${id}`;
            try {

                setIsLoading(true)
                const res = await axios.delete(url,

                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                getmasterKategori()
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [showEdit, setshowEdit] = useState<any>([]);
    const openEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = true;

        setshowEdit(onchangeVal);
    };
    const closeEdit = (i: any) => {
        const onchangeVal: any = [...showEdit];
        onchangeVal[i] = false;

        setshowEdit(onchangeVal);
    };
    return (
        <main className="overflow-x-scroll ' ">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl flex flex-col gap-1 py-[1%]">
                <div className='flex w-full justify-between pb-2 px-[1%] border-b-8 border-[#D8EAFF]'>

                    <button
                        onClick={() => openModalHistory()}
                        className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1'>
                        TAMBAH DRYING TIME
                    </button>
                    {showHistory == true && (
                        <>
                            <ModalKosonganSmall
                                isOpen={showHistory}
                                onClose={() => closeModalHistory()}
                                judul={'Tambah Drying Time'}
                            >
                                <>
                                    <div className='flex flex-col gap-1 px-[1%] py-[1%]'>

                                        <label className="text-black text-xs font-bold">Grade</label>
                                        <input
                                            onChange={(e) => setNama(e.target.value)}
                                            type="text"
                                            className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                        />
                                        <label className="text-black text-xs font-bold">Jam</label>
                                        <input
                                            onChange={(e) => setJam(e.target.value)}
                                            type="number"
                                            className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                        />
                                        <div className="pt-4">
                                            <button
                                                disabled={isLoading}
                                                onClick={() => postMasterDryingTime()}
                                                className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                            >
                                                {isLoading ? 'Loading...' : 'TAMBAH'}
                                            </button>

                                        </div>
                                    </div>
                                </>
                            </ModalKosonganSmall>
                        </>
                    )
                    }
                </div>
                <div className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                    <p className='text-[#646464] text-xs font-bold col-span-2'>
                        Grade
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Jam
                    </p>

                </div>
                <div className='flex w-full flex-col bg-white'>
                    {dryingTime?.data?.map((data: any, i: number) => (
                        <>
                            <div key={i} className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                <p className='text-[#646464] text-xs font-bold col-span-2'>
                                    {data.nama}
                                </p>
                                <p className='text-[#646464] text-xs font-bold col-span-6'>
                                    {data.jam}
                                </p>
                                <div className='flex flex-col gap-1'>
                                    <button
                                        onClick={() => openEdit(i)}
                                        className='px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Edit
                                    </button>
                                    {showEdit[i] == true && (

                                        <ModalKosonganSmall
                                            isOpen={showEdit[i]}
                                            onClose={() => closeEdit(i)}
                                            judul={'Edit Drying Time'}
                                        >
                                            <>
                                                <div className='flex flex-col gap-1 px-[1%] py-[1%]'>

                                                    <label className="text-black text-xs font-bold">Grade</label>
                                                    <input
                                                        onChange={(e) => setNamaEdit(e.target.value)}
                                                        defaultValue={data.nama}
                                                        type="text"
                                                        className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                    />
                                                    <label className="text-black text-xs font-bold">Jam</label>
                                                    <input
                                                        onChange={(e) => setJamEdit(e.target.value)}
                                                        defaultValue={data.jam}
                                                        type="number"
                                                        className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                                    />
                                                    <div className="pt-4">
                                                        <button

                                                            disabled={isLoading}
                                                            onClick={() => putMasterDryingTime(data.id)}
                                                            className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                                                        >
                                                            {isLoading ? 'Loading...' : 'EDIT'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        </ModalKosonganSmall>
                                    )}
                                    <button
                                        onClick={() => hapusDryingTime(data.id)}
                                        className='px-2 py-1  text-xs bg-red-400 items-center justify-center text-white font-semibold rounded-md flex w-full '>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            </div >
        </main>
    )
}

export default MasterDrying
