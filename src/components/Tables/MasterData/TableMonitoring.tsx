import React, { useEffect, useState } from 'react'
import ModalEditMonitoring from '../../Modals/ModalEditMonitoring';
import axios from 'axios';


function TableMonitoring() {

    const [showModalEdit, setShowModalEdit] = useState(false);
    const openModalEdit = () => setShowModalEdit(true);
    const closeModalEdit = () => setShowModalEdit(false);

    const [masterMonitoring, setmasterMonitoring] = useState<any>();
    useEffect(() => {

        getMasterMonitoring();
    }, []);

    const [isMobile, setIsMobile] = useState(false);

    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakMesin as needed
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

    async function getMasterMonitoring() {
        const url = `${import.meta.env.VITE_API_LINK}/master/waktuMonitoring`;
        try {
            const res = await axios.get(url, {
                withCredentials: true,
            });

            setmasterMonitoring(res.data);
            console.log(res.data);

        } catch (error: any) {
            console.log(error.data.msg);
        }
    }

    return (
        <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            {!isMobile && (
                <>
                    <div className='flex flex-row justify-between border-b border-stroke dark:border-strokedark w-full px-4 '>
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white">Waktu</p>
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white ">Jenis</p>
                        <p className="text-neutral-500 text-sm font-semibold text-center ">Minimal Skor</p>
                        <div className='flex justify-center w-[200px]'>
                            <p className="text-neutral-500 text-sm font-semibold text-center">Action</p>
                        </div>
                    </div>
                    <div className='flex flex-row justify-start border-b border-stroke dark:border-strokedark w-full px-4 py-2'>

                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].waktu : ''} className='border-2 border-stroke rounded-md ' />
                        </div>

                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].jenis : ''} className='border-2 border-stroke rounded-md ' />
                        </div>

                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].minimal_skor : ''} className='border-2 border-stroke rounded-md ' />
                        </div>

                        <div className='flex flex-row gap-2 w-3/12 justify-end pr-10'>
                            <button onClick={openModalEdit} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-10 py-1'>
                                EDIT
                            </button>
                            {showModalEdit && (
                                <ModalEditMonitoring
                                    children={undefined}
                                    isOpen={showModalEdit}
                                    onClose={closeModalEdit}
                                    idMonitoring={masterMonitoring[0].id}
                                    data={masterMonitoring[0]}
                                    onFinish={getMasterMonitoring} />
                            )}
                        </div>

                    </div>
                </>
            )}
            {isMobile && (
                <>
                    <div className='flex flex-row border-b gap-14 border-stroke dark:border-strokedark w-full px-4 '>
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white">Waktu</p>
                        <p className="text-neutral-500 text-sm font-semibold text-center dark:text-white ">Jenis</p>
                        <p className="text-neutral-500 text-sm font-semibold text-center ">Min Skor</p>

                    </div>
                    <div className='flex flex-row justify-start border-b border-stroke dark:border-strokedark w-full px-4 py-2 gap-2'>
                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].waktu : ''} className='border-2 border-stroke rounded-sm w-full' />
                        </div>

                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].jenis : ''} className='border-2 border-stroke rounded-sm w-full ' />
                        </div>
                        <div className='flex w-3/12'>
                            <input type='text' disabled defaultValue={masterMonitoring != null ? masterMonitoring[0].minimal_skor : ''} className='border-2 border-stroke rounded-sm w-full' />
                        </div>

                    </div>
                    <div className='px-2 py-2'>
                        <button onClick={openModalEdit} className='bg-blue-600 rounded-sm text-white text-xs font-bold px-10 py-1'>
                            EDIT
                        </button>
                        {showModalEdit && (
                            <ModalEditMonitoring
                                children={undefined}
                                isOpen={showModalEdit}
                                onClose={closeModalEdit}
                                idMonitoring={masterMonitoring[0].id}
                                data={masterMonitoring[0]}
                                onFinish={getMasterMonitoring} />
                        )}
                    </div>

                </>
            )}

        </div>
    )
}

export default TableMonitoring
