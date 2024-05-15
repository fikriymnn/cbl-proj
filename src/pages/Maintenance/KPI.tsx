import React from 'react'
import DefaultLayout from '../../layout/DefaultLayout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import BarChartVertical from '../UiElements/BarChartVertical'

function KPI() {
    return (

        <DefaultLayout>
            <>
                <div>
                    <div className='bg-white rounded-md shadow-md md:w-12/12 flex flex-col md:flex-row p-3 md:gap-10 gap-2'>
                        <div className='flex items-center justify-center '>

                            <p className='text-primary text-sm font-bold'>Filter Tanggal</p>
                        </div>
                        <div className='flex md:justify-center items-center gap-2'>
                            <p className='text-sm text-primary font-medium md:w-3/12 w-2/12'>Dari:</p>
                            <div className='w-44 bg-[#D8EAFF]'>

                                <LocalizationProvider dateAdapter={AdapterDayjs} >
                                    <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                </LocalizationProvider>
                            </div>
                        </div>
                        <div className='flex md:justify-center items-center gap-2'>
                            <p className='text-sm text-primary font-medium md:w-3/12 w-2/12'>Sampai:</p>
                            <div className='w-44 bg-[#D8EAFF]'>

                                <LocalizationProvider dateAdapter={AdapterDayjs} >
                                    <DatePicker slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                                </LocalizationProvider>
                            </div>
                        </div>

                    </div>
                    <div className='bg-white p-5 mt-5 w-full md:flex gap-15 rounded-[10px]'>
                        <div>
                            <h2 className='text-[14px] text-primary font-semibold'>Month Averange</h2>
                            <div className='flex'>

                                <div className='flex justify-center items-center py-3 pl-3'>

                                    <p className='text-sm text-primary'>Role:</p>
                                </div>

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
                            <div className='flex'>

                                <div className='flex justify-center items-center py-3 pl-3'>

                                    <p className='text-sm text-primary'>Name:</p>
                                </div>

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
                        </div>
                        <div className='w-full'>

                            <BarChartVertical />
                        </div>
                    </div>
                    <div className=' bg-white mt-5 p-4 rounded-[10px]'>
                        <div className='flex flex-col md:flex-row gap-3 '>

                            <div className='flex flex-col gap-3 md:w-[30%]'>
                                <div className='bg-[#D8EAFF] rounded-[4px]'>
                                    <p className='text-sm font-bold text-primary border-b-primary border-b-2 px-2 py-1'> Point Terbaik</p>
                                    <div className='grid grid-cols-4 px-2 py-1'>
                                        <div>
                                            <h5 className='text-[12px] font-semibold '>NIK</h5>
                                            <p className='text-sm font-normal'>MT100</p>
                                        </div>
                                        <div className='col-span-2'>
                                            <h5 className='text-[12px] font-semibold '>Nama</h5>
                                            <p className='text-sm font-normal'>Roberto carlos</p>
                                        </div>
                                        <div>
                                            <h5 className='text-[12px] font-semibold '>Point</h5>
                                            <p className='text-sm font-normal'>50</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-[#D8EAFF] rounded-md'>
                                    <p className='text-sm font-bold text-[#DE0000] border-b-primary border-b-2 px-2 py-1'> Point Terburuk</p>
                                    <div className='grid grid-cols-4 px-2 py-1'>
                                        <div>
                                            <h5 className='text-[12px]  font-semibold '>NIK</h5>
                                            <p className='text-sm font-normal'>MT100</p>
                                        </div>
                                        <div className='col-span-2'>
                                            <h5 className='text-[12px]  font-semibold '>Nama</h5>
                                            <p className='text-sm font-normal'>Roberto carlos</p>
                                        </div>
                                        <div>
                                            <h5 className='text-[12px]  font-semibold '>Point</h5>
                                            <p className='text-sm font-normal'>50</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className='flex flex-col gap-3 md:w-[30%]'>
                                <div className='bg-[#D8EAFF] rounded-md'>
                                    <p className='text-sm font-bold text-primary border-b-primary border-b-2 px-2 py-1'> Absensi Terbaik</p>
                                    <div className='grid grid-cols-4 px-2 py-1'>
                                        <div>
                                            <h5 className='text-[12px]  font-semibold '>NIK</h5>
                                            <p className='text-sm font-normal'>MT100</p>
                                        </div>
                                        <div className='col-span-2'>
                                            <h5 className='text-[12px]  font-semibold '>Nama</h5>
                                            <p className='text-sm font-normal'>Roberto carlos</p>
                                        </div>
                                        <div>
                                            <h5 className='text-[12px]  font-semibold '>Point</h5>
                                            <p className='text-sm font-normal'>50</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-[#D8EAFF] rounded-md'>
                                    <p className='text-sm font-bold text-[#DE0000] border-b-primary border-b-2 px-2 py-1'> Absensi Terburuk</p>
                                    <div className='grid grid-cols-4 px-2 py-1'>
                                        <div>
                                            <h5 className='text-[12px] font-semibold '>NIK</h5>
                                            <p className='text-sm font-normal'>MT100</p>
                                        </div>
                                        <div className='col-span-2'>
                                            <h5 className='text-[12px]  font-semibold '>Nama</h5>
                                            <p className='text-sm font-normal'>Roberto carlos</p>
                                        </div>
                                        <div>
                                            <h5 className='text-[12px]  font-semibold '>Point</h5>
                                            <p className='text-sm font-normal'>50</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className='bg-[#D8EAFF] rounded-md grid grid-cols-3 gap-2 p-4 md:w-[40%]'>
                                <div>
                                    <div className='flex flex-col mb-10 '>
                                        <p className='text-sm font-semibold w-20 text-[#DE6B00]'>Absensi Terendah</p>
                                        <p className='text-[28px] text-[#DE6B00]'>50</p>
                                    </div>
                                    <div className='flex flex-col '>
                                        <p className='text-sm font-semibold w-20 text-[#2EB300]'>Point Tertinggi</p>
                                        <p className='text-[28px] text-[#2EB300]'>50</p>
                                    </div>

                                </div>
                                <div>
                                    <div className='flex flex-col mb-10'>
                                        <p className='text-sm font-semibold w-20 text-[#0065DE]'> AVG Absensi</p>
                                        <p className='text-[28px] text-[#0065DE]'>50</p>
                                    </div>
                                    <div className='flex flex-col '>
                                        <p className='text-sm font-semibold w-20 text-[#DE0000]'>Point Terendah</p>
                                        <p className='text-[28px] text-[#DE0000]'>50</p>
                                    </div>

                                </div>
                                <div>
                                    <div className='flex flex-col gap-2'>
                                        <p className='text-sm font-semibold w-20 text-[#DE6B00]'>AVG Point</p>
                                        <p className='text-[28px] text-[#DE6B00]'>50</p>
                                    </div>


                                </div>
                            </div>


                        </div>
                        <div className='bg-[#D8EAFF] mt-5 overflow-x-scroll'>
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-200 text-sm font-semibold border-b border-primary">
                                        <th className="px-3  "></th>
                                        <th className="px-3  ">Tanggal Point</th>
                                        {/* <th className="px-3  ">Point</th> */}
                                        <th className="px-3  ">NIK</th>
                                        <th className="px-3  ">Nama</th>
                                        <th className="px-3  ">Role</th>
                                        <th className="px-3  ">Reporter</th>
                                        <th className="px-3  ">p1</th>
                                        <th className="px-3  ">p2</th>
                                        <th className="px-3  ">p3</th>
                                        <th className="px-3  ">Absen</th>
                                        <th className="px-3  ">Final Point</th>
                                        <th className="px-3  ">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '2345',
                                            nik: 'Fernando Alonso',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Hailee Deegan',
                                            p1: '10',
                                            p2: '10',
                                            p3: '10',

                                            absen: '100',
                                            finalPoint: '100',
                                            status: 'EXCELLENT'
                                        },
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '3464',
                                            nik: 'Marc Webber',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Danica Patrick',
                                            p1: '1',
                                            p2: '1',
                                            p3: '1',

                                            absen: '50',
                                            finalPoint: '20',
                                            status: 'BAD'
                                        },
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '3464',
                                            nik: 'Carlos Sainz',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Sophia Floersch',
                                            p1: '0',
                                            p2: '0',
                                            p3: '0',

                                            absen: '-',
                                            finalPoint: '-',
                                            status: '-'
                                        },
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '3464',
                                            nik: 'Charles Leclerc',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Doriane Pin',
                                            p1: '0',
                                            p2: '0',
                                            p3: '0',

                                            absen: '-',
                                            finalPoint: '-',
                                            status: '-'
                                        },
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '3464',
                                            nik: 'Max Verstappen',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Bianca Bustamante',
                                            p1: '0',
                                            p2: '0',
                                            p3: '0',

                                            absen: '-',
                                            finalPoint: '-',
                                            status: '-'
                                        },
                                        {
                                            tanggal: '04 Mei 2024',
                                            point: '3464',
                                            nik: 'Alexander Albon',
                                            nama: 'Pelaksana Electric',
                                            reporter: 'Abbi Pulling',
                                            p1: '0',
                                            p2: '0',
                                            p3: '0',

                                            absen: '-',
                                            finalPoint: '-',
                                            status: '-'
                                        }
                                    ].map((data, index) => (
                                        <tr key={index} className="bg-[#D8EAFF] border-b text-sm text-center">
                                            <td className="px-3  ">{index + 1}</td>
                                            <td className="px-3  ">{data.tanggal}</td>
                                            <td className="px-3  ">{data.point}</td>
                                            <td className="px-3  ">{data.nik}</td>
                                            <td className="px-3  ">{data.nama}</td>
                                            {/* <td className="px-3  ">{data.role}</td> */}
                                            <td className="px-3  ">{data.reporter}</td>
                                            <td className="px-3  ">{data.p1}</td>
                                            <td className="px-3  ">{data.p2}</td>
                                            <td className="px-3  ">{data.p3}</td>
                                            <td className="px-3  ">{data.absen}</td>
                                            <td className="px-3  ">{data.finalPoint}</td>
                                            <td className={`px-3   ${data.status === 'EXCELLENT' ? 'text-green-500' : data.status === 'BAD' ? 'text-red-500' : ''}`}>{data.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>

            </>
        </DefaultLayout>


    )
}

export default KPI