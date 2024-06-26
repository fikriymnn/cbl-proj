
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';

const Purchasing = ({ no, spareName, vendor, lastPrc }: { no: any, spareName: any, vendor: any, lastPrc: any }) => {

    return (
        <div className="border-b border-stroke rounded-md  bg-white lg:px-5 pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">

            <div className="flex flex-col">

                <div className='flex w-full'>
                    <div className="flex items-center w-1/12  justify-start">
                        <p className="hidden text-[14px] text-black dark:text-white sm:block">
                            {no}
                        </p>
                    </div>

                    <div className="flex items-center lg:w-3/12 w-5/12 lg:justify-center ">
                        <p className="text-black lg:text-center  text-[14px] dark:text-white line-clamp-1">{spareName}</p>
                    </div>
                    <div className="flex items-center lg:justify-center w-5/12 lg:w-3/12  ">
                        <p className="text-black lg:text-center text-[14px] dark:text-white line-clamp-1">{vendor}</p>
                    </div>
                    <div className="flex items-center justify-center lg:w-3/12  ">
                        <p className="hidden sm:block text-black text-center text-[14px] dark:text-white line-clamp-1">{lastPrc}</p>
                    </div>
                    <div className='flex items-end lg:pl-3 pr-1'>
                        <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-2 py-1'>
                            REQ PURCHASE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Purchasing;
