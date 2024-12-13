import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@mui/material';
import convertTimeStampToDate from '../../../../utils/converDateTime';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';

function MasterShiftHRD() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    const currentDate = month + '/' + date + '/' + year;
    const navigate = useNavigate();
    const [showModalDetail, setShowModalDetail] = useState<any>([]);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };
    useEffect(() => {
        handleResize();

        // Event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [cetakMesin, setCetakMesin] = useState<any>();

    useEffect(() => {
        getCetakMesin();
    }, []);

    async function getCetakMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift`;
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

    const [showModal, setShowModal] = useState<any>([]);
    const openModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);
    };
    const closeModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);
    };



    const openModalDetail = (i: any, ii: any) => {
        const onchangeVal: any = [...showModalDetail];
        onchangeVal[i][ii] = true;

        setShowModalDetail(onchangeVal);
    };
    const closeModalDetail = (i: any, ii: any) => {
        const onchangeVal: any = [...showModalDetail];
        onchangeVal[i][ii] = false;

        setShowModalDetail(onchangeVal);
    };


    const [showModal1, setShowModal1] = useState(false);

    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);


    const [shift1MasukEdit, setShift1MasukEdit] = useState<any>();
    const [shift1KeluarEdit, setShift1KeluarEdit] = useState<any>();
    const [shift2MasukEdit, setShift2MasukEdit] = useState<any>();
    const [shift2KeluarEdit, setShift2KeluarEdit] = useState<any>();


    async function submitEDitMesin(hari: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift/${hari}`;

        try {
            setIsLoading(true)
            const res = await axios.put(
                url,
                {
                    shift_1_masuk: shift1MasukEdit,
                    shift_1_keluar: shift1KeluarEdit,
                    shift_2_masuk: shift2MasukEdit,
                    shift_2_keluar: shift2KeluarEdit,

                },
                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            getCetakMesin()
            alert('Shift Berhasil Diperbaharui')
        } catch (error: any) {
            console.log(error);
            setIsLoading(false)
            //alert(error.data.msg);
        }
    }
    const [istirahat, setIstirahat] = useState([
        {
            id_shift: '',
            dari: '',
            sampai: '',
            nama: '',

        },
    ]);

    //add Point
    const handleAddPoint = () => {
        setIstirahat([
            ...istirahat,
            {
                id_shift: '',
                dari: '',
                sampai: '',
                nama: '',
            },
        ]);
    };
    const handleChangePointTask = (e: any, i: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = [...istirahat];
        onchangeVal[i][name] = value;
        setIstirahat(onchangeVal);

    };
    async function submitIstirahat() {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift/istirahat`;

        try {
            setIsLoading(true)
            const res = await axios.post(
                url,
                {
                    data_istirahat: istirahat

                },
                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            getCetakMesin()
            alert('Data Istirahat Berhasil Ditambah')
        } catch (error: any) {
            console.log(error);
            setIsLoading(false)
            //alert(error.data.msg);
        }
    }

    const [dariEdit, setDariEdit] = useState<any>();
    const [sampaiEdit, setSampaiEdit] = useState<any>();
    const [namaEdit, setNamaEdit] = useState<any>();

    async function editIstirahat(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/master/shift/istirahat/${id}`;

        try {
            setIsLoading(true)
            const res = await axios.put(
                url,
                {
                    dari: dariEdit,
                    sampai: sampaiEdit,
                    nama: namaEdit

                },
                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            getCetakMesin()
            alert('Data Istirahat Berhasil Ditambah')
        } catch (error: any) {
            console.log(error);
            setIsLoading(false)
            //alert(error.data.msg);
        }
    }
    async function hapusJam(id: any) {

        if (window.confirm('Apakah Anda yakin ingin Menghapus Jam Istirahat ini?')) {
            const url = `${import.meta.env.VITE_API_LINK}/master/shift/istirahat/${id}`;
            try {
                setIsLoading(true)
                const res = await axios.delete(url,

                    {

                        withCredentials: true,
                    });
                setIsLoading(false)
                getCetakMesin()

            } catch (error: any) {
                setIsLoading(false)
                console.log(error);
            }
        }
    }
    const handleChangeIDShift = (e: any, i: number) => {
        const onchangeVal: any = [...istirahat];
        onchangeVal[i]['id_shift'] = e;
        setIstirahat(onchangeVal);
        console.log(onchangeVal)
    };

    const handleDeletePoint = (i: number) => {
        const deleteVal: any = [...istirahat];
        deleteVal.splice(i, 1);
        setIstirahat(deleteVal);
    };
    return (
        <>

            <main className="overflow-x-scroll">
                {isLoading && <Loading />}
                <div className="min-w-[700px] bg-white rounded-xl">
                    <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                        <div className="grid grid-cols-10 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                            <div className='flex gap-1'>

                                <label className="text-neutral-500 text-sm font-semibold ">
                                    No
                                </label>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                    Hari
                                </label>
                            </div>
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Shift 1 Masuk
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Shift 1 Keluar
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Shift 2 Masuk
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                                Shift 2 Keluar
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                Jam Istirahat
                            </label>
                            <div className='col-span-3 justify-end w-full flex'>
                                <>

                                    <button
                                        onClick={() => {

                                            openModal1()
                                        }}
                                        className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                    >
                                        Tambah Istirahat
                                    </button>
                                    {showModal1 && (
                                        <>
                                            <ModalKosonganSmall
                                                isOpen={showModal1}
                                                onClose={closeModal1}
                                                judul={'Tambah Jam Istirahat Shift'}>
                                                <>
                                                    <div className='flex flex-col gap-1 px-4 py-1'>


                                                        <button
                                                            onClick={handleAddPoint}
                                                            className=" w-[45%] h-8 rounded-md  bg-blue-600 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                        >
                                                            +
                                                        </button>
                                                        {
                                                            istirahat?.map((data3: any, iii: any) => {

                                                                return (
                                                                    <>
                                                                        <div className="flex w-full flex-col">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Hari
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <select
                                                                                    name="id_shift"
                                                                                    onChange={(e) => { handleChangePointTask(e, iii) }}

                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                >
                                                                                    <option selected disabled>Pilih Hari</option>
                                                                                    <option value={'Senin'}>Senin</option>
                                                                                    <option value={'Selasa'}>Selasa</option>
                                                                                    <option value={'Rabu'}>Rabu</option>
                                                                                    <option value={'Kamis'}>Kamis</option>
                                                                                    <option value={'Jumat'}>Jumat</option>
                                                                                    <option value={'Sabtu'}>Sabtu</option>
                                                                                    <option value={'Minggu'}>Minggu</option>
                                                                                </select>
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-col">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Nama
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="nama"
                                                                                    onChange={(e) => { handleChangePointTask(e, iii) }}
                                                                                    type="text"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-col">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Jam Masuk
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="dari"
                                                                                    onChange={(e) => { handleChangePointTask(e, iii) }}
                                                                                    type="time"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <div className="flex w-full flex-col">
                                                                            <label className="text-black text-xs font-bold">
                                                                                Jam Keluar
                                                                            </label>
                                                                            <div className="flex w-full">
                                                                                <input
                                                                                    name="sampai"
                                                                                    onChange={(e) => { handleChangePointTask(e, iii) }}
                                                                                    type="time"
                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                />
                                                                            </div>

                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleDeletePoint(iii)}
                                                                            className=" w-[45%]  h-8 rounded-md bg-red-500 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                                        >
                                                                            HAPUS
                                                                        </button>


                                                                    </>
                                                                )
                                                            }
                                                            )}
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={() => submitIstirahat()}
                                                            className=" w-full  h-8 rounded-md bg-blue-500 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                        >
                                                            SIMPAN
                                                        </button>
                                                    </div>
                                                </>
                                            </ModalKosonganSmall>
                                        </>
                                    )
                                    }
                                </>

                            </div>
                        </div>
                        <div className="w-2 h-full "></div>
                        {cetakMesin?.data.map((data: any, i: any) => {
                            return (
                                <>
                                    <div className="grid grid-cols-10 px-3 items-center border-b-8 border-[#D8EAFF] gap-2 ">
                                        <div className='flex gap-1'>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {i + 1}.
                                            </label>
                                            <label className="text-neutral-500 text-sm font-semibold ">
                                                {data.hari}
                                            </label>
                                        </div>
                                        <label className="text-neutral-500 text-sm font-semibold">
                                            {data.shift_1_masuk}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold">
                                            {data.shift_1_keluar}
                                        </label>
                                        <label className="text-neutral-500 text-sm font-semibold">
                                            {data.shift_2_masuk}
                                        </label>

                                        <label className="text-neutral-500 text-sm font-semibold ">
                                            {data.shift_2_keluar}
                                        </label>
                                        <div className='flex flex-col gap-1 col-span-3  justify-end'>
                                            {
                                                data?.istirahat?.map((data2: any, ii: any) => {

                                                    return (
                                                        <>
                                                            <label className="text-neutral-500 text-sm font-semibold flex justify-between ">
                                                                <div>

                                                                    {ii + 1}. {data2.dari} -  {data2.sampai}
                                                                </div>
                                                                {/* <>
                                                                    <button
                                                                        onClick={() => openModalDetail(i, ii)}
                                                                        className={`uppercase px-2 inline-flex rounded-[3px] items-center text-white text-xs font-bold    hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    {showModalDetail[i][ii] && (
                                                                        <>
                                                                            <ModalKosonganSmall
                                                                                isOpen={showModalDetail[i][ii]}
                                                                                onClose={() => closeModalDetail(i, ii)}
                                                                                judul={'Edit Istirahat'}>
                                                                                <>
                                                                                    <div className='px-3 py-2'>

                                                                                        <div className="flex w-full flex-col">
                                                                                            <label className="text-black text-xs font-bold">
                                                                                                Hari : {data2.id_shift}
                                                                                            </label>
                                                                                        </div>
                                                                                        <div className="flex w-full flex-col">
                                                                                            <label className="text-black text-xs font-bold">
                                                                                                Nama
                                                                                            </label>
                                                                                            <div className="flex w-full">
                                                                                                <input
                                                                                                    name="namaEdit"
                                                                                                    onChange={(e) => setNamaEdit(e.target.value)}
                                                                                                    defaultValue={data2.nama}
                                                                                                    type="text"
                                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                                />
                                                                                            </div>

                                                                                        </div>
                                                                                        <div className="flex w-full flex-col">
                                                                                            <label className="text-black text-xs font-bold">
                                                                                                Dari : {data2.dari}
                                                                                            </label>
                                                                                            <div className="flex w-full">
                                                                                                <input
                                                                                                    name="dariEdit"
                                                                                                    type="time"
                                                                                                    onChange={(e) => setDariEdit(e.target.value)}
                                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                                />
                                                                                            </div>

                                                                                        </div>
                                                                                        <div className="flex w-full flex-col">
                                                                                            <label className="text-black text-xs font-bold">
                                                                                                Sampai :{data2.sampai}
                                                                                            </label>
                                                                                            <div className="flex w-full">
                                                                                                <input
                                                                                                    name="sampaiEdit"
                                                                                                    onChange={(e) => setSampaiEdit(e.target.value)}
                                                                                                    type="time"
                                                                                                    className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                                                />
                                                                                            </div>

                                                                                        </div>
                                                                                        <div className=" pt-3">
                                                                                            <button
                                                                                                disabled={isLoading}
                                                                                                onClick={() => editIstirahat(data2.id)}
                                                                                                className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                                            >
                                                                                                SIMPAN
                                                                                            </button>
                                                                                        </div>

                                                                                    </div>
                                                                                </>
                                                                            </ModalKosonganSmall>
                                                                        </>
                                                                    )
                                                                    }   
                                                                </> */}
                                                                <button
                                                                    onClick={() => hapusJam(data2.id)}
                                                                    className={`uppercase px-2 inline-flex rounded-[3px] items-center text-white text-xs font-bold    hover:bg-red-400 border bg-red-600 border-red-600  justify-center`} // Dynamic class assignment
                                                                >
                                                                    hapus
                                                                </button>
                                                            </label>

                                                        </>
                                                    )
                                                }
                                                )
                                            }
                                        </div >

                                        <div className=" flex gap-1 justify-end col-span-2">
                                            <>

                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    Edit
                                                </button>
                                                {showModal[i] == true && (
                                                    <>
                                                        <ModalKosonganSmall
                                                            isOpen={showModal[i]}
                                                            onClose={() => closeModalModal(i)}
                                                            judul={'Edit Shift'}>
                                                            <>
                                                                <div className="grid gap-3 w-full px-5 py-2">
                                                                    <label className="text-black text-sm font-bold">
                                                                        Hari : {data.hari}
                                                                    </label>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 1 Masuk
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_1_masuk"
                                                                                defaultValue={data.shift_1_masuk}
                                                                                onChange={(e) => { setShift1MasukEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 1 Keluar
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_1_keluar"
                                                                                defaultValue={data.shift_1_keluar}
                                                                                onChange={(e) => { setShift1KeluarEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 2 Masuk
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_2_masuk"
                                                                                defaultValue={data.shift_2_masuk}
                                                                                onChange={(e) => { setShift2MasukEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className="flex w-full flex-col">
                                                                        <label className="text-black text-xs font-bold">
                                                                            Shift 2 Keluar
                                                                        </label>
                                                                        <div className="flex w-full">
                                                                            <input
                                                                                name="shift_2_keluar"
                                                                                defaultValue={data.shift_2_keluar}
                                                                                onChange={(e) => { setShift2KeluarEdit(e.target.value) }}
                                                                                type="time"
                                                                                className=" w-[387px] h-10 border-2 border-stroke rounded-md"
                                                                            />
                                                                        </div>

                                                                    </div>
                                                                    <div className=" pt-3">
                                                                        <button
                                                                            disabled={isLoading}
                                                                            onClick={() => submitEDitMesin(data.hari)}
                                                                            className="bg-[#0065DE] text-center text-white text-xs font-bold px-6 py-3 rounded-md"
                                                                        >
                                                                            SIMPAN
                                                                        </button>
                                                                    </div>


                                                                </div>
                                                            </>
                                                        </ModalKosonganSmall>
                                                    </>
                                                )
                                                }
                                            </>

                                        </div>
                                    </div >
                                </>
                            )
                        })}
                    </div >
                </div>
            </main>

        </>
    );
}

export default MasterShiftHRD;
