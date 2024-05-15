import axios from 'axios';
import { MasterAnalisis, MasterMachine } from '../../../types/master';
import { useEffect, useState } from 'react';


const brandData: MasterAnalisis[] = [
    {
        kategori: 'PRODUKSI',
        kodemtc: 'N',
        analisismtc: 'SIRKULASI OLI TIDAK NORMAL'
    },
    {
        kategori: 'PRODUKSI',
        kodemtc: 'O',
        analisismtc: 'PERGERAKAN MEKANIKAL TIDAK NORMAL'
    },
    {
        kategori: 'QUALITY',
        kodemtc: 'A',
        analisismtc: 'GALENG/GALUR'
    },
    {
        kategori: 'QUALITY',
        kodemtc: 'B',
        analisismtc: 'KOTOR'
    },
];
const TableAnalisis = () => {
    const [isMobile, setIsMobile] = useState(false);
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

    const [masterAnalisis, setmasterAnalisis] = useState<any>();
    useEffect(() => {

        getmasterAnalisis();
    }, []);
    async function getmasterAnalisis() {
        const url = `${import.meta.env.VITE_API_LINK}/master/kodeAnalisis`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setmasterAnalisis(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }
    return (
        <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            {!isMobile && (
                <>
                    <div className='flex w-full justify-end pr-8 border-b border-stroke pb-2'>
                        <button className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1'>
                            TAMBAH ANALISIS MTC
                        </button>
                    </div>

                    <div className="flex flex-col">

                        <div
                            className='flex border-b border-stroke dark:border-strokedark'


                        >
                            <div className="flex w-1/12 justify-center items-center gap-4 p-2.5 ">

                                <p className="  hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                                    No
                                </p>
                            </div>

                            <div className="flex items-center w-2/12 justify-start p-2.5 ">
                                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Kategori</p>
                            </div>
                            <div className="flex items-center text-[14px] w-2/12 justify-start p-2.5 ">
                                <p className="text-slate-600 font-semibold text-center dark:text-white">Kode MTC</p>
                            </div>

                            <div className="flex items-center text-[14px] w-5/12 justify-start  p-2.5 ">
                                <p className="text-slate-600 font-semibold text-center">Analisis MTC</p>
                            </div>

                            <div className="flex w-5/12 ">

                            </div>

                        </div>
                        {masterAnalisis != null &&
                            masterAnalisis.map((data: any, i: number) => {
                                return (
                                    <>
                                        <div
                                            className={`flex ${i === brandData.length - 1
                                                ? ''
                                                : 'border-b border-stroke dark:border-strokedark'
                                                }`}
                                            key={i}
                                        >
                                            <div className="flex justify-center items-center w-1/12   gap-3 p-2.5">

                                                <p className="hidden text-[14px] text-black dark:text-white sm:block">
                                                    {i + 1}
                                                </p>
                                            </div>

                                            <div className="flex items-center w-2/12 justify-start p-2.5 ">
                                                <p className="text-slate-600 text-[14px] font-semibold text-center uppercase dark:text-white">{data.bagian_analisis}</p>
                                            </div>
                                            <div className="flex items-center text-[14px] w-2/12 justify-start p-2.5 ">
                                                <p className="text-slate-600 font-semibold text-center dark:text-white">{data.kode_analisis}</p>
                                            </div>

                                            <div className="flex items-center text-[14px] w-5/12 justify-start  p-2.5 ">
                                                <p className="text-slate-600 font-semibold text-start">{data.nama_analisis}</p>
                                            </div>

                                            <div className="flex w-1/12 ">

                                            </div>

                                            <div className="flex items-center w-4/12 justify-end p-2.5 gap-2 pr-10">
                                                <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                    EDIT
                                                </button>
                                                <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                                    DELETE
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })}
                    </div>
                </>
            )}
            {isMobile && (
                <>
                    <div className='flex w-full justify-end pr-8 border-b border-stroke pb-2'>
                        <button className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1'>
                            ADD MACHINE
                        </button>
                    </div>

                    <div className="flex flex-col w-full ">

                        <div
                            className='flex border-b border-stroke dark:border-strokedark'


                        >

                            <div className="flex items-center w-3/12 justify-end p-2.5 ">
                                <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Kode</p>
                            </div>
                            <div className="flex items-center text-[14px] w-4/12 justify-start p-2.5 pl-4">
                                <p className="text-slate-600 font-semibold text-center dark:text-white">Nama</p>
                            </div>

                            <div className="flex items-center text-[14px] w-4/12 justify-start  p-2.5 ">
                                <p className="text-slate-600 font-semibold text-center"> Tipe</p>
                            </div>
                            <div className="flex items-center text-[14px] w-4/12 justify-start p-2.5  ">
                                <p className="text-slate-600 font-semibold text-center"> Location</p>
                            </div>

                        </div>
                        {brandData.map((brand, key) => (
                            <>
                                <div
                                    className={`flex ${key === brandData.length - 1
                                        ? 'w-full'
                                        : ' px-3 w-full'
                                        }`}
                                    key={key}
                                >
                                    <div className="flex items-center w-2/12 justify-center p-2.5">
                                        <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white"></p>
                                    </div>
                                    <div className="flex items-center text-[14px] w-4/12 justify-center p-2.5 ">
                                        <p className="text-slate-600 font-semibold text-center dark:text-white"></p>
                                    </div>

                                    <div className="flex items-center text-[14px] w-5/12 justify-center p-2.5 ">
                                        <p className="text-slate-600 font-semibold text-center dark:text-white"></p>
                                    </div>
                                    <div className="flex items-center text-[14px] w-4/12 justify-center p-2.5 ">
                                        <p className="text-slate-600 font-semibold text-center"></p>
                                    </div>


                                </div>
                                <div className="flex items-start w-full justify-start p-2.5 gap-2 border-b border-stroke dark:border-strokedark">
                                    <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                        EDIT
                                    </button>
                                    <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                        DELETE
                                    </button>
                                </div>
                            </>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TableAnalisis;
