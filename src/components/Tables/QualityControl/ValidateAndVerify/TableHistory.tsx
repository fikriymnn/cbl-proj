import { BRAND } from '../../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useState } from 'react';
import Modal from '../../../Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

const brandData = [
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        date2: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "AA -  Problem setting tinta",
        percent: "0%",
        eksekutor: 'taylor swift',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        date2: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "AA -  Problem setting tinta",
        percent: "0%",
        eksekutor: 'emma watson',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        date2: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "AA -  Problem setting tinta",
        percent: "0%",
        eksekutor: 'taylor swift',
    },
];

const TableHistory = () => {
    const [showModal1, setShowModal1] = useState(false);
    const [showModal2, setShowModal2] = useState(false);

    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);

    const openModal2 = () => {
        setShowModal2(true);
        setShowModal1(false);
    };

    const closeModal2 = () => setShowModal2(false);
    return (
        <div className='flex flex-col gap-2'>


            <div className=" border border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark pb-3">


                <div className="flex flex-col">

                    <div
                        className='grid grid-cols-12 dark:border-strokedark  '
                    >
                        <div className="flex w-full justify-center col-span-2">
                            <p className="text-slate-600  text-[14px] font-semibold  dark:text-white">Kode Tiket</p>
                        </div>
                        <div className=" text-[14px] justify-center col-span-2 ">
                            <p className="text-slate-600 font-semibold  dark:text-white">Waktu Masuk</p>
                        </div>
                        <div className=" text-[14px] justify-center col-span-2 ">
                            <p className="text-slate-600 font-semibold  dark:text-white">Waktu Selesai</p>
                        </div>
                        <div className=" text-[14px] justify-center col-span-2 ">
                            <p className="text-slate-600 font-semibold ">Nama Mesin</p>
                        </div>
                        <div className=" text-[14px] justify-center ">
                            <p className="text-slate-600 font-semibold ">Kendala</p>
                        </div>


                    </div>
                </div>
            </div>
            {
                brandData.map((data, key) => (
                    <div className="rounded-xl border  border-stroke bg-white py-3 shadow-default dark:border-strokedark dark:bg-boxdark ">

                        <div
                            className='grid grid-cols-12 items-center dark:border-strokedark px-4'
                        >

                            <div className="flex w-full justify-start col-span-2 gap-14">
                                <p className="text-neutral-500 text-sm font-light  dark:text-white">{key + 1} </p>
                                <p className="text-neutral-500 text-sm font-light  dark:text-white"> {data.name}</p>
                            </div>
                            <div className="flex w-full  justify-start col-span-2">
                                <p className="text-neutral-500 text-sm font-light  dark:text-white">{data.date}</p>
                            </div>
                            <div className="flex w-full  justify-start col-span-2">
                                <p className="text-neutral-500 text-sm font-light  dark:text-white">{data.date2}</p>
                            </div>
                            <div className="flex w-full  justify-start col-span-2 ">
                                <p className="text-neutral-500 text-sm font-light ">{data.machine}</p>
                            </div>
                            <div className="flex w-full  justify-start col-span-3">
                                <p className="text-neutral-500 text-sm font-light ">{data.status}</p>
                            </div>
                            <button

                                className="text-xs font-bold bg-blue-700 py-2 px-5 text-white rounded-sm"
                            >
                                Detail
                            </button>

                        </div>
                    </div>

                ))
            }

        </div>
    );
};

export default TableHistory;
