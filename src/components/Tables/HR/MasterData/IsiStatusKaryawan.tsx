import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function IsiStatusKaryawan() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getKaryawan();

    }, []);

    const [karyawan, setKaryawan] = useState<any>();
    const [namaStatusEdit, setnamaStatusEdit] = useState<any>();
    const [waktuBulanEdit, setWaktuBulanEdit] = useState<any>();
    const [typeEdit, setTypeEdit] = useState<any>();

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/master/statusKaryawan`;
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

    const [namaStatus, setnamaStatus] = useState<any>();
    const [waktuBulan, setWaktuBulan] = useState<any>(null);
    const [type, setType] = useState<any>();

    async function postMasterMesin() {

        const url = `${import.meta.env.VITE_API_LINK}/master/statusKaryawan`;
        try {
            setIsLoading(true)
            const res = await axios.post(url,
                {
                    nama_status: namaStatus,
                    waktu_bulan: waktuBulan,
                    type: type
                },
                {

                    withCredentials: true,
                });
            setIsLoading(false)

            closeModalHistory()
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



    async function editMasterMesin(id: number, i: any) {

        const url = `${import.meta.env.VITE_API_LINK}/master/statusKaryawan/${id}`;
        try {
            setIsLoading(true)
            const res = await axios.put(url,
                {
                    nama_status: namaStatusEdit,
                    waktu_bulan: waktuBulanEdit,
                    type: typeEdit

                },
                {

                    withCredentials: true,
                });


            setIsLoading(false)
            alert('Data Berhasil Diubah')
            closeEdit(i)
            setWaktuBulanEdit(null)
            setTypeEdit(null)
            setnamaStatusEdit(null)
            getKaryawan()

        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }

    async function deleteMasterMesin(id: number) {
        if (window.confirm('Apakah Anda yakin ingin Menghapus Status Karyawan ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/master/statusKaryawan/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.delete(url,
                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                alert('Data Berhasil Dihapus')
                getKaryawan()
                console.log(res.data);
            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const [selectedType, setSelectedType] = useState<any>({});
    const handleTypeChange = (index: any, value: any) => {
        setSelectedType((prev: any) => ({
            ...prev,
            [index]: value,
        }));
        setTypeEdit(value)
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
                                    TAMBAH
                                </button>
                                {showHistory == true && (
                                    <>
                                        <ModalKosonganSmall
                                            isOpen={showHistory}
                                            onClose={() => closeModalHistory()}
                                            judul={'Tambah Status Karyawan'}
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
                                                                    Nama Status
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_divisi"
                                                                        onChange={(e) => { setnamaStatus(e.target.value) }}
                                                                        type="text"
                                                                        className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                    />
                                                                </div>
                                                                <div className='flex gap-4'>
                                                                    <div className='flex gap-1'>
                                                                        <input
                                                                            onChange={(e) => setType(e.target.value)}
                                                                            type='radio' name='type' id='type1' value={'bulan'} />Bulan
                                                                    </div>

                                                                    <div className='flex gap-1'>
                                                                        <input
                                                                            onChange={(e) => setType(e.target.value)}
                                                                            type='radio' name='type' id='type2' value={'hari'} />Hari
                                                                    </div>
                                                                </div>
                                                                <label className="text-black text-xs font-bold">
                                                                    Waktu
                                                                </label>
                                                                <div className="flex w-full">
                                                                    <input
                                                                        required
                                                                        name="nama_divisi"
                                                                        onChange={(e) => { setWaktuBulan(e.target.value) }}
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
                            <div className="grid grid-cols-10 gap-4 px-3 py-4 border-b-8 border-[#D8EAFF] ">

                                <label className="text-neutral-500 text-xs font-semibold  ">
                                    No
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  col-span-2">
                                    Nama Status
                                </label>
                                <label className="text-neutral-500 text-xs font-semibold  col-span-6">
                                    Waktu Bulan
                                </label>

                            </div>
                            <div className="w-2 h-full "></div>
                            {karyawan != null &&
                                karyawan?.data?.map((data: any, i: any) => {


                                    const selectWaktu = data.type;
                                    const initialType = selectedType[i] || selectWaktu;
                                    return (
                                        <>
                                            <div className="grid grid-cols-11 gap-4 px-3 items-center py-2 border-b-8 border-[#D8EAFF] ">

                                                <label className="text-neutral-500 text-xs font-semibold  ">
                                                    {i + 1}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold  col-span-2">
                                                    {data.nama_status}
                                                </label>
                                                <label className="text-neutral-500 text-xs font-semibold  col-span-6">
                                                    {data.waktu_bulan}
                                                </label>
                                                {(data.nama_status == 'tetap' || data.nama_status == 'keluar') ? <></> :

                                                    <>
                                                        <button

                                                            onClick={() => openEdit(i)}
                                                            className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                            EDIT
                                                        </button>
                                                    </>}

                                                {showEdit[i] == true && (

                                                    <ModalKosonganSmall
                                                        isOpen={showEdit[i]}
                                                        onClose={() => closeEdit(i)}
                                                        judul={'Edit Status Karyawan'}
                                                    >
                                                        <>
                                                            <div className="grid   gap-3 w-full px-5 py-2">
                                                                <>

                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Nama Status
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                required
                                                                                name="nama_divisi"
                                                                                defaultValue={data.nama_status}
                                                                                onChange={(e) => { setnamaStatusEdit(e.target.value) }}
                                                                                type="text"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>
                                                                        <div className='flex gap-4'>
                                                                            <div className='flex gap-1'>
                                                                                <input
                                                                                    onChange={(e) => handleTypeChange(i, e.target.value)}
                                                                                    type='radio' name={`typeEdit${i}`}
                                                                                    id={`typeEdit1${i}`} value={'bulan'}
                                                                                    checked={initialType === "bulan"}
                                                                                />Bulan
                                                                            </div>

                                                                            <div className='flex gap-1'>
                                                                                <input
                                                                                    onChange={(e) => handleTypeChange(i, e.target.value)}
                                                                                    type='radio' name={`typeEdit${i}`}
                                                                                    id={`typeEdit2${i}`} value={'hari'}
                                                                                    checked={initialType === "hari"}
                                                                                />Hari
                                                                            </div>
                                                                        </div>
                                                                        <label className="text-black text-xs font-bold">
                                                                            Waktu
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                required
                                                                                name="nama_divisi"
                                                                                defaultValue={data.waktu_bulan}
                                                                                onChange={(e) => { setWaktuBulanEdit(e.target.value) }}
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
                                                {(data.nama_status == 'tetap' || data.nama_status == 'keluar') ? <></> :

                                                    <>
                                                        <button
                                                            onClick={() => deleteMasterMesin(data.id)}
                                                            className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                            DELETE
                                                        </button>
                                                    </>
                                                }
                                            </div>
                                        </>
                                    )
                                })}
                        </div>
                    </div>
                </main>

            </>

        </div>
    )
}

export default IsiStatusKaryawan
