import { useEffect, useState } from 'react';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';

import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';


const MasterKategori = () => {
    const mesin = [
        {
            nama: 'R700'

        },
        {
            nama: 'SM74'
        },
        {
            nama: 'GTO'
        },
        {
            nama: 'Manual 1'
        },
        {
            nama: 'Manual 2'
        },
        {
            nama: 'Manual 3'
        },
    ];
    const [isMobile, setIsMobile] = useState(false);

    const [masterMesin, setmasterMesin] = useState<any>();

    useEffect(() => {

        getMasterMesin();
    }, []);

    async function getMasterMesin() {
        const url = `${import.meta.env.VITE_API_LINK}/master/grade`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setmasterMesin(res.data);
            console.log(res.data);
        } catch (error: any) {
            console.log(error.data.msg);
        }
    }


    const [showHistory, setShowHistory] = useState(false);
    const openModalHistory = () => setShowHistory(true);
    const closeModalHistory = () => setShowHistory(false);


    const [showDelete, setShowDelete] = useState<any>([]);
    const openDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = true;

        setShowDelete(onchangeVal);
    };
    const closeDelete = (i: any) => {
        const onchangeVal: any = [...showDelete];
        onchangeVal[i] = false;

        setShowDelete(onchangeVal);
    };

    return (
        <main className="overflow-x-scroll ' ">
            <div className="min-w-[700px]  bg-white rounded-xl flex flex-col gap-1 py-[1%]">
                <div className='flex w-full justify-between pb-2 px-[1%] border-b-8 border-[#D8EAFF]'>

                    <button
                        onClick={() => openModalHistory()}
                        className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1'>
                        TAMBAH KATEGORI
                    </button>
                    {showHistory == true && (
                        <>
                            <ModalKosonganSmall
                                isOpen={showHistory}
                                onClose={() => closeModalHistory()}
                                judul={'Tambah Grade'}
                            >
                                <>
                                    <div className="grid   gap-3 w-full px-1 py-2">

                                    </div>
                                </>
                            </ModalKosonganSmall>
                        </>
                    )
                    }
                </div>
                <div className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                    <p className='text-[#646464] text-xs font-bold col-span-2'>

                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting A
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting B
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Setting C
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas A
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas B
                    </p>
                    <p className='text-[#646464] text-xs font-bold '>
                        Kapasitas C
                    </p>
                </div>
                <div className='flex w-full flex-col bg-white'>

                    {mesin?.map((data: any, i: number) => (
                        <>
                            <div key={i} className='grid grid-cols-9  bg-white  border-b-8 border-[#D8EAFF] px-[1%] py-[1%]'>
                                <p className='text-[#646464] text-xs font-bold '>
                                    {data.nama}
                                </p>
                                <div className=' text-[#646464] text-xs font-bold col-span-8 grid grid-cols-7'>
                                    {mesin?.map((data2: any, i: number) => (
                                        <>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                {1 + i} Warna
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                180
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                120
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                90
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                180
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                120
                                            </p>
                                            <p className='text-[#646464] text-xs font-bold '>
                                                90
                                            </p>
                                        </>
                                    ))}
                                </div>

                            </div>
                        </>
                    ))}

                </div>

            </div>
        </main >
    );
};

export default MasterKategori;
