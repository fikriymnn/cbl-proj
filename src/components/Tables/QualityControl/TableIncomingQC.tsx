import { BRAND } from '../../../types/brand';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

const brandData: BRAND[] = [
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "finished",
        schedule: "unscheduled",
        action: 'review maintenance',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "on progress",
        schedule: "schedule requested",
        action: 'detail',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00UTC",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: ["schedule declined", "12/04/24 to 24/04/24"],
        action: 'review maintenance',
    },
];

const TableIncomingQC = () => {
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
        <div className="rounded-[10px] border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">


            <div className="flex flex-col">

                <div
                    className='flex border-b border-stroke dark:border-strokedark'


                >
                    <div className="flex items-center  w-1/12 gap-3 p-2.5 ">

                        <p className="hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                            No
                        </p>
                    </div>

                    <div className="flex items-center w-3/12 justify-center p-2.5 ">
                        <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Ticket Code</p>
                    </div>
                    <div className="flex items-center text-[14px] w-3/12 justify-center p-2.5 ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white">Incoming Date</p>
                    </div>

                    <div className="flex items-center text-[14px] w-3/12 justify-center p-2.5 ">
                        <p className="text-slate-600 font-semibold text-center">Machine Name</p>
                    </div>
                    <div className="flex items-center text-[14px] w-3/12 justify-center p-2.5 ">
                        <p className="text-slate-600 font-semibold text-center">Status</p>
                    </div>



                    <div className="hidden items-center justify-center w-5/12 p-2.5 sm:flex ">
                        <p className="text-slate-600 text-[14px] font-semibold text-center">Detail</p>
                    </div>
                </div>
                {brandData.map((brand, key) => (
                    <div
                        className={`flex ${key === brandData.length - 1
                            ? ''
                            : 'border-b border-stroke dark:border-strokedark'
                            }`}
                        key={key}
                    >
                        <div className="flex items-center w-1/12   gap-3 p-2.5 ">

                            <p className="hidden text-[14px] text-black dark:text-white sm:block">
                                {key + 1}
                            </p>
                        </div>

                        <div className="flex items-center w-3/12 justify-center p-2.5 ">
                            <p className="text-black text-center text-[14px] dark:text-white">{brand.name}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-center p-2.5 ">
                            <p className="text-black text-center text-[14px] dark:text-white">{brand.date}</p>
                        </div>

                        <div className="flex items-center w-3/12 justify-center p-2.5 ">
                            <p className="text-black text-center text-[14px]">{brand.machine}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-center p-2.5 ">
                            <p className={`inline-flex rounded-full uppercase bg-opacity-10  text-center px-3 text-sm font-medium ${brand.status === 'on progress'
                                ? 'bg-success text-success'
                                : brand.status === 'finished' || "finished" ? 'bg-blue-600 text-blue-600' : 'bg-white text-white'
                                }`}
                            >{brand.status}</p>
                        </div>



                        <div className="hidden items-center justify-center w-5/12 p-2.5 sm:flex">
                            <td className=" border-[#eee]   dark:border-strokedark">
                                <div className="container mx-auto flex  gap-3">


                                    <button type="button" onClick={openModal1}
                                        className={`uppercase px-2 inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action === 'detail' ? 'bg-white text-primary' : 'primary-blue text-white'} `}>
                                        {brand.action}
                                    </button>
                                    {showModal1 && (
                                        <Modal title="Incoming Maintenance Ticket"
                                            isOpen={showModal1}
                                            onClose={closeModal1}
                                            ticketCode={'CTR03591'}
                                            prepName={'GMC Ink 229'}
                                            incDate={'28 May, 2024 06:37AM'}
                                            prepCode={'3.2'} >
                                            <p></p>
                                        </Modal>
                                    )}

                                </div>

                            </td>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableIncomingQC;
