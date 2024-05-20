import React, { useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import ModalPopupBgn from '../../../components/Modals/ModalPopupBgn';
import ModalPopupReq from '../../../components/Modals/ModalDetailPopupReq';
import { Link } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
const brandData = [
    {

        name: 'R700',
        date: "12/22/24 07:00AM",
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
        date: "12/22/24 07:00AM",
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
function Histori() {


    const [showModal2, setShowModal2] = useState(false);
    const [showModal4, setShowModal4] = useState(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);
    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);

    return (
        <>



            <main className='overflow-x-scroll'>
                <div className='lg:min-w-[700px] bg-white rounded-xl'>
                    <div className='md:flex gap-4 border-b-8 border-[#D8EAFF]'>
                        <div className='flex'>
                            <p className='text-primary text-sm font-semibold my-auto pl-5 '>Pilih mesin</p>
                            <div className='flex justify-center items-center'>
                                <div className="relative z-20 bg-[#D8EAFF] rounded-md dark:bg-form-input  w-40 m-3">
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
                                        className={`relative text-primary font-medium z-20 w-full appearance-none rounded border border-stroke bg-transparent py-1   px-1 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-inputtext-black dark:text-white' 
                                            }`}
                                    >
                                        <option value="d" className="text-body dark:text-bodydark">
                                            All
                                        </option>
                                        <option value="N" className="text-body dark:text-bodydark">
                                            Production
                                        </option>
                                        <option value="O" className="text-body dark:text-bodydark">
                                            Quality
                                        </option>

                                    </select>

                                    <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                        <div className='flex md:gap-4 gap-1 md:flex-row flex-col md:px-0 px-5'>

                            <p className='my-auto text-sm text-primary font-semibold'>Pilih Tanggal</p>
                            <div className='flex md:justify-center items-center gap-2'>
                                <p className='text-sm text-primary font-semibold md:w-3/12 w-2/12'>Dari:</p>
                                <div className='w-44 bg-[#D8EAFF] rounded-xl '>

                                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                                        <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className='flex md:justify-center items-center gap-2'>
                                <p className=' my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12'>Sampai:</p>
                                <div className='w-44 bg-[#D8EAFF] rounded-xl '>

                                    <LocalizationProvider dateAdapter={AdapterDayjs} >
                                        <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                    </LocalizationProvider>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-center my-5'>

                            <div className='bg-primary text-white px-5 py-2 rounded-md my-auto '>
                                Tampilkan
                            </div>
                        </div>
                    </div>
                    <div className=' ps-7 w-full h-full flex border-b-8 border-[#D8EAFF]'>

                        <div className='w-2 h-full '>

                        </div>
                        <section className='grid grid-cols-4 w-full py-4  font-semibold text-[14px]'>


                            <p className=''>Machine Name</p>





                            <p className='sm:block hidden'>Tanggal</p>


                            <p className='sm:block hidden'>Inspektor</p>


                            <div className='w-[125px]'>{""}</div>



                        </section>
                    </div>
                    {brandData.map((brand, key) => (
                        <>
                            <section key={key} className=' flex  justify-center  w-full h-[59px]  border-b-8 border-[#D8EAFF] text-[14px]  text-black'>
                                <div className={`w-2 h-full sticky left-0 z-20 ${brand.partOf == 'printing' ? 'bg-green-600' : brand.partOf == 'water base' ? 'bg-yellow-600' : brand.partOf == 'pond' ? 'bg-violet-900' : brand.partOf == 'finishing' ? 'bg-red-900' : ''}`}>

                                </div>




                                <div className=' w-full h-full flex flex-col justify-center relative'>

                                    <div className='ps-7 w-full grid md:grid-cols-4 grid-cols-2'
                                    >


                                        <div className='flex flex-col justify-center font-bold sticky left-2 ps-3 md:ps-0 bg-white'>
                                            <p className=''>{brand.name}</p>
                                        </div>

                                        <div className='sm:block flex-col justify-center hidden'>

                                            <p className=''>{brand.inspector != null ? brand.inspector : "-"}</p>
                                        </div>
                                        <div className='sm:block flex-col justify-center hidden'>

                                            <p className=''>{brand.leader != null ? brand.leader : '-'}</p>
                                        </div>



                                        <div className='flex justify-center'>

                                            <>
                                                <Link to='/maintenance/inspection/pm_1_form'
                                                    className={`uppercase p-5 inline-flex rounded-[3px] items-center text-sm  py-1 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600 text-white font-bold text-[12px] justify-center ${brand.action !== 'begin mtc' && ''
                                                        }`} // Dynamic class assignment
                                                    onClick={openModal4}
                                                >
                                                    INSPECT

                                                </Link>

                                            </>



                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    ))}






                </div>


            </main>
        </>

    )
}

export default Histori