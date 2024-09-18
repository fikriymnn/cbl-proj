import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Filter from '../../../../images/icon/filter.svg';
import ModalNCR4xl from '../../../Modals/Qc/NCR/ModalNCR4xl';
import Loading from '../../../Loading';
import Select from 'react-select'

function NcrDibuatMTC() {

    const [isMobile, setIsMobile] = useState(false);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
    };
    useEffect(() => {
        getDepartment()
        getjoReal()
        getMe()
        handleResize();

        // Event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, []);



    const [ncr, setNcr] = useState([
        {
            id_department: 0,
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
                id_department: 0,
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
    interface DepartmentOption {
        id: number;
        name: string;
    }

    interface NCR {
        id_department: number;
        department: string;

    }


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
            setIsLoading(true);
            const res = await axios.post(
                url,
                {
                    nama_pelapor: namaPelapor,
                    id_pelapor: idpelapor,
                    department_pelapor: departmentPelapor,
                    no_jo: noJO,
                    kategori_laporan: kategori,
                    no_io: noIO,
                    nama_produk: produk,
                    data_department: ncr,
                },
                {
                    withCredentials: true,
                },
            );

            setIsLoading(false);
            window.location.reload();
            //alert(res.data.msg);
        } catch (error: any) {
            console.log(error);
            setIsLoading(false);
            alert(error.data.msg);
        }
    }
    const [isLoading, setIsLoading] = useState(false);

    const [produk, setProduk] = useState<any>();
    const [noJO, setNoJO] = useState<any>();
    const [noIO, setNoIO] = useState<any>();
    const [kategori, setKategori] = useState<any>();

    const [showModal1, setShowModal1] = useState(false);

    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);


    const [ncrMTC, setNcrID] = useState<any>();

    async function getNcrID(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/ncr?id_user=${id}
        `;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });
            console.log(res.data.data)
            setNcrID(res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }


    const [me, setMe] = useState<any>();
    const [idpelapor, setidpelapor] = useState<any>();
    const [namaPelapor, setnamaPelapor] = useState<any>();
    const [departmentPelapor, setdepartmentPelapor] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setMe(res.data);
            setnamaPelapor(res.data.nama)
            setidpelapor(res.data.id)
            setdepartmentPelapor(res.data.bagian)
            getNcrID(res.data.id);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    const [department, setDepartment] = useState<any>();

    async function getDepartment() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-departmen`;
        try {
            const res = await axios.get(url, {

            });

            console.log(res.data)
            setDepartment(res.data)
        } catch (error: any) {
            console.log(error);
        }
    }
    const [joReal, setjoReal] = useState<any>();

    async function getjoReal() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime `;
        try {
            const res = await axios.get(url, {

            });

            console.log(res.data)
            setjoReal(res.data.data)
        } catch (error: any) {
            console.log(error);
        }
    }

    return (

        <>
            <div className=' flex bg-white py-2 w-full  px-5 text-sm font-semibold jus  border-b-1 border-[#D8EAFF]'>
                <div className="flex justify-between w-full">
                    <img src={Filter} alt="" className="mx-3 my-auto" />
                    <button
                        title="button"
                        onClick={openModal1}
                        className="text-xs px-7  h-7 font-bold text-white bg-blue-700  border-blue-700 border rounded-md"
                    >
                        Buat Laporan
                    </button>
                    {showModal1 && (
                        <>
                            <ModalNCR4xl
                                isOpen={showModal1}
                                onClose={closeModal1}
                                judul={'FORM LAPOR NCR'}                            >

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

                                                                onChange={(e) => {

                                                                    setKategori(e.target.value)

                                                                }}
                                                                className={`relative z-20 w-full bg-[#64646424] appearance-none rounded-md h-7 py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input  
                                    }`}
                                                            >
                                                                <option selected disabled className="text-[#646464] text-xs dark:text-bodydark">
                                                                    Pilih Kategori
                                                                </option>

                                                                <option value="man" className="text-[#646464] text-xs dark:text-bodydark">
                                                                    Man
                                                                </option>
                                                                <option value="material" className="text-[#646464] text-xs dark:text-bodydark">
                                                                    Material
                                                                </option>
                                                                <option value="persiapan" className="text-[#646464] text-xs dark:text-bodydark">
                                                                    Persiapan
                                                                </option>
                                                                <option value="system" className="text-[#646464] text-xs dark:text-bodydark">
                                                                    System
                                                                </option>
                                                                <option value="sop" className="text-[#646464] text-xs dark:text-bodydark">
                                                                    SOP
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

                                                {kategori === 'material' || kategori === 'persiapan' ? (
                                                    <>
                                                        <div className=' flex flex-col w-full gap-1'>
                                                            <div className='flex flex-col w-full'>
                                                                <p className='font-bold'>
                                                                    No. JO
                                                                </p>
                                                                <select

                                                                    // options={formattedOptions}
                                                                    name="noJO"
                                                                    onChange={(e) => {

                                                                        setNoJO(e.target.value)
                                                                    }}
                                                                    className={`relative z-20 w-full appearance-none rounded-md border border-stroke bg-transparent py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white}`}
                                                                >
                                                                    {joReal?.map((data: any, i: number) => {

                                                                        return (
                                                                            <option
                                                                                value={data.e_no_jo}
                                                                                className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                                            >
                                                                                {data.e_no_jo}
                                                                            </option>
                                                                        )
                                                                    }
                                                                    )}

                                                                </select >
                                                                <p className='font-bold pt-2'>
                                                                    No. Io
                                                                </p>
                                                                <input
                                                                    onChange={(e) => setNoIO(e.target.value)}
                                                                    type="text" placeholder='Nomor IO' className='bg-white border border-stroke rounded-md h-7 pl-4' >

                                                                </input>

                                                                <p className='font-bold pt-2'>
                                                                    PRODUK
                                                                </p>
                                                                <input
                                                                    onChange={(e) => setProduk(e.target.value)}
                                                                    type="text" placeholder='Nama Produk' className='bg-white border border-stroke rounded-md h-7 pl-4' >

                                                                </input>
                                                            </div>

                                                        </div>
                                                    </>
                                                ) : (
                                                    <>

                                                    </>
                                                )}

                                            </div>

                                            <div className='flex flex-col'>
                                                <button
                                                    onClick={handleAddPoint}
                                                    className=" w-[45%] h-8 rounded-md  bg-blue-600 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                >
                                                    + DEPARTEMENT
                                                </button>
                                                {ncr.map((data: any, i: number) => {

                                                    const formattedOptions = department?.map((item: any) => ({
                                                        value: item.id, // Handle potential variations in "value" property
                                                        label: item.name, // Handle potential variations in "label" property
                                                    }));

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
                                                                                className=" w-[55%]  h-8 rounded-md bg-red-500 text-white text-sm font-bold justify-center items-center  hover:cursor-pointer"
                                                                            >
                                                                                HAPUS DEPARTMENT
                                                                            </button>



                                                                        </div>

                                                                        <div className="relative w-full z-20 bg-white dark:bg-form-input  pt-1 ">


                                                                            <select

                                                                                // options={formattedOptions}
                                                                                name="department"
                                                                                onChange={(e) => {

                                                                                    {
                                                                                        handleChangePoint(e, i)
                                                                                        console.log([e.target.value])
                                                                                    }
                                                                                }}
                                                                                className={`relative z-20 w-full appearance-none rounded-md border border-stroke bg-transparent py-1 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white
                                                                                    }`}
                                                                            >
                                                                                {department?.map((data: any, i: number) => {

                                                                                    return (
                                                                                        <option
                                                                                            value={data.id}
                                                                                            className="text-gray-800 text-xs font-light dark:text-bodydark"
                                                                                        >
                                                                                            {data.name}
                                                                                        </option>
                                                                                    )
                                                                                }
                                                                                )}

                                                                            </select >



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
                                                                                        className=" w-[55%] h-8 rounded-md bg-red-500 text-white text-sm font-bold text-center  px-2 py-2 hover:cursor-pointer"
                                                                                    >
                                                                                        HAPUS KETIDAKSESUAIAN
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
                                                                className=" w-[45%] h-8 mt-2 rounded-md bg-blue-600 text-white text-sm font-bold justify-center items-center px-1 py-2 hover:cursor-pointer"
                                                            >
                                                                + KETIDAKSESUAIAN
                                                            </button>


                                                        </>
                                                    );
                                                })}

                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => { submitNCR() }}
                                                    className=" w-full h-10 rounded-md mt-2 bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 hover:cursor-pointer"
                                                >
                                                    {isLoading ? 'Loading...' : 'KIRIM LAPORAN'}
                                                </button>
                                                {isLoading && <Loading />}
                                            </div >
                                        </div>



                                    </div>

                                </>

                            </ModalNCR4xl>
                        </>
                    )
                    }


                </div>

            </div>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]'>
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-3'>No. NCR</div>
                    <div className='col-span-2'>No. JO</div>
                    <div className='col-span-3'>Kategori Laporan</div>
                    <div className='col-span-2'>Status</div>
                    <div className='col-span-2 flex w-full justify-end'>Action</div>
                </div>

            </div>
            {ncrMTC?.map(
                (data: any, iii: number) => {
                    return (
                        <>
                            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                                <p className='w-20'>{iii + 1}</p>
                                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>
                                    <div className='col-span-3'>{data.no_ncr}</div>
                                    <div className='col-span-2'>{data.no_jo}</div>
                                    <div className='col-span-3 uppercase'>{data.kategori_laporan}</div>
                                    <div className='col-span-2 text-red-700 bg-yellow-300 rounded-full flex w-full text-center justify-center uppercase'>{data.status}</div>
                                    <div className='col-span-2 w-full flex justify-end'>
                                        <div className="flex flex-col items-center justify-center">
                                            <button
                                                title="button"

                                                className="text-xs w-7 h-7 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-md"
                                            >
                                                <img src={Arrow} alt="" className="mx-auto" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    );
                },
            )}



        </>

    )
}

export default NcrDibuatMTC