import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Loading from '../../../Loading';

function FormNcrMTC() {
    const { id } = useParams();
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

    const [cetakMesinAwal, setCetakMesinAwal] = useState<any>();

    useEffect(() => {
        getCetakMesinAwal();
    }, []);

    async function getCetakMesinAwal() {
        const url = `${import.meta.env.VITE_API_LINK}/ncr
        `;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setCetakMesinAwal(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [ncr, setNcr] = useState([
        {
            department: '',
            ketidaksesuaian: [
                {
                    ketidaksesuaian: '',
                    file: '',

                },
            ],
        },
    ]);

    //add Point
    const handleAddPoint = () => {
        setNcr([
            ...ncr,
            {
                department: '',
                ketidaksesuaian: [
                    {
                        ketidaksesuaian: '',
                        file: '',

                    },
                ],
            },
        ]);
    };

    //add Point Task
    const handleAddPointTask = (i: any) => {
        const onchangeVal = [...ncr];
        onchangeVal[i]['ketidaksesuaian'].push({
            ketidaksesuaian: '',
            file: '',

        });
        setNcr(onchangeVal);
    };

    //change value point pm1
    const handleChangePoint = (e: any, i: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = [...ncr];
        onchangeVal[i][name] = value;
        setNcr(onchangeVal);
    };

    //change value point Task pm1
    const handleChangePointTask = (e: any, i: number, ii: number) => {
        const { name, value } = e.target;
        const onchangeVal: any = [...ncr];
        onchangeVal[i]['ketidaksesuaian'][ii][name] = value;
        setNcr(onchangeVal);
    };

    //delete Point pm1
    const handleDeletePoint = (i: number) => {
        const deleteVal: any = [...ncr];
        deleteVal.splice(i, 1);
        setNcr(deleteVal);
    };

    //delete Point task pm1
    const handleDeletePointTask = (i: number, ii: number) => {
        const deleteVal: any = [...ncr];
        deleteVal[i]['ketidaksesuaian'].splice(ii, 1);
        setNcr(deleteVal);
    };

    async function submitNCR() {
        const url = `${import.meta.env.VITE_API_LINK}/ncr`;
        try {
            //setIsLoading(true);
            const res = await axios.post(
                url,
                {
                    no_jo: noJO,
                    kategori_laporan: kategori,
                    no_io: '',
                    nama_produk: produk,
                    data_department: ncr,
                },
                {
                    withCredentials: true,
                },
            );

            //setIsLoading(false);
            window.location.reload();
            //alert(res.data.msg);
        } catch (error: any) {
            console.log(error);
            // setIsLoading(false);
            alert(error.data.msg);
        }
    }

    const [produk, setProduk] = useState<any>();
    const [noJO, setNoJO] = useState<any>();
    const [kategori, setKategori] = useState<any>();

    return (

        <>
            <div className='  bg-white py-4 w-full mt-2 mb-2 px-5 text-sm  rounded-md'>

                <div className='grid grid-cols-2 gap-4'>
                    <div className='flex flex-col w-full '>

                        <div className='w-full'>
                            <div className=' text-black text-xs font-bold'>ISI LAPORAN KETIDAK SESUAIAN</div>
                        </div>

                        <div className=' w-full pt-4 '>
                            <div className=' text-[#646464]   flex flex-col gap-1'>
                                <p className='font-bold'>
                                    KATEGORI LAPORAN
                                </p>
                                <div className="relative z-20 h-10 bg-white dark:bg-form-input  w-full">
                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >

                                        </svg>
                                    </span>

                                    <select
                                        onChange={(e) => setKategori(e.target.value)}
                                        className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                    >
                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                            Pilih Kategori
                                        </option>

                                        <option value="General" className="text-[#646464] text-xs dark:text-bodydark">
                                            General
                                        </option>

                                    </select>

                                    <span className="absolute top-[15px] right-4 z-10 -translate-y-1/2">
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <g opacity="0.8">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                    fill="#637381"
                                                ></path>
                                            </g>
                                        </svg>
                                    </span>

                                </div>


                            </div>

                        </div>

                        <div className='grid grid-cols-12  pt-2 gap-2'>
                            <div className='w-full col-span-6 gap-3'>
                                <div className='flex flex-col gap-1'>
                                    <p className='font-bold'>
                                        WAKTU
                                    </p>
                                    <input type="text" placeholder='ISI' disabled className='bg-[#64646424] rounded-md h-7 pl-4' ></input>
                                </div>


                            </div>
                            <div className='w-full col-span-6 gap-3'>
                                <div className='flex flex-col gap-1'>
                                    <p className='font-bold'>
                                        PELAPOR
                                    </p>
                                    <input type="text" placeholder='ISI' disabled className='bg-[#64646424] rounded-md h-7 pl-4' ></input>
                                </div>

                            </div>
                        </div>
                        <div className=' flex flex-col w-full gap-1'>
                            <div className='flex flex-col w-full'>
                                <p className='font-bold'>
                                    No. JO
                                </p>
                                <input
                                    onChange={(e) => setNoJO(e.target.value)}
                                    type="text" placeholder='Nomor JO' className='bg-white border border-stroke rounded-md h-7 pl-4' ></input>
                                <p className='font-bold pt-2'>
                                    PRODUK
                                </p>
                                <input
                                    onChange={(e) => setProduk(e.target.value)}
                                    type="text" placeholder='Nama Produk' className='bg-white border border-stroke rounded-md h-7 pl-4' ></input>
                            </div>

                        </div>
                    </div>

                    <div className='flex flex-col'>
                        <button
                            onClick={handleAddPoint}
                            className=" w-[20%] h-8 rounded-md  bg-blue-600 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                        >
                            +
                        </button>
                        {ncr.map((data: any, i: number) => {
                            return (
                                <>

                                    <div className='w-full gap-3'>
                                        <div className='grid grid-cols-1'>

                                            <div className='pt-10'>
                                                <div className='flex w-full justify-between'>
                                                    <p className='font-bold'>
                                                        DEPARTEMEN

                                                    </p>

                                                    <button
                                                        onClick={() => handleDeletePoint(i)}
                                                        className=" w-[10%]  h-8 rounded-md bg-red-500 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                    >
                                                        X
                                                    </button>



                                                </div>

                                                <div className="relative w-full z-20 h-7 bg-white dark:bg-form-input  pt-1 ">
                                                    <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >

                                                        </svg>
                                                    </span>

                                                    <select
                                                        name="department"
                                                        onChange={(e) => handleChangePoint(e, i)}
                                                        className={`relative z-20 w-full bg-white border border-stroke appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  }`}>
                                                        <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                            Pilih Departemen
                                                        </option>

                                                        <option value="maintenance" className="text-[#646464] text-xs dark:text-bodydark">
                                                            MTC
                                                        </option>

                                                    </select>

                                                    <span className="absolute top-[18px] right-4 z-30 -translate-y-1/2">
                                                        <svg
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <g opacity="0.8">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    clipRule="evenodd"
                                                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                                    fill="#637381"
                                                                ></path>
                                                            </g>
                                                        </svg>
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                    {data.ketidaksesuaian.map((data2: any, ii: number) => {
                                        return (
                                            <>
                                                <div className='flex flex-col  pt-2 gap-2'>

                                                    <div className='flex flex-col gap-2 h-full'>
                                                        <div className='flex justify-between items-center'>
                                                            <p className='font-bold'>
                                                                KETIDAKSESUAIAN
                                                            </p>
                                                            <button
                                                                onClick={() => handleDeletePointTask(i, ii)}
                                                                className=" w-[8%] h-8 rounded-md bg-red-500 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                                                            >
                                                                X
                                                            </button>

                                                        </div>

                                                        <textarea
                                                            name="ketidaksesuaian"
                                                            value={data2.ketidaksesuaian}
                                                            onChange={(e) =>
                                                                handleChangePointTask(e, i, ii)
                                                            }
                                                            className="peer h-[200px] mt-2 w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                        ></textarea>
                                                        <div className="flex  lg:w-[389px] rounded-md border border-stroke px-2 py-2">
                                                            <label
                                                                htmlFor="formFile"
                                                                className="flex items-center px-12 py-1 rounded-md bg-primary text-white font-medium cursor-pointer hover:bg-primary-dark"
                                                            >
                                                                Pilih File
                                                                <input
                                                                    type="file"
                                                                    id="formFile"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                />
                                                            </label>


                                                        </div>


                                                    </div>

                                                </div>
                                            </>
                                        )
                                    }
                                    )}
                                    <button
                                        onClick={() => handleAddPointTask(i)}
                                        className=" w-[10%] h-10 mt-2 rounded-md bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => { submitNCR() }}
                                        className=" w-full h-10 rounded-md mt-2 bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                                    >
                                        KIRIM LAPORAN
                                    </button>


                                </>
                            );
                        })}


                    </div >
                </div>



            </div>

        </>

    )
}

export default FormNcrMTC