import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../../../../Loading';
import ModalKosongan from '../../../../Modals/Qc/NCR/NCRResponQC';


function TableAbsenMentah() {
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const kosong: any = [];

    const [absen, setabsen] = useState<any>();

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
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


    useEffect(() => {

        getabsen(formattedDate, formattedDate);

    }, []);



    const [dateFrom, setDateFrom] = useState<any>(null);
    const [dateTo, setDateTo] = useState<any>(null);

    async function getabsen(dateFrom1: any, dateTo1: any) {
        const url = `${import.meta.env.VITE_API_LINK}/hr/absensiInOut`;
        try {
            setIsLoading(true)
            const res = await axios.get(url, {
                params: {

                    startDate: dateFrom1,
                    endDate: dateTo1,

                },
                withCredentials: true,
            });
            setIsLoading(false)
            setabsen(res.data.data);
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

    const [searchQuery, setSearchQuery] = useState('');
    const filteredAbsen = absen?.filter((data: any) =>
        data.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
        <>
            {!isMobile && (
                <main className="overflow-x-scroll">
                    {isLoading && <Loading />}
                    <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2 border-stroke">
                        <div className="grid md:gap-4 gap-1 md:flex-row grid-cols-12 items-center px-4 py-4 md:mt-0 ">
                            <div className='flex flex-col gap-1 col-span-3'>
                                <div className='flex flex-col'>
                                    <p className="my-auto text-sm text-primary font-semibold ">
                                        Pilih Tanggal
                                    </p>

                                </div>

                                <div className='flex gap-3 flex-col'>
                                    <div className="flex md:justify-center items-center gap-2">
                                        <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                            Dari:
                                        </p>

                                        <input
                                            className='rounded-full bg-[#D8EAFF] px-2'
                                            type="date"
                                            onChange={(e) => {
                                                setDateFrom(e.target.value)
                                                console.log(e.target.value)
                                            }}
                                        ></input>

                                    </div>
                                    <div className="flex md:justify-center items-center gap-2">
                                        <p className=" my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                                            Sampai:
                                        </p>

                                        <input
                                            className='rounded-full bg-[#D8EAFF] px-2'
                                            type="date"
                                            onChange={(e) => setDateTo(e.target.value)}
                                        ></input>

                                    </div>
                                </div>

                            </div>
                            <div className="flex justify-center my-5 col-span-2">
                                {(dateFrom == null || dateTo == null) ?
                                    <>
                                        <button

                                            className="bg-red-600 text-white px-5 py-2 rounded-md my-auto "
                                        >
                                            Pilih Tanggal
                                        </button>
                                    </> :
                                    <>
                                        <button
                                            onClick={() => {
                                                getabsen(dateFrom, dateTo)
                                            }}
                                            className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                        >
                                            Tampilkan
                                        </button>
                                    </>
                                }


                            </div>
                            <div className="flex my-5 col-span-3">
                                <button
                                    onClick={() => {

                                        getabsen(formattedDate, formattedDate)

                                    }}
                                    className="bg-primary text-white px-5 py-2 rounded-md my-auto "
                                >
                                    Hari Ini
                                </button>
                            </div>
                            <div className="flex justify-end my-5 col-span-2 items-end">

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari Nama Karyawan"
                                    className="border p-2 rounded mb-4"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white rounded-xl">

                        <div className=" w-full h-full flex-col border-b-8 border-[#D8EAFF]">
                            <div className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                <div className='flex col-span-2 gap-2'>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        No.
                                    </label>
                                    <label className="text-neutral-500 text-sm font-semibold ">
                                        Nama
                                    </label>
                                </div>

                                <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                    Tanggal
                                </label>



                                <label className="text-neutral-500 text-sm font-semibold col-span-2">
                                    Tipe Check
                                </label>
                            </div>
                            <div className="w-2 h-full "></div>
                            {filteredAbsen?.map((data: any, i: any) => {

                                return (
                                    <>
                                        <div key={i} className="grid grid-cols-12 px-10 py-4 border-b-8 border-[#D8EAFF] gap-2 ">
                                            <div className='flex col-span-2 gap-2'>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {i + 1}
                                                </label>
                                                <label className="text-neutral-500 text-sm font-semibold ">
                                                    {data.nama}
                                                </label>
                                            </div>

                                            <label className="text-neutral-500 text-sm font-semibold col-span-4">
                                                {data.tglCheck}
                                            </label>

                                            <label className="text-neutral-500 text-sm font-semibold col-span-5">
                                                {data.checkType}
                                            </label>
                                            <button
                                                onClick={() => openEdit(i)}
                                                className="w-full bg-blue-600 text-white text-sm py-1 rounded-md"
                                            >
                                                Edit
                                            </button>
                                            {showEdit[i] == true && (

                                                <ModalKosongan
                                                    isOpen={showEdit[i]}
                                                    onClose={() => closeEdit(i)}
                                                    judul={'Lapor'}
                                                >
                                                    <>

                                                    </>
                                                </ModalKosongan>
                                            )}



                                        </div >
                                    </>
                                )
                            })}
                        </div>
                    </div>
                </main >
            )
            }
        </>
    );
}

export default TableAbsenMentah;
