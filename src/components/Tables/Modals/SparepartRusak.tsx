
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';

const CheckStockRusak = ({ no, spareName }: { no: any, spareName: any }) => {

    return (
        <div className=" px-2  pt-2 pb-2.5 xl:pb-1">

            <div className="flex flex-col">

                <div className='flex w-full border-t border-neutral-300 px-3 pt-2'>
                    <div className="flex items-center w-1/12  justify-start">
                        <p className="hidden text-black text-sm font-light dark:text-white sm:block">
                            {no}
                        </p>
                    </div>

                    <div className="flex items-center w-10/12 justify-center ">
                        <p className="text-black text-sm font-light text-center dark:text-white line-clamp-1">{spareName}</p>
                    </div>
                    <div className='flex justify-end w-2/12'>
                        <button className='bg-blue-700 rounded-sm text-white  text-xs font-semibold px-6 py-1'>
                            GANTI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckStockRusak;
