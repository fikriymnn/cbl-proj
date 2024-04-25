
import { useEffect, useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';

const CheckStockPengganti = ({ no, spareName, spareStatus, spareStock }: { no: any, spareName: any, spareStatus: any, spareStock: any }) => {
    const [isMobile, setIsMobile] = useState(false);
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
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
    return (
        <div className=" px-2  pt-2 pb-2.5 xl:pb-1">
            {!isMobile && (
                <div className="flex flex-col">

                    <div className='flex w-full border-t border-neutral-300 px-3 pt-2'>
                        <div className="flex items-center w-1/12  justify-start">
                            <p className="hidden text-black text-sm font-light dark:text-white sm:block">
                                {no}
                            </p>
                        </div>

                        <div className="flex items-center w-3/12 justify-center ">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareName}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-center ">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareStatus}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-center ">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareStock}</p>
                        </div>
                        <div className='flex justify-end w-2/12'>
                            <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-6 py-1'>
                                PAKAI
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
            {isMobile && (
                <div className="flex flex-col">

                    <div className='flex w-full border-t border-neutral-300  pt-2'>


                        <div className="flex items-center w-4/12 justify-start ">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareName}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-start ">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareStatus}</p>
                        </div>
                        <div className="flex items-center w-3/12 justify-start pl-4">
                            <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareStock}</p>
                        </div>
                        <div className='flex justify-end w-2/12'>
                            <button className='bg-blue-700 rounded-sm text-white text-xs font-semibold px-4 py-1'>
                                PAKAI
                            </button>
                        </div>
                    </div>

                </div >
            )}
        </div >
    );
};

export default CheckStockPengganti;
