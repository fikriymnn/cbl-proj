import React, { useEffect, useState } from 'react'
import Filter from '../../../../images/icon/filter.svg';
import Burger from '../../../../images/icon/burger.svg';
import Arrow from '../../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import ModalSPBService from '../../../Modals/ModalNewSPBService';

function TableSPBRequestedSparepart() {
    const [showModalSPBBaru, setShowModalSPBBaru] = useState(false);

    const openModalSPBBaru = () => setShowModalSPBBaru(true);
    const closeModalSPBBaru = () => setShowModalSPBBaru(false);

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

    const [showDetailMobile, setShowDetailMobile] = useState<boolean>()
    return (
        <main>
            {!isMobile && (
                <>
                    <div>
                        <div className='flex flex-row items-center bg-white p-2'>
                            <div className='flex w-6/12'>
                                <img

                                    src={Filter}
                                    alt=""
                                    className="mx-3 my-auto"
                                />
                            </div>
                            <div className='flex flex-row w-6/12 justify-end'>
                                <input
                                    type="search"
                                    placeholder="search"
                                    name=""
                                    id=""
                                    className="md:w-[330px] w-40 mx-3 px-3 bg-[#E9F3FF] rounded-md"
                                />
                                <button onClick={openModalSPBBaru} className='bg-green-600 rounded-md text-white text-xs font-semibold px-10'>
                                    SPB BARU
                                </button>
                                {showModalSPBBaru && (
                                    <ModalSPBService

                                        isOpen={showModalSPBBaru}
                                        onClose={closeModalSPBBaru}
                                        noSPB={'MT-0001'} tglSpb={'20 MEI 2024'} data={undefined}
                                    >
                                        <p></p>
                                    </ModalSPBService>
                                )}
                            </div>

                        </div>
                        <div className="flex bg-white mt-2 py-2 gap-2">
                            <p className="w-10 px-3 text-stone-500 text-xs font-bold ">No</p>
                            <div className="grid  grid-cols-8 w-full ">
                                <div className="flex gap-2">
                                    <p className="text-stone-500 text-xs font-bold ">Kode Tiket</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2">
                                    <p className="text-stone-500 text-xs font-bold ">Tanggal SPB</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2">
                                    <p className="text-stone-500 text-xs font-bold ">Nama Barang</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2 ">
                                    <p className="text-stone-500 text-xs font-bold ">Kode Part</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2 col-span-2">
                                    <p className="text-stone-500 text-xs font-bold ">Status</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2">
                                    <p className="text-stone-500 text-xs font-bold ">Kode Estimasi</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex gap-2 justify-end pr-8">
                                    <p className="text-stone-500 text-xs font-bold ">Action</p>
                                </div>
                            </div>
                        </div>
                        <div className=" overflow-x-auto">
                            <div className="min-w-[700px] ">
                                <div className="my-2 ">
                                    <section className="flex  bg-white  rounded-lg px-2 gap-1">
                                        <div

                                            className="text-neutral-500 text-sm font-light py-3 w-10 px-2 flex justify-start items-center"
                                        >
                                            1
                                        </div>
                                        <div className="grid  grid-cols-8 w-full ">
                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                <div className="my-auto ">
                                                    <p className="text-neutral-500 text-sm font-light">
                                                        SPB-0002
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                <div className="my-auto">
                                                    <p className="text-neutral-500 text-sm font-light">
                                                        2024/06/02
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:gap-5 gap-1 ">
                                                <div className="my-auto">
                                                    <p className="text-neutral-500 text-sm font-light line-clamp-1">
                                                        Filter Separator LB900
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col  md:gap-5 gap-1 ">
                                                <div className="my-auto ">
                                                    <p className="text-neutral-500 text-sm font-light line-clamp-1">
                                                        SPRT-0106
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex  md:gap-5 gap-1 col-span-2">
                                                <div className='my-auto'>
                                                    <p className="text-neutral-500 text-sm font-light line-clamp-1">
                                                        Menunggu Persetujuan MTC
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center md:gap-5 gap-1 ">
                                                <p className="text-neutral-500 text-sm font-light">
                                                    A-2 Hari
                                                </p>
                                            </div>
                                            <div className="flex gap-2 items-center justify-end md:mb-0 mb-2">
                                                <div>
                                                    <div>
                                                        <button

                                                            className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                        >
                                                            <img src={Burger} alt="" className="mx-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button

                                                        className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                                                    >
                                                        <img src={Arrow} alt="" className="mx-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {isMobile && (
                <>
                    <div>
                        <div className='flex flex-col gap-2  items-center bg-white p-2'>

                            <div className='flex flex-row w-full justify-end'>
                                <input
                                    type="search"
                                    placeholder="search"
                                    name=""
                                    id=""
                                    className=" mx-3 px-3 bg-[#E9F3FF] rounded-md"
                                />
                                <button onClick={openModalSPBBaru} className='bg-green-600 rounded-md text-white text-xs font-semibold px-10'>
                                    SPB BARU
                                </button>
                                {showModalSPBBaru && (
                                    <ModalSPBService

                                        isOpen={showModalSPBBaru}
                                        onClose={closeModalSPBBaru}
                                        noSPB={'MT-0001'} tglSpb={'20 MEI 2024'} data={undefined}
                                    >
                                        <p></p>
                                    </ModalSPBService>
                                )}
                            </div>
                            <div className='flex w-full'>
                                <img
                                    src={Filter}
                                    alt=""
                                    className="mx-3 my-auto"
                                />
                            </div>
                        </div>
                        <div className="flex bg-white mt-2 py-2 px-2">

                            <div className="flex gap-2 w-full">

                                <div className="flex  w-2/12 ">
                                    <p className="text-stone-500 text-xs font-bold "> Mesin</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex  w-7/12 ">
                                    <p className="text-stone-500 text-xs font-bold "> Kendala</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                                <div className="flex  w-2/12 ">
                                    <p className="text-stone-500 text-xs font-bold ">Jadwal</p>
                                    <img className="w-2" src={Polygon6} alt="" />
                                </div>
                            </div>
                        </div>
                        <div className=" overflow-x-auto">
                            <div className="">
                                <div className="my-2 ">
                                    <section className="flex flex-col bg-white  rounded-lg px-2">
                                        <div className="flex w-full py-3 gap-1">

                                            <div className="flex  w-2/12  ">
                                                <p className="text-neutral-500 text-sm font-light">
                                                    R700
                                                </p>
                                            </div>
                                            <div className="flex  w-7/12 ">

                                                <p className="text-neutral-500 text-sm font-light">
                                                    3.1.7 - Feeder Tidak Bisa On
                                                </p>

                                            </div>
                                            <div className="flex  w-3/12  ">
                                                <p className="text-neutral-500 text-sm font-light">
                                                    2 Juni 2024
                                                </p>
                                            </div>

                                        </div>
                                        <div className="flex gap-2 items-center pb-2">
                                            <div>
                                                <button

                                                    className="text-xs px-1  py-2 font-bold bg-blue-700  text-white rounded-sm"
                                                >
                                                    <img src={Burger} alt="" className="mx-1" />
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    className="text-xs  h-6 font-bold text-blue-700 bg-blue-700  border-blue-700 border rounded-sm"
                                                >
                                                    <img src={Arrow} alt="" className="mx-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </main>

    )
}

export default TableSPBRequestedSparepart