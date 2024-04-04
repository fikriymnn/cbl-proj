import React, { useState } from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import ModalPopupBgn from '../../components/Modals/ModalPopupBgn';
import ModalPopupReq from '../../components/Modals/ModalDetailPopupReq';
const brandData = [
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40 RTX4080 800cc pro max',
        status: "pending",
        schedule: "unscheduled",
        action: 'request mtc',
        executor: 'Saya ',
        response_time: '3 minutes',
        partOf: "printing",
        inspector: 'Acep Wahyu',
        leader: 'cecep wahyu',
        supervisor: 'Supervisor',
        KABagMTC: 'KABagMTC',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule requested",
        action: 'detail',
        partOf: "printing",
        supervisor: 'Supervisor',
        KABagMTC: 'KABagMTC',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending",
        schedule: "schedule declined",
        action: 'reschedule',
        partOf: "printing"
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "scheduled",
        schedule: "10/04/24 to 12/04/24",
        action: 'begin mtc',
        partOf: "water base",
        supervisor: 'Supervisor',
        KABagMTC: 'KABagMTC',
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "on progress",
        schedule: "12/04/24 to 24/04/24",
        action: 'action',
        partOf: "water base"
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "pending verification",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
        partOf: "finishing"
    },
    {

        name: 'EX000003',
        date: "12/22/24 07:00AM",
        machine: 'iCutter GT40',
        status: "monitoring",
        schedule: "12/04/24 to 24/04/24",
        action: 'detail',
        executor: 'Acep Kurna',
        response_time: '31 minutes',
        partOf: "water base"
    },

];
function Pm1() {


    const [showModal2, setShowModal2] = useState(false);
    const [showModal4, setShowModal4] = useState(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);
    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);

    return (
        <DefaultLayout>
            <main className='w-full bg-white rounded-xl'>
                <p className='text-[14px] font-semibold w-full  border-b-8 border-[#D8EAFF] py-4 px-9'>01 April 2024</p>
                <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                    <div className='w-2 h-full '>

                    </div>
                    <section className='grid grid-cols-6 w-full py-4  font-semibold text-[14px]'>


                        <p>Machine Name</p>


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
                            <div className={`w-2 h-full ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                            </div>
                            <div className=' w-full h-full flex flex-col justify-center'>
                                <div className='ps-7 w-full grid grid-cols-6'>

                                    <div className='flex flex-col justify-center font-bold'>

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
                                        {brand.action === 'begin mtc' && (
                                            <>
                                                <button
                                                    className={`uppercase w-[125px] h-[42px] inline-flex rounded-[3px] items-center text-sm  py-1   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'begin mtc' && ''
                                                        }`} // Dynamic class assignment
                                                    onClick={openModal4}
                                                >
                                                    INSPECT

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
                                                    className={`uppercase w-[125px] h-[42px] items-center inline-flex rounded-[3px] my-auto  text-sm  py-1   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'detail' && ''
                                                        }`}
                                                    onClick={openModal2}
                                                >
                                                    INSPECT
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
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                ))}

            </main>
        </DefaultLayout>
    )
}

export default Pm1