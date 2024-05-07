import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import CardDataStats from '../../components/CardDataStats'
import Production from '../../images/icon/production.svg';
import ApexCharts from 'apexcharts'
import DoughnutCart from '../../../src/components/Charts/DoughnutChart'

function Dashboard() {
    return (
        <DefaultLayout>
            <>
                <main>
                    <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Overview Dashboard</p>
                    <div className='flex gap-3'>
                        <div className='bg-white rounded-md shadow-md'>
                            <p>Work Type:</p>
                            <div>

                            </div>
                        </div>
                        <div className='bg-white rounded-md shadow-md'>
                            <p>Filter Tanggal</p>
                        </div>

                    </div>
                    <div className='flex gap-3 my-3 w-full'>
                        <div className='bg-white rounded-md shadow-md w-4/12'>
                            <div className="flex gap-3 p-3">

                                <img src={Production} alt="Logo" />

                                <p className="text-[14px] text-[#0065DE]">Production</p>
                            </div>
                            <div className='p-3 flex justify-center'>

                                <DoughnutCart />
                            </div>
                        </div>
                        <div className='bg-white rounded-md shadow-md w-8/12'>
                            <div className="flex gap-3 p-3">
                                <img src={Production} alt="Logo" />

                                <p className="text-[14px] text-[#0065DE]">Production</p>
                            </div>
                            <div className='flex flex-col w-full p-3   '>

                                <div className='grid grid-cols-5 justify-center items-center border-b-2 border-blue-700 pb-1'>
                                    <div className='flex justify-center text-sm font-bold'>
                                        <p>Kode Tiket</p>
                                    </div>
                                    <div className='flex justify-center text-sm font-bold'>
                                        <p>Work Type</p>
                                    </div>
                                    <div className='flex justify-center text-sm font-bold'>
                                        <p>Nama Mesin</p>
                                    </div>
                                    <div className='flex justify-center text-sm font-bold'>
                                        <p>Status</p>
                                    </div>
                                    <div className='flex justify-center text-sm font-bold'>
                                        <p>Jenis Kendala</p>
                                    </div>
                                </div>
                                <div className='grid grid-cols-5 justify-center items-center border-b-2 py-1 border-black '>
                                    <div className='flex justify-center text-sm'>
                                        <p>3252535</p>
                                    </div>
                                    <div className='flex justify-center text-sm'>
                                        <p>Quality</p>
                                    </div>
                                    <div className='flex justify-center text-sm'>
                                        <p>R700</p>
                                    </div>
                                    <div className='flex justify-center text-sm'>
                                        <p>OPEN</p>
                                    </div>
                                    <div className='flex justify-center text-sm'>
                                        <p>Macet</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
                            <div className="flex gap-3">
                                <img src={Production} alt="Logo" />

                                <p className="text-[14px] text-[#0065DE]">Production</p>
                            </div>
                        </CardDataStats>
                        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
                            <div className="flex gap-3">
                                <img src={Production} alt="Logo" />

                                <p className="text-[14px] text-[#0065DE]">Production</p>
                            </div>
                        </CardDataStats>
                        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
                            <div className="flex gap-3">
                                <img src={Production} alt="Logo" />

                                <p className="text-[14px] text-[#0065DE]">Production</p>
                            </div>
                        </CardDataStats>
                    </div>
                </main>
            </>
        </DefaultLayout>
    )
}

export default Dashboard