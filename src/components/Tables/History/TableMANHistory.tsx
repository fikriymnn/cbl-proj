import { BRAND } from '../../../types/brand';
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';
import ModalMtcDate from '../../Modals/ModalMtcDate';
import ModalPopupReq from '../../Modals/ModalDetailPopupReq';
import ModalPopupBgn from '../../Modals/ModalPopupBgn';
import ModalPopupOnProg2 from '../../Modals/ModalDetailPopupOnprog2';
import ModalPopupMon from '../../Modals/ModalDetailPopupMon';

const brandData: BRAND[] = [
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40 RTX4080 800cc pro max',
        status: "pending",
        schedule: "unscheduled",
        action: 'request mtc',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule requested",
        action: 'detail',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule declined",
        action: 'reschedule',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "scheduled",
        schedule: "10/04/24 to 12/04/24",
        action: 'begin mtc',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "on progress",
        schedule: "12/04/24 to 24/04/24",
        action: 'action',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending verification",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "monitoring",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
    },

];

const TableMANHistory = () => {
    const [showModal1, setShowModal1] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [showModal3, setShowModal3] = useState(false);
    const [showModal4, setShowModal4] = useState(false);
    const [showModal5, setShowModal5] = useState(false);
    const [showModal6, setShowModal6] = useState(false);
    const [showModal7, setShowModal7] = useState(false);


    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);

    const openModal3 = () => setShowModal3(true);
    const closeModal3 = () => setShowModal3(false);

    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);

    const openModal5 = () => setShowModal5(true);
    const closeModal5 = () => setShowModal5(false);

    const openModal6 = () => setShowModal6(true);
    const closeModal6 = () => setShowModal6(false);

    const openModal7 = () => setShowModal7(true);
    const closeModal7 = () => setShowModal7(false);

    // const [status, setStatus] = useState(''); // Initial status
    // const [status2, setStatus2] = useState('');
    // const [status3, setStatus3] = useState('');
    // const [status4, setStatus4] = useState('');


    return (
        <div className="rounded-sm border border-stroke rounded-b-xl bg-white px-5 pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">


            <div className="flex flex-col">
                <div className="relative flex w-full justify-end justify-items-end border-b border-stroke dark:border-strokedark pb-2">
                    <input
                        type="text"
                        className="flex py-2 text-black text-sm font-normal bg-white h-full px-2 w-[220px] border-b border-stroke"
                        placeholder="Search"
                        id="searchInput"
                    />
                    <div className="flex items-center">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 13 13"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.7593 10.9907L9.74977 8.99734C10.5298 8.02473 10.9076 6.79021 10.8054 5.54762C10.7032 4.30504 10.1288 3.14884 9.20026 2.31677C8.27176 1.48469 7.05974 1.03999 5.81343 1.07409C4.56712 1.1082 3.38124 1.61852 2.49963 2.50012C1.61803 3.38173 1.10771 4.56761 1.0736 5.81392C1.0395 7.06023 1.48421 8.27225 2.31628 9.20074C3.14836 10.1292 4.30455 10.7037 5.54714 10.8059C6.78972 10.9081 8.02424 10.5303 8.99685 9.75025L10.9902 11.7436C11.0405 11.7944 11.1004 11.8347 11.1665 11.8622C11.2325 11.8897 11.3033 11.9038 11.3748 11.9038C11.4463 11.9038 11.5171 11.8897 11.5831 11.8622C11.6491 11.8347 11.709 11.7944 11.7593 11.7436C11.857 11.6426 11.9116 11.5076 11.9116 11.3671C11.9116 11.2267 11.857 11.0917 11.7593 10.9907ZM5.9581 9.75025C5.20818 9.75025 4.4751 9.52788 3.85156 9.11124C3.22802 8.69461 2.74204 8.10243 2.45506 7.4096C2.16807 6.71676 2.09299 5.95438 2.23929 5.21887C2.38559 4.48336 2.74671 3.80775 3.27699 3.27747C3.80726 2.7472 4.48287 2.38608 5.21838 2.23978C5.95389 2.09347 6.71627 2.16856 7.40911 2.45554C8.10194 2.74253 8.69412 3.22851 9.11075 3.85205C9.52739 4.47559 9.74977 5.20867 9.74977 5.95859C9.74977 6.9642 9.35029 7.92862 8.63921 8.6397C7.92814 9.35078 6.96371 9.75025 5.9581 9.75025Z"
                                fill="#717171"
                            />
                        </svg>
                    </div>
                </div>
                <div
                    className='flex border-b border-stroke dark:border-strokedark'


                >
                    <div className="flex items-center w-[3%] gap-3 p-1 ">

                        <p className="hidden  text-slate-600 font-semibold dark:text-white text-[14px] sm:block">
                            No
                        </p>
                    </div>

                    <div className="flex items-center w-[250px] justify-center p-1 ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Ticket Code</p>
                    </div>
                    <div className="flex items-center w-[250px] justify-center p-1 ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Incoming Date</p>
                    </div>

                    <div className="flex items-center w-[250px] justify-center p-1 ">
                        <p className="text-slate-600 font-semibold text-center">Machine Name</p>
                    </div>

                    <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Status</p>
                    </div>
                    <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white text-[14px]">Schedule</p>
                    </div>

                    <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
                        <p className="text-slate-600 font-semibold text-center">Detail</p>
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
                        <div className="flex items-center w-[3%]   gap-3 p-1 ">

                            <p className="hidden text-black dark:text-white text-[14px] sm:block">
                                {key + 1}
                            </p>
                        </div>

                        <div className="flex items-center w-[250px]  justify-center p-1 ">
                            <p className="text-black text-center dark:text-white text-[14px]">{brand.name}</p>
                        </div>
                        <div className="flex items-center w-[250px] justify-center p-1 ">
                            <p className="text-black text-center dark:text-white text-[14px]">{brand.date}</p>
                        </div>

                        <div className="flex items-center w-[250px] justify-center p-1 text-[14px]">
                            <p className="text-black text-center line-clamp-2">{brand.machine}</p>
                        </div>

                        <div className="hidden items-center justify-center w-[250px] p-1 sm:flex text-[14px] ">
                            <td className=" border-[#eee]  px-4 dark:border-strokedark">
                                <p
                                    className={`inline-flex rounded-full uppercase bg-opacity-10  text-center px-3 text-sm font-medium ${brand.status === 'monitoring'
                                        ? 'bg-blue-600 text-blue-600'
                                        : brand.status === 'on progress'
                                            ? 'bg-success text-success'
                                            : brand.status === 'pending' || "pending verification" ? 'bg-orange-400 text-orange-400' : 'bg-white'
                                        }`}
                                >
                                    {brand.status}
                                </p>
                            </td>
                        </div>
                        <div className="hidden items-center justify-center w-[250px] p-1 sm:flex ">
                            <td className=" border-[#eee]  px-4 dark:border-strokedark">
                                <p
                                    className={`inline-flex rounded-full uppercase bg-opacity-10 text-[14px] text-center px-3 text-sm font-medium ${brand.schedule === 'unscheduled'
                                        ? 'bg-warning text-warning'
                                        : brand.schedule === "schedule requested" ? 'bg-orange-400 text-orange-400' : brand.schedule === 'schedule declined' ? 'bg-danger text-danger' : 'bg-white'
                                        }`}
                                >
                                    {brand.schedule}
                                </p>
                            </td>
                        </div>

                        <div className="hidden items-center justify-center w-[250px] p-1 sm:flex">
                            <td className=" border-[#eee] text-[14px]  dark:border-strokedark">
                                <div className="container mx-auto ">
                                </div>

                            </td>
                            <div>
                                {/* Conditionally render buttons based on status */}
                                {brand.action === 'begin mtc' && (
                                    <>
                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'begin mtc' && 'hidden'
                                                }`} // Dynamic class assignment
                                            onClick={openModal4}
                                        >
                                            {brand.action}

                                        </button>
                                        <ModalPopupBgn
                                            title="Maintenance"
                                            isOpen={showModal4}
                                            onClose={closeModal4}
                                            ticketCode={'CTR03591'}
                                            machineName={'GMC Printer 2'}
                                            incDate={'05 May, 2024 06:37AM'}
                                            machineCode={'3.2'} children={''}
                                            mtcSchedule={'12 April, 2024 to 24 April, 2024'}

                                        >
                                        </ModalPopupBgn>
                                    </>
                                )
                                }
                                {brand.action === 'detail' && brand.status === 'pending' && (
                                    <>

                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-blue-600 text-sm  py-1   hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action !== 'detail' && 'hidden'
                                                }`}
                                            onClick={openModal2}
                                        >
                                            {brand.action}
                                        </button>
                                        {showModal2 && (
                                            <ModalPopupReq
                                                title="Maintenance"
                                                isOpen={showModal2}
                                                onClose={closeModal2}
                                                ticketCode={'CTR03591'}
                                                machineName={'GMC Printer 2'}
                                                incDate={'05 May, 2024 06:37AM'}
                                                machineCode={'3.2'} children={''}
                                                mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                                                status={"Maintenance Schedule Requested "}>

                                            </ModalPopupReq>

                                        )}
                                    </>
                                )}
                                {brand.action === 'reschedule' && (
                                    <>
                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'reschedule' && 'hidden'
                                                }`}
                                            onClick={openModal3}
                                        >
                                            {brand.action}
                                        </button>
                                        <ModalMtcDate title="Request Maintenance Schedule"
                                            isOpen={showModal3}
                                            onClose={closeModal3}
                                            machineName={'GMC Printer 2'}>
                                            <p></p>
                                        </ModalMtcDate>
                                    </>
                                )}
                                {brand.action === 'action' && (
                                    <>

                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1  text-blue-600 hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action !== 'action' && 'hidden'
                                                }`}
                                            onClick={openModal5}
                                        >
                                            {brand.action}
                                        </button>
                                        <ModalPopupOnProg2
                                            title="Maintenance"
                                            isOpen={showModal5}
                                            onClose={closeModal5}
                                            ticketCode={'CTR03591'}
                                            machineName={'GMC Printer 2'}
                                            incDate={'05 May, 2024 06:37AM'}
                                            machineCode={'3.2'} children={''}
                                            mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                                            status={"Maintenance On Progress"}>

                                        </ModalPopupOnProg2>
                                    </>
                                )}
                                {brand.action === 'request mtc' && (
                                    <>

                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1  text-white bg-blue-600 hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action !== 'request mtc' && 'hidden'
                                                }`}


                                            onClick={openModal3} >
                                            {brand.action}
                                        </button>
                                        <ModalMtcDate title="Request Maintenance Schedule"
                                            isOpen={showModal3}
                                            onClose={closeModal3}
                                            machineName={'GMC Printer 2'}>
                                            <p></p>
                                        </ModalMtcDate>
                                    </>
                                )}
                                {brand.action === 'detail' && brand.status === 'pending verification' && (
                                    <>

                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1  text-blue-600  hover:bg-blue-400 border border-blue-600 font-bold text-[12px] justify-center ${brand.action !== 'detail' && 'hidden'
                                                }`}
                                            onClick={openModal6}
                                        >
                                            {brand.action}
                                        </button>
                                        {showModal6 && (
                                            <ModalPopupReq
                                                title="Maintenance"
                                                isOpen={showModal6}
                                                onClose={closeModal6}
                                                ticketCode={'CTR03591'}
                                                machineName={'GMC Printer 2'}
                                                incDate={'05 May, 2024 06:37AM'}
                                                machineCode={'3.2'} children={''}
                                                mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                                                status={"Waiting to be verified by QC "}>

                                            </ModalPopupReq>

                                        )}
                                    </>
                                )}
                                {brand.action === 'detail' && brand.status === 'monitoring' && (
                                    <>

                                        <button
                                            className={`uppercase w-[125px] inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border border-blue-600 font-bold text-[12px] text-blue-600 justify-center ${brand.action !== 'detail' && 'hidden'
                                                }`}
                                            onClick={openModal7}
                                        >
                                            {brand.action}
                                        </button>
                                        {showModal7 && (


                                            <ModalPopupMon
                                                title="Maintenance"
                                                isOpen={showModal7}
                                                onClose={closeModal7}
                                                ticketCode={'CTR03591'}
                                                machineName={'GMC Printer 2'}
                                                incDate={'05 May, 2024 06:37AM'}
                                                machineCode={'3.2'} children={''}
                                                mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                                                status={"Maintenance verified, Monitoring after maintenance for 3 months."}>

                                            </ModalPopupMon>
                                        )}


                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableMANHistory;