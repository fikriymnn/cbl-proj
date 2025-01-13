import axios from 'axios';
import React, { useEffect, useState } from 'react'
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../utils/converDateToTime';
import Loading from '../../../Loading';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import TabPengajuanLangsung from '../Personnel/Absensi/TabPengajuanLangsung';
import TabOsAbsen from './TabOsAbsen';

function OsAbsensi() {

    const [isLoading, setIsLoading] = useState(false);
    const [openButton, setOpenButton] = useState(null);
    const [lkh, setLkh] = useState<any>();
    const [idInspektor, setIdInspektor] = useState<any>();
    const [namInspektor, setNamaInspektor] = useState<any>();


    useEffect(() => {
        getMe()
        getLKH()
    }, []);

    async function getMe() {
        const url = `${import.meta.env.VITE_API_LINK}/me`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setIdInspektor(res?.data.id)
            setNamaInspektor(res?.data.nama)
            console.log('getme', res.data)
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    async function getLKH() {
        const url = `${import.meta.env.VITE_API_LINK}/outstandingAbsen`;
        try {
            const res = await axios.get(url,

                {
                    params: {
                        status_tiket: 'incoming',

                        is_active: true
                    },
                    withCredentials: true,
                });

            setLkh(res.data.data);
            console.log('osAbsen', res.data.data);
        } catch (error: any) {
            console.log(error);
        }
    }

    const [showModal, setShowModal] = useState<boolean[]>([]);
    const openModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = true;

        setShowModal(onchangeVal);

    };
    const closeModalModal = (i: any) => {
        const onchangeVal: any = [...showModal];
        onchangeVal[i] = false;

        setShowModal(onchangeVal);


    };

    return (
        <>
            <div className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]'>
                {isLoading && <Loading />}
                <p className='w-20'>No</p>
                <div className='grid grid-cols-12 w-full'>

                    <div className='col-span-2'>Tanggal </div>
                    <div className='col-span-2'>Nama - NIK</div>
                    <div className='col-span-2'>Department</div>
                    <div className='col-span-3'>Deskripsi</div>

                    <div className='col-span-3 flex w-full justify-end'>Action</div>
                </div>

            </div>
            {lkh?.map(
                (data: any, i: number) => {

                    return (
                        <>
                            <div
                                key={i}
                                className=' flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center'>
                                <p className='w-20'>{i + 1}</p>
                                <div className='grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center'>


                                    <div className='col-span-2'>{convertTimeStampToDateOnly(data.createdAt)}</div>
                                    <div className='col-span-2'>{data.karyawan?.name} - {data.karyawan?.biodata_karyawan[0]?.nik}</div>
                                    <div className='col-span-2'>{data.department?.nama_department}</div>
                                    <div className='col-span-3'> {data.deskripsi}</div>

                                    <div className='col-span-3 w-full flex justify-end'>
                                        <div className="flex gap-2 items-center justify-center ">
                                            <div>
                                                <button
                                                    onClick={() => openModalModal(i)}
                                                    className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                                                >
                                                    Respon
                                                </button>
                                                {showModal[i] == true && (

                                                    <ModalKosongan
                                                        isOpen={showModal[i]}
                                                        onClose={() => closeModalModal(i)}
                                                        judul={'Lapor'}
                                                    >
                                                        <>
                                                            <TabOsAbsen data={data} />
                                                        </>
                                                    </ModalKosongan>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </>
                    );
                },
            )}

        </>

    )
}

export default OsAbsensi