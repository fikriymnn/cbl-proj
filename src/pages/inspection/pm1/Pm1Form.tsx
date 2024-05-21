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

    const [showModalADD, setShowModalADD] = useState(false);

    const openModalADD = () => setShowModalADD(true);
    const closeModalADD = () => setShowModalADD(false);
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
                                <p className='md:text-[14px] text-[9px] font-semibold'> tanggal </p>
                                <p className='md:text-[14px] text-[9px] font-semibold'>: {pm1 != null && pm1.tgl}</p>

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
                                            <div className='flex'>

                                                <div className='p-4 flex flex-col'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Date: {pm1 != null && pm1.tgl}</p>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Result:</p>
                                                    <div className=' flex mt-3'>

                                                        <SelectGroupTwo />
                                                    </div>
                                                </div>
                                                <div className='p-4 flex flex-col '>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Upload Foto:</p>
                                                    <br />
                                                    <div className=' flex mt-3 '>


                                                        <input type="file" name="" id="" className='w-60' />
                                                    </div>
                                                </div>
                                                <div className='p-4 flex flex-col'>
                                                    <p className='md:text-[14px] text-[9px] font-semibold'>Catatan:</p>
                                                    <br />

                                                    <div className=' flex mt-3'>


                                                        <textarea name="" id="" rows={3} cols={90} className=' border-2 border-[#D9D9D9] rounded-sm resize-none p-2 w-full'></textarea>
                                                    </div>
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