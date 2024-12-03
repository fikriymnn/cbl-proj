import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Select from 'react-select';
import Loading from '../../../../Loading';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';


function BuatSPLKeHR() {
    const [options, setOptions] = useState([]);
    const [options3, setOptions3] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState<any>();
    const [joList, setJoList] = useState<any>();
    const [idKaryawan, setIdKaryawan] = useState<any>();

    useEffect(() => {
        getMe()

        getjoReal()
    }, []);

    const [me, setMe] = useState<any>();
    const [idPengaju, setIdPengaju] = useState<any>();

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setMe(res.data);
            setIdPengaju(res.data.id_karyawan)
            getMasterUser(res?.data.karyawan.biodata_karyawan[0]?.id_department);
            console.log('getme', res.data)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function getMasterUser(id: any) {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawan`;
        try {

            const res = await axios.get(url, {
                params: {
                    id_department: id
                },
                withCredentials: true,
            });

            setUserList(res.data.data);
            console.log('user list', res.data.data)
            setOptions(
                res.data.data.map((item: any) => ({
                    value: item.id_karyawan,
                    label: item.nik + ' - ' + item.karyawan?.name,
                }))
            );


        } catch (error: any) {

            console.log(error);
        }
    }

    const [joReal, setjoReal] = useState<any>();

    async function getjoReal() {
        const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime `;
        try {
            const res = await axios.get(url, {

            });

            console.log(res.data)
            setJoList(res.data.data)
            setOptions3(
                res.data.data.map((item: any) => ({
                    value: item.e_no_jo,
                    label: item.e_no_jo
                }))
            );
        } catch (error: any) {
            console.log(error);
        }
    }

    const [sisaCuti, setSisaCuti] = useState<any>();

    const handleChangePointDepatment = (selected: any) => {
        const { value } = selected;
        const filteredData = userList.find(
            (item: any) => item.id_karyawan == value,
            // item.id.includes(parseInt(value));
        );

        console.log(filteredData?.id_karyawan);
        setSisaCuti(filteredData?.sisa_cuti);
        setIdKaryawan(filteredData?.id_karyawan)

    };
    const handleChangePointDepatmentNoJO = (selected: any) => {
        const { value } = selected;
        const filteredData = joList.find(
            (item: any) => item.e_no_jo == value,
            // item.id.includes(parseInt(value));
        );

        console.log(filteredData?.e_no_jo);
        setjoReal(filteredData?.e_no_jo)

    };


    return (

        <main className="overflow-x-scroll min-h-screen">
            {isLoading && <Loading />}
            <div className="min-w-[700px]  bg-white rounded-xl ">
                <div className='grid grid-cols-2 gap-5  border-b-8 border-[#D8EAFF] px-7 py-4 '>
                    <div className='flex flex-col gap-1'>
                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                            Nama
                        </label>
                        <Select
                            placeholder='Cari...'
                            options={options}
                            onChange={(selectedId) => {

                                handleChangePointDepatment(selectedId)
                            }}
                            className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                        >

                        </Select>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className=' text-[#6c6b6b] text-sm font-semibold'>
                            No Jo
                        </label>
                        <Select
                            placeholder='Cari...'
                            options={options3}
                            onChange={(selectedId) => {

                                handleChangePointDepatmentNoJO(selectedId)
                            }}
                            className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                        >

                        </Select>
                    </div>
                </div>
                <div className='grid grid-cols-2 gap-5 px-7 py-4'>
                    <div className='flex flex-col gap-3'>
                        <div className='grid grid-cols-2 gap-2'>
                            <div className="flex flex-col  gap-2">
                                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                    Dari
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
                                    type="datetime-local"
                                //onChange={(e) => setDateFrom4(e.target.value)}

                                ></input>

                            </div>
                            <div className="flex flex-col  gap-2">
                                <p className="text-sm text-[#6c6b6b] font-semibold md:w-3/12 w-2/12">
                                    Sampai
                                </p>
                                <input
                                    className='rounded-md bg-[#D8EAFF] px-2'
                                    type="datetime-local"

                                //onChange={(e) => setDateFrom4(e.target.value)}
                                ></input>

                            </div>
                        </div>
                        <div className='grid grid-cols-2'>
                            <div className='flex  gap-1'>
                                <label className="text-black text-sm font-bold pl-1">
                                    Dengan Istirahat?
                                </label>
                                <input

                                    type="checkbox"
                                    className=" h-6 w-6 border-2 border-stroke rounded-md"
                                />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className="text-black text-sm font-bold pl-1">
                                    Jumlah Makan
                                </label>
                                <input
                                    type="number"
                                    className=" h-6 w-full border-2 border-stroke rounded-md"
                                />
                            </div>
                        </div>
                        <div className='grid grid-cols-3'>
                            <div className='flex flex-col gap-3 px-2 py-1'>
                                <label className="text-black text-sm font-bold  h-8">
                                    Target Lembur
                                </label>
                                <label className="text-black text-sm font-bold  h-8">
                                    Tipe Lembur
                                </label>
                            </div>
                            <div className='flex flex-col gap-3 px-2 py-1 col-span-2'>
                                <input

                                    type="text"
                                    className=" h-8 w-full border-2 border-stroke rounded-md col-span-2"
                                />
                                <select
                                    className='`text-neutral-500  text-sm font-semibold relative z-20 w-full h-8  appearance-none rounded-md border-2 border-stroke  bg-transparent py-1 px-2 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input'

                                >
                                    <option value="" disabled selected className='text-neutral-500  text-sm font-semibold'>Pilih Tipe</option>
                                    <option value="libur" className='text-neutral-500  text-sm font-semibold'>Libur</option>
                                    <option value="biasa" className='text-neutral-500  text-sm font-semibold'>Biasa</option>

                                </select>
                            </div>
                        </div>

                    </div>

                    <div className="flex w-full flex-col">
                        <label className="text-[#6c6b6b] text-sm font-semibold">
                            Alasan Lembur
                        </label>
                        <div className="flex w-full h-full">
                            <textarea
                                name="alasan_cuti"



                                className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                            />
                        </div>

                    </div>

                </div>

            </div>
        </main>

    )
}

export default BuatSPLKeHR
