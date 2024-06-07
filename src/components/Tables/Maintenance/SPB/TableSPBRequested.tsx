import React, { useState } from 'react'
import Filter from '../../../../images/icon/filter.svg';
import Burger from '../../../../images/icon/burger.svg';
import Arrow from '../../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../../images/icon/Polygon6.svg';
import ModalSPBService from '../../../Modals/ModalNewSPBService';

function TableSPBRequested() {
    const [showModalSPBBaru, setShowModalSPBBaru] = useState(false);

    const openModalSPBBaru = () => setShowModalSPBBaru(true);
    const closeModalSPBBaru = () => setShowModalSPBBaru(false);
    return (
        <main>
            <div>
                <div className='flex flex-row items-center bg-white p-2'>
                    <div className='flex w-6/12'>
                        <img

                            src={Filter}
                            alt=""
                            className="mx-3 my-auto"
                        />
                    </div>
                    <div className='flex flex-row w-6/12'>
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
                <div className="flex bg-white mt-2 py-2">
                    <p className="w-10 px-3 text-xs font-bold ">No</p>
                    <div className="grid  grid-cols-6 w-full">
                        <div className="flex gap-2">
                            <p className="text-xs font-bold ">Kode Tiket</p>
                            <img className="w-2" src={Polygon6} alt="" />
                        </div>
                        <div className="flex gap-2">
                            <p className="text-xs font-bold ">Nama Mesin</p>
                            <img className="w-2" src={Polygon6} alt="" />
                        </div>
                        <div className="flex gap-2 col-span-2">
                            <p className="text-xs font-bold ">Jenis Kendala</p>
                            <img className="w-2" src={Polygon6} alt="" />
                        </div>
                        <div className="flex gap-2">
                            <p className="text-xs font-bold ">Jadwal</p>
                            <img className="w-2" src={Polygon6} alt="" />
                        </div>
                        <div className="flex gap-2 justify-end pr-8">
                            <p className="text-xs font-bold ">Action</p>
                        </div>
                    </div>
                </div>
                <div className=" overflow-x-auto">
                    <div className="min-w-[700px] ">
                        <div className="my-2 ">
                            <section className="flex  bg-white  rounded-lg px-2">
                                <div

                                    className=" py-3 w-10 px-2 flex justify-start items-center"
                                >
                                    1
                                </div>
                                <div className="grid  grid-cols-6 w-full ">
                                    <div className="flex flex-col md:gap-5 gap-1 ">
                                        <div className="my-auto ">
                                            <p className="text-xs font-light">
                                                EXC800802
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:gap-5 gap-1 ">
                                        <div className="my-auto">
                                            <p className="text-xs font-light">
                                                R700
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col col-span-2 md:gap-5 gap-1 ">
                                        <div className="my-auto w-11/12">
                                            <p className="text-xs font-light">
                                                3.1.7 - Feeder Tidak Bisa On
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center md:gap-5 gap-1 ">
                                        <p className="text-xs font-light">
                                            2 Juni 2024
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
        </main>

    )
}

export default TableSPBRequested
