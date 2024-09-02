import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Arrow from '../../../../images/icon/arrowDown.svg';
import Burger from '../../../../images/icon/burger.svg';
import Filter from '../../../../images/icon/filter.svg';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';

function CapaMasukQA() {
    const tiket = [
        {
            name: 'EX000003',
            date: '12/22/24 07:00UTC',
            machine: 'R700',

        },
        {
            name: 'EX000003',
            date: '12/22/24 07:00UTC',
            machine: 'R700',

        },
    ]
    const [openButton, setOpenButton] = useState(null);
    const handleClick = (i: any) => {
        setOpenButton((prevState: any) => {
            return prevState === i ? null : i;
        });
    };

    const [showModal1, setShowModal1] = useState<any>([]);
    const openModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];

        onchangeVal[i] = true;

        setShowModal1(onchangeVal);
    };
    const closeModal1 = (i: any) => {
        const onchangeVal: any = [...showModal1];
        onchangeVal[i] = false;

        setShowModal1(onchangeVal);
    };

    const [capacQC, setCapaQC] = useState<any>();

    useEffect(() => {
        getCapaQC();
    }, []);

    async function getCapaQC() {
        const url = `${import.meta.env.VITE_API_LINK}/capa?bagian_tiket=incoming
        `;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setCapaQC(res.data.data);
            console.log(res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    return (

        <>
            <div className=' flex bg-white py-2 w-full  px-5 text-sm font-semibold jus  border-b-1 border-[#D8EAFF]'>
                <div className="flex justify-between w-full">
                    <img src={Filter} alt="" className="mx-3 my-auto" />
                    <input
                        type="search"
                        placeholder="Search"
                        name=""
                        id=""
                        className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
                    />
                </div>

            </div>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]'>
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>
                    <div className='col-span-2'>No. CAPA</div>
                    <div className='col-span-2'>No. JO</div>
                    <div className='col-span-2'>Sumber</div>
                    <div className='col-span-2'>Tujuan</div>
                    <div className='col-span-2'>Status</div>
                    <div className='col-span-2 flex w-full justify-end'>Action</div>
                </div>

            </div>
            {capacQC?.map(
                (data: any, i: number) => {
                    return (
                        <>
                            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                                <p className='w-20'>{i + 1}</p>
                                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>
                                    <div className='col-span-2'>{data?.no_capa}</div>
                                    <div className='col-span-2'>{data?.no_jo}</div>
                                    <div className='col-span-2 uppercase'>{data?.pelapor?.bagian}</div>

                                    <div className='col-span-2 uppercase'>{data?.department}</div>

                                    <div className='col-span-2 text-red-700 bg-yellow-300 rounded-full flex w-full justify-center text-center uppercase'>{data?.status}</div>
                                    <div className='col-span-2 w-full flex justify-end'>
                                        <div className="flex gap-2 items-center justify-center ">
                                            <div>
                                                {data.status == 'menunggu verifikasi qa' ?
                                                    <button
                                                        title="button"
                                                        className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                                        onClick={() => handleClick(i)}
                                                    >
                                                        <img
                                                            src={Burger}
                                                            alt=""
                                                            className="mx-3"
                                                        />
                                                    </button>
                                                    : <>
                                                    </>
                                                }
                                                {openButton == i ? (
                                                    <div className="absolute bg-white p-3 shadow-5 rounded-md">
                                                        {' '}
                                                        {/* Wrap buttons for styling */}
                                                        <div className="flex flex-col gap-1">

                                                            <button
                                                                onClick={() => {

                                                                    openModal1(i);


                                                                }}
                                                                className=" w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                                            >
                                                                PROSES
                                                            </button>


                                                        </div>
                                                        {showModal1[i] == true && (
                                                            <>
                                                                <ModalKosongan

                                                                    isOpen={showModal1[i]}
                                                                    onClose={() => closeModal1(i)}
                                                                    judul={'Form Respon NCR'} >
                                                                    <>

                                                                        <div className='grid grid-cols-2 w-full px-4 py-4'>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <p className='text-sm font-semibold text-black'>
                                                                                    NO CAPA
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    000A
                                                                                </p>
                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    NO JO/IO
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    000A/000B
                                                                                </p>
                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    PRODUK
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    KEMASAN SIRUP
                                                                                </p>

                                                                            </div>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <p className='text-sm font-semibold text-black'>
                                                                                    WAKTU LAPOR
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    20 MEI 2024, 14:00
                                                                                </p>
                                                                                <p className='text-sm font-semibold text-black'>
                                                                                    NAMA PELAPOR
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    ACEP PIERE
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className='grid grid-cols-2 w-full px-4 py-4'>
                                                                            <div className='flex flex-col gap-1'>
                                                                                <p className='text-sm font-semibold text-black'>
                                                                                    CATATAN NCR QA
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    Isi catatan QA
                                                                                </p>
                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    CATATAN NCR MR
                                                                                </p>
                                                                                <p className='text-xl font-normal '>
                                                                                    Isi catatan MR
                                                                                </p>


                                                                            </div>

                                                                        </div>
                                                                        <div className='flex w-full px-4 py-4'>
                                                                            <div className='flex flex-col w-full'>

                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    LAPORAN
                                                                                </p>
                                                                                <div className='flex'>
                                                                                    <div className='flex flex-col gap-1 w-[10%]'>
                                                                                        <p className='text-sm font-semibold text-black pt-2'>
                                                                                            NO
                                                                                        </p>
                                                                                        <p className='text-xl font-normal '>
                                                                                            1
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className='flex flex-col  gap-1  w-[60%]'>
                                                                                        <p className='text-sm font-semibold text-black pt-2'>
                                                                                            KETIDAKSESUAIAN
                                                                                        </p>
                                                                                        <p className='text-xl font-normal '>
                                                                                            Deskripsi ketidaksesuaian
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className='flex flex-col  gap-1  w-[30%] items-end'>
                                                                                        <p className='text-sm font-semibold text-black pt-2'>
                                                                                            GAMBAR
                                                                                        </p>
                                                                                        <p className='text-sm font-normal text-blue-500'>
                                                                                            LIHAT GAMBAR
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    ANALISIS PENYEBAB
                                                                                </p>
                                                                                <textarea
                                                                                    readOnly
                                                                                    className="peer bg-neutral-300 h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                ></textarea>

                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    TINDAKAN PERBAIKAN
                                                                                </p>
                                                                                <textarea
                                                                                    readOnly
                                                                                    className="peer bg-neutral-300 h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                ></textarea>

                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    PENCEGAHAN
                                                                                </p>
                                                                                <textarea
                                                                                    readOnly
                                                                                    className="peer bg-neutral-300 h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                ></textarea>

                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    PENCEGAHAN EFEKTIF DILAKUKAN
                                                                                </p>
                                                                                <textarea
                                                                                    readOnly
                                                                                    className="peer bg-neutral-300 h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                ></textarea>

                                                                                <p className='text-sm font-semibold text-black pt-2'>
                                                                                    KETERANGAN KETIDAKSESUAIAN
                                                                                </p>
                                                                                <textarea
                                                                                    readOnly
                                                                                    className="peer bg-neutral-300 h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                ></textarea>
                                                                                <div className='flex flex-col w-full'>
                                                                                    <p className='text-sm font-semibold text-black pt-2'>
                                                                                        CATATAN
                                                                                    </p>
                                                                                    <textarea

                                                                                        className="peer  h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                                                                    ></textarea>

                                                                                    <div className='pt-4'>
                                                                                        <input

                                                                                            type="radio" id="sspoint1" name="sspoint1" value="sesuai" />
                                                                                        <label className='pl-2 text-xl text-black   '>Sesuai</label>
                                                                                    </div>
                                                                                    <div>
                                                                                        <input

                                                                                            type="radio" id="ssspoint1" name="sspoint1" value="tidak sesuai" />
                                                                                        <label className='pl-2 text-xl text-black'>Tidak Sesuai</label>
                                                                                    </div>
                                                                                    <div className="pt-5">
                                                                                        <button

                                                                                            className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                                                                        >
                                                                                            SUBMIT
                                                                                        </button>
                                                                                    </div>

                                                                                </div>

                                                                            </div>

                                                                        </div>

                                                                    </>
                                                                </ModalKosongan>
                                                            </>
                                                        )}

                                                    </div>
                                                ) : (
                                                    ''
                                                )}
                                            </div>

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

export default CapaMasukQA