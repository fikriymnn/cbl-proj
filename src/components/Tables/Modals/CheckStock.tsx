
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';

const CheckStock = ({ no, spareName, stock }: { no: any, spareName: any, stock: any }) => {

    return (
        <div className="border-b border-stroke rounded-md  bg-white px-5 pt-2 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">

            <div className="flex flex-col">

                <div className='flex w-full'>
                    <div className="flex items-center w-1/12  justify-start">
                        <p className="hidden text-[14px] text-black dark:text-white sm:block">
                            {no}
                        </p>
                    </div>

                    <div className="flex items-center w-5/12 justify-center ">
                        <p className="text-black text-center text-[14px] dark:text-white line-clamp-1">{spareName}</p>
                    </div>
                    <div className="flex items-center justify-center w-5/12  ">
                        <p className="text-black text-center text-[14px] dark:text-white line-clamp-1">{stock}</p>
                    </div>
                    <div className='flex items-center '>
                        <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-6 py-1'>
                            USE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckStock;
