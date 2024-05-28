import React, { useEffect, useState } from 'react'
import DefaultLayout from '../../../layout/DefaultLayout'
import Ceklis from '../../../images/icon/ceklis.svg'
import Polygon from '../../../images/icon/Polygon.svg'
import X from '../../../images/icon/x.svg'
import Strip from '../../../images/icon/strip.svg'
import SelectGroupTwo from '../../../components/Forms/SelectGroup/SelectGroupTwo'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import ModalPM1TambahInspection from '../../../components/Modals/ModalPMTambahInspection'
import Logo from '../../../images/icon/ceklis.svg'
import None from '../../../images/icon/none.svg'
import moment from 'moment';


function Pm1Form() {
    const { id } = useParams();

    const [pm1, setPm1] = useState<any>();
    useEffect(() => {
        getPM1();
    }, []);
    async function getPM1() {
        const url = `${import.meta.env.VITE_API_LINK}/pm1/${id}`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setPm1(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }
    const [start, setStart] = useState<any>();

    async function startTask(id: any) {
        const url = `${import.meta.env.VITE_API_LINK}/pm1/taskStart/${id}`;
        try {
            const res = await axios.put(url, {

                withCredentials: true,
            });
            setStart(new Date());
            console.log('succes')
        } catch (error: any) {
            console.log(error);
        }
    }

    const [hasil, setHasil] = useState<any>('');
    const [catatan, setCatatan] = useState<any>();
    const [file, setfile] = useState<any>();



    const [elapsedTimeText, setElapsedTimeText] = useState<any>();

    async function stopTask(id: any) {
        if (!start) { // Check if start time is available
            console.error('Task tidak bisa diberhentikan: Belum Start.');
            return; // Exit function if no start time
        }

        const stopTime = new Date();
        const timestamp = convertDatetimeToDate(new Date());
        const url = `${import.meta.env.VITE_API_LINK}/pm1/taskStop/${id}`;
        try {
            const elapsedTime = await calculateElapsedTime(start, stopTime);
            const formattedTime = formatElapsedTime(elapsedTime);
            const res = await axios.put(url,
                {
                    hasil: hasil,
                    lama_pengerjaan: formatElapsedTime(elapsedTime),
                    waktu_selesai: timestamp,
                    catatan: catatan,
                    file: 'ada',
                },
                {
                    withCredentials: true,
                });

            setElapsedTimeText(formattedTime);
            console.log('Task stopped successfully:', elapsedTime);
            console.log('Succes', timestamp)
        } catch (error: any) {
            console.log(error);
        }
    }
    function updateElapsedTimeText(formattedTime: string) {
        setElapsedTimeText(formattedTime);
    }
    function calculateElapsedTime(startTime: Date, stopTime: Date) {
        const diffInMs = stopTime.getTime() - startTime.getTime();
        // Convert milliseconds to your desired unit (minutes, hours)
        const elapsedTime = Math.round(diffInMs / (1000 * 60)); // Example: minutes
        return elapsedTime;
    }

    // Helper function to format elapsed time for 'menit' (replace with your format)
    function formatElapsedTime(minutes: number, seconds: number = 0) {
        const formattedMinutes = minutes.toString().padStart(2, '0'); // Pad minutes with leading 0
        // Customize the format as needed
        return `${formattedMinutes} menit`; // Example: 00:30 menit
    }


    // const start1 = moment(start)
    // const stop = moment(selesai)
    // const diffMilidetik = stop.diff(start1);
    // const menit = diffMilidetik / (1000 * 60);


    const [showModalADD, setShowModalADD] = useState(false);

    const openModalADD = () => setShowModalADD(true);
    const closeModalADD = () => setShowModalADD(false);

    function convertDatetimeToDate(datetime: any) {
        const dateObject = new Date(datetime);
        const day = dateObject
            .getDate()
            .toString()
            .padStart(2, '0'); // Ensure two-digit day
        const month = (dateObject.getMonth() + 1)
            .toString()
            .padStart(2, '0'); // Adjust for zero-based month
        const year = dateObject.getFullYear();
        const hours = dateObject
            .getHours()
            .toString()
            .padStart(2, '0');
        const minutes = dateObject
            .getMinutes()
            .toString()
            .padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
    }

    const tiketMasuk = convertDatetimeToDate(pm1 != null && pm1.createdAt);



    const [selectedOption, setSelectedOption] = useState<string>('');
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

    const changeTextColor = () => {
        setIsOptionSelected(true);
    };
    return (
        <DefaultLayout>
            <div className='w-full bg-white'>
                <section className='flex justify-between p-4'>

                    <div>
                        <p className='md:text-[14px] text-[9px] font-semibold'>Machine Details</p>
                        <div className='flex flex-col md:w-52 w-35'>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1 '>
                                <p className='md:text-[14px] text-[9px] font-semibold '> Nama Mesin </p>
                                <p className='md:text-[14px] text-[9px] font-semibold '>: {pm1 != null && pm1.nama_mesin}</p>

                            </div>
                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> Nomor Mesin </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: {pm1 != null && pm1.mesin.kode_mesin}</p>

                            </div>

                            <div className='grid grid-cols-2 justify-between md:gap-3 gap-1'>
                                <p className='md:text-[14px] text-[9px] font-semibold'> tanggal</p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: {pm1 != null && tiketMasuk}</p>

                            </div>


                        </div>
                    </div>
                    <div>
                        <p className='md:text-[14px] text-[9px] font-semibold'>
                            Form filling Guide
                        </p>
                        <div>
                            <div className='flex justify-start md:gap-3 gap-1'>

                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Ceklis} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Kondisi Baik</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Polygon} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Dapat Digunakan Dengan Catatan</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={X} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Jelek / Rusak</p>
                            </div>
                            <div className='flex justify-start md:gap-3 gap-1'>
                                <div className='md:w-5 w-4 flex justify-center items-center'>

                                    <img className='' src={Strip} alt="" />
                                </div>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: Tidak Ada / Tidak Terpasang</p>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='overflow-x-scroll '>
                    <div className='min-w-[700px]'>

                        <section className='flex p-4 border-y-8 border-[#D8EAFF]'>
                            <div className='w-1/12'>
                                <p className='md:text-[14px] text-[9px] font-semibold'>No</p>
                            </div>
                            <div className='w-11/12 grid grid-cols-5 gap-10'>

                                <p className='md:text-[14px] text-[9px] font-semibold'>Inspect Point </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Task List </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Acceptance Criteria </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Inspection Method</p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>Tools</p>
                            </div>
                        </section>
                        {pm1 != null &&
                            pm1.inspection_point_pm1s.map((data: any, i: any) => {
                                function convertDatetimeToDate(datetime: any) {
                                    const dateObject = new Date(datetime);
                                    const day = dateObject
                                        .getDate()
                                        .toString()
                                        .padStart(2, '0'); // Ensure two-digit day
                                    const month = (dateObject.getMonth() + 1)
                                        .toString()
                                        .padStart(2, '0'); // Adjust for zero-based month
                                    const year = dateObject.getFullYear();
                                    const hours = dateObject
                                        .getHours()
                                        .toString()
                                        .padStart(2, '0');
                                    const minutes = dateObject
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, '0');

                                    return `${year}/${month}/${day}  ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
                                }

                                const tiketMasuk = convertDatetimeToDate(data.tgl);


                                return (

                                    <>
                                        <section className=' border-b-8 border-[#D8EAFF]'>
                                            <div className='flex p-4 border-b-2 border-[#6D6C6C] '>

                                                <div className='w-1/12'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>{i + 1}</p>
                                                </div>

                                                <div className='flex w-full gap-10'>

                                                    <div className='flex w-2/12'>
                                                        <p className='md:text-[14px] text-[9px] font-semibold'>{data.inspection_point} </p>
                                                    </div>
                                                    <div className='grid grid-cols-4 w-10/12 gap-3 pl-3'>
                                                        {data.inspection_task_pm1s.map((task: any, ii: any) => {
                                                            return (
                                                                <>
                                                                    <div className='flex flex-col gap-y-10'>
                                                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>{task.task}</p>

                                                                    </div>
                                                                    <div className='flex flex-col gap-y-10 pl-2'>
                                                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>{task.acceptance_criteria}</p>

                                                                    </div>
                                                                    <div className='flex flex-col gap-y-10 pl-4'>
                                                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>{task.method}</p>

                                                                    </div>
                                                                    <div className='flex flex-col gap-y-10 pl-5'>
                                                                        <p className='md:text-[14px] text-[9px] font-semibold h-10'>{task.tools}</p>
                                                                    </div>
                                                                </>
                                                            )
                                                        }

                                                        )}
                                                    </div>


                                                </div>
                                            </div>
                                            <div className='flex w-full'>

                                                <div className='p-4 flex flex-col '>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Date: {pm1 != null && tiketMasuk}</p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Result:</p>
                                                    <div className=' flex mt-3'>
                                                        <div className="relative z-20   md:w-[200px] w-[150px] dark:bg-form-input">

                                                            <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                                                {/* <div className='md:w-6 w-4'>
                                                                    {hasil == 'Baik' ? <img src={Logo} alt="" /> : hasil == 'Catatan' ? <img src={Polygon} alt="" /> : hasil == 'Jelek' ? <img src={X} alt="" /> : hasil == 'Tidak terpasang' ? <img src={Strip} alt="" /> : ""}
                                                                </div> */}

                                                            </span>

                                                            <select

                                                                value={hasil}
                                                                onChange={(e) => {
                                                                    setHasil(e.target.value);
                                                                    changeTextColor();
                                                                }}
                                                                className={`relative z-20 w-full appearance-none rounded-[10px]  border-2 border-[#D9D9D9] bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input md:text-base text-sm ${isOptionSelected ? 'text-black dark:text-white' : ''
                                                                    }`}
                                                            >
                                                                <option value="" disabled className="text-body dark:text-bodydark ">
                                                                    Select Result
                                                                </option>
                                                                <option value="Baik" className="text-body dark:text-bodydark">
                                                                    Good
                                                                </option>
                                                                <option value="Catatan" className="text-body dark:text-bodydark">

                                                                    Warning
                                                                </option>
                                                                <option value="Jelek" className="text-body dark:text-bodydark">
                                                                    Bad
                                                                </option>
                                                                <option value="Tidak terpasang" className="text-body dark:text-bodydark">
                                                                    Not Installed
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
                                                <div className='p-4 flex flex-col '>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Upload Foto:</p>
                                                    <br />
                                                    <div className=' flex mt-3 '>

                                                        <input type="file"
                                                            value={file}
                                                            onChange={(e) => setfile(e.target.value)}
                                                            name="" id="" className='w-60' />
                                                    </div>
                                                </div>
                                                <div className='p-4 flex flex-col w-5/12'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Catatan:</p>


                                                    <div className=' flex mt-3'>


                                                        <textarea
                                                            value={catatan}
                                                            onChange={(e) => setCatatan(e.target.value)}
                                                            name="" id="" rows={3} cols={90} className=' border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full'></textarea>
                                                    </div>
                                                </div>
                                                <div className='p-4 flex flex-col justify-start items-start w-2/12 gap-3'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Time :{elapsedTimeText} </p>


                                                    <button onClick={() => startTask(data.id)} className='flex w-full rounded-md bg-[#00B81D] justify-center items-center px-2 py-3 hover:cursor-pointer'>
                                                        <svg width="14"

                                                            height="14"
                                                            viewBox="0 0 14 14"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z" fill="white" />
                                                        </svg>
                                                    </button>

                                                    <button onClick={() => stopTask(data.id)} className='flex w-full rounded-md bg-[#DE0000] justify-center items-center px-2 py-3 hover:cursor-pointer'>
                                                        <svg
                                                            width="14"
                                                            height="12"
                                                            viewBox="0 0 14 12"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <rect width="14" height="12" rx="3" fill="white" />
                                                        </svg>

                                                    </button>
                                                </div>


                                            </div>
                                        </section>

                                    </>
                                )
                            })}

                        <section className=' border-b-8 border-[#D8EAFF] flex flex-col'>
                            <div>
                                <button onClick={openModalADD} className='py-2 px-20 mx-5 mt-5 bg-primary text-white rounded-md'>+</button>
                            </div>
                            {showModalADD && (
                                <ModalPM1TambahInspection
                                    children={undefined}
                                    onFinish={() => getPM1()}
                                    isOpen={showModalADD}
                                    onClose={closeModalADD}
                                    idTicket={pm1.id}
                                />
                            )}

                            <p className='text-sm font-semibold p-5'>Catatan Keseluruhan:</p>
                            <textarea


                                className="peer h-full min-h-[100px] w-[96%] mx-5 mb-5 resize-none rounded-[7px] border-2 border-stroke bg-transparent px-3 py-2.5  font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                            ></textarea>
                            <div className='flex w-full md:justify-end justify-start'>
                                <button className='py-2 px-10 mx-5 mt-5 bg-primary text-white rounded-md mb-5'>SUBMIT INSPECTION</button>
                            </div>

                        </section>
                    </div>
                </div>

            </div >
        </DefaultLayout >
    )
}

export default Pm1Form