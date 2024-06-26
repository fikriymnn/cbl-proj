import React, { useEffect, useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import ModalPopupBgn from '../../../components/Modals/ModalPopupBgn';
import ModalPopupReq from '../../../components/Modals/ModalDetailPopupReq';
import { Link } from 'react-router-dom';
import ModalMtcDate from '../../../components/Modals/ModalMtcDate';
const brandData = [
    {

        name: 'R700',
        date: "",
        machine: 'iCutter GT40 RTX4080 800cc pro max',
        status: "pending",
        schedule: "unscheduled",
        action: 'request mtc',
        executor: 'Saya ',
        response_time: '3 minutes',
        partOf: "printing",


    },
    {

        name: 'SM 74',
        date: "schedule requested",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule requested",
        action: 'detail',
        partOf: "printing",

    },
    {

        name: 'GTO',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule declined",
        action: 'reschedule',
        partOf: "printing"
    },
    {

        name: 'ITOH',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "scheduled",
        schedule: "10/04/24 to 12/04/24",
        action: 'begin mtc',
        partOf: "water base",

    },
    {

        name: 'POLAR',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "on progress",
        schedule: "12/04/24 to 24/04/24",
        action: 'action',
        partOf: "water base"
    },
    {

        name: 'HOCK',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending verification",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
        partOf: "finishing",
        inspector: 'Acep Wahyu',
        leader: 'cecep wahyu',
        supervisor: 'Supervisor',
        KABagMTC: 'KABagMTC',
    },
    {

        name: 'WB MANUAL',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "monitoring",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
        executor: 'Acep Kurna',
        response_time: '31 minutes',
        partOf: "water base",
        inspector: 'Acep Wahyu',
        leader: 'cecep wahyu',
        supervisor: 'Supervisor',
        KABagMTC: 'KABagMTC',
    },

];
function Pm2
    () {
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

    const [showModal2, setShowModal2] = useState(false);
    const [showModal4, setShowModal4] = useState(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);
    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);

    return (
        <DefaultLayout>
            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Inspection &gt; PM 2</p>
            {!isMobile && (
                <main className='overflow-x-scroll '>
                    <div className='min-w-[700px] w-full bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>01 April 2024</p>
                        <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            <section className='grid grid-cols-6 w-full py-4  font-semibold text-[14px]'>


                                <p className=''>Nama Mesin</p>


                                <p>Inspector</p>


                                <p>Leader</p>


                                <p>Supervisor</p>


                                <p>KA BAG MTC</p>


                                <div className='w-[125px]'>{""}</div>



                            </section>
                        </div>
                        {brandData.map((brand, key) => (
                            <>
                                <section key={key} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                    <div className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                                    </div>




                                    <div className=' w-full h-full flex flex-col justify-center relative'>

                                        <div className='ps-7 w-full grid grid-cols-6'>


                                            <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                <p className=''>{brand.name}</p>
                                            </div>

                                            <div className='flex flex-col justify-center '>

                                                <p className=''>{brand.inspector != null ? brand.inspector : "-"}</p>
                                            </div>
                                            <div className='flex flex-col justify-center'>

                                                <p className=''>{brand.leader != null ? brand.leader : '-'}</p>
                                            </div>
                                            <div className='flex flex-col justify-center'>

                                                <p className=''>{brand.supervisor != null ? brand.supervisor : '-'}</p>
                                            </div>
                                            <div className='flex flex-col justify-center'>

                                                <p className=''>{brand.KABagMTC != null ? brand.KABagMTC : '-'}</p>
                                            </div>


                                            <div>
                                                {brand.date == "" ?
                                                    <>
                                                        <button
                                                            onClick={openModal2}
                                                            className="md:w-40 w-25 text-xs font-bold bg-blue-700 py-2 text-white "
                                                        >
                                                            REQUEST DATE{' '}
                                                        </button>
                                                        {showModal2 && (
                                                            <ModalMtcDate
                                                                isOpen={showModal2}
                                                                onClose={closeModal2}
                                                                machineName={'GMC Printer 2'}
                                                            >
                                                                <p></p>
                                                            </ModalMtcDate>
                                                        )}

                                                    </> :
                                                    brand.date == 'schedule requested' ?
                                                        <div className='md:w-40 w-25'>
                                                            <div className='flex justify-center items-center w-full md:text-xs text-[10px] font-bold bg-red-200 text-red-600 md:py-2'>
                                                                <div className='flex justify-center items-center mx-auto'>

                                                                    SCHEDULE REQUESTED
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <>
                                                            <Link to='/maintenance/inspection/pm_1_form'
                                                                className={`uppercase md:w-40 w-25 p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'begin mtc' && ''
                                                                    }`} // Dynamic class assignment
                                                                onClick={openModal4}
                                                            >
                                                                INSPECT

                                                            </Link>

                                                        </>
                                                }




                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        ))}






                    </div>


                </main>
            )}
            {isMobile && (
                <main className='overflow-x-scroll '>
                    <div className='w-full  bg-white rounded-xl'>

                        <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12'>01 April 2024</p>
                        <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                            <div className='w-2 h-full '>

                            </div>
                            <section className='grid grid-cols-1 w-full py-4  font-semibold text-[14px]'>


                                <p className=''>Nama Mesin</p>





                                <div className='w-[125px]'>{""}</div>



                            </section>
                        </div>
                        {brandData.map((brand, key) => (
                            <>
                                <section key={key} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                    <div className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                                    </div>




                                    <div className=' w-full h-full flex flex-col justify-center relative'>

                                        <div className='ps-7 w-full grid grid-cols-2'>


                                            <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                                <p className=''>{brand.name}</p>
                                            </div>


                                            <div className='flex w-full justify-center'>
                                                {brand.date == "" ?
                                                    <>
                                                        <button
                                                            onClick={openModal2}
                                                            className="md:w-40 w-25 text-xs font-bold bg-blue-700 py-2 text-white "
                                                        >
                                                            REQUEST DATE{' '}
                                                        </button>
                                                        {showModal2 && (
                                                            <ModalMtcDate
                                                                isOpen={showModal2}
                                                                onClose={closeModal2}
                                                                machineName={'GMC Printer 2'}
                                                            >
                                                                <p></p>
                                                            </ModalMtcDate>
                                                        )}

                                                    </> :
                                                    brand.date == 'schedule requested' ?
                                                        <div className='md:w-40 w-25'>
                                                            <div className='flex  w-full  '>
                                                                <div className='flex w-full justify-center items-center '>
                                                                    <p className=' text-[10px] font-bold bg-red-200 text-red-600 '>
                                                                        SCHEDULE REQUESTED
                                                                    </p>

                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <>
                                                            <Link to='/maintenance/inspection/pm_1_form'
                                                                className={`uppercase md:w-40 w-25 p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'begin mtc' && ''
                                                                    }`} // Dynamic class assignment
                                                                onClick={openModal4}
                                                            >
                                                                INSPECT

                                                            </Link>

                                                        </>
                                                }




                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </>
                        ))}






                    </div>


                </main>
            )}
        </DefaultLayout>
    )
}

export default Pm2
