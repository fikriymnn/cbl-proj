
import { useEffect, useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';

const RequestList = ({ no, spareName, vendor }: { no: any, spareName: any, vendor: any }) => {
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
        <div className="border-b border-stroke rounded-md  bg-white px-5 pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            {!isMobile && (
                <div className="flex flex-col">

                    <div className='flex w-full'>
                        <div className="flex items-center w-1/12  justify-start">
                            <p className="hidden text-[14px] text-black dark:text-white sm:block">
                                {no}
                            </p>
                        </div>

                        <div className="flex items-center lg:w-4/12 w-6/12 justify-center ">
                            <p className="text-black text-center text-[14px] dark:text-white line-clamp-1">{spareName}</p>
                        </div>
                        <div className="flex items-center justify-center lg:w-5/12  w-6/12">
                            <p className="text-black text-center text-[14px] dark:text-white line-clamp-1">{vendor}</p>
                        </div>

                        <div className='flex lg:items-end pl-3 gap-1'>
                            <button className='bg-white border border-blue-700 rounded-sm text-blue-700  text-xs font-semibold px-2 py-1'>
                                DETAIL
                            </button>
                            <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-2 py-1'>
                                EDIT
                            </button>
                            <button className='bg-red-700 rounded-sm text-white  text-xs font-semibold px-2 py-1'>
                                DELETE
                            </button>
                        </div>


                    </div>
                </div>
            )}
            {isMobile && (
                <div className="flex flex-col">
                    <div className='flex w-full'>
                        <div className="flex items-start lg:w-4/12 w-8/12 justify-start ">
                            <p className="text-black text-start text-[14px] dark:text-white line-clamp-1">{spareName}</p>
                        </div>
                        <div className="flex items-start justify-start lg:w-5/12  w-8/12 pl-3">
                            <p className="text-black text-start text-[14px] dark:text-white line-clamp-1">{vendor}</p>
                        </div>
                    </div>
                    <div className='flex  gap-1 pt-2'>
                        <button className='bg-white border border-blue-700 rounded-sm text-blue-700  text-xs font-semibold px-2 py-1'>
                            DETAIL
                        </button>
                        <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-2 py-1'>
                            EDIT
                        </button>
                        <button className='bg-red-700 rounded-sm text-white  text-xs font-semibold px-2 py-1'>
                            DELETE
                        </button>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default RequestList;
