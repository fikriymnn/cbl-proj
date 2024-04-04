import { MasterMachine } from '../../../types/master';
// import BrandOne from '../../images/brand/brand-01.svg';
// import BrandTwo from '../../images/brand/brand-02.svg';
// import BrandThree from '../../images/brand/brand-03.svg';
// import BrandFour from '../../images/brand/brand-04.svg';
// import BrandFive from '../../images/brand/brand-05.svg';
import { useState } from 'react';
import Modal from '../../../components/Modals/ModalDetailPopup';
// import Gambar from '../../images/BACKGROUND.png';
import Logo from '../../images/logo/logo-cbl 1.svg';
import ModalPopupReq2 from '../../Modals/ModalPopupReq';

const brandData: MasterMachine[] = [
    {

        code: '1.1',
        name: 'R700',
        type: 'PRINTING',
        location: 'LOCATION'

    },
    {

        code: '1.2',
        name: 'SM 74',
        type: 'PRINTING',
        location: 'LOCATION'

    },
    {

        code: '1.3',
        name: 'GTO',
        type: 'PRINTING',
        location: 'LOCATION'

    },

    {

        code: '2.1',
        name: 'HOCK',
        type: 'WATER BASE',
        location: 'LOCATION'

    },
    {

        code: '3.1',
        name: 'BOADER',
        type: 'POND',
        location: 'LOCATION'

    },
    {

        code: '4.1',
        name: 'JK 1000',
        type: 'FINISHING',
        location: 'LOCATION'

    },
];
const TableMachine = () => {

    return (
        <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
            <div className='flex w-full justify-end pr-8 border-b border-stroke pb-2'>
                <button className=' bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1'>
                    ADD MACHINE
                </button>
            </div>

            <div className="flex flex-col">

                <div
                    className='flex border-b border-stroke dark:border-strokedark'


                >
                    <div className="flex w-1/12 justify-center items-center gap-4 p-2.5 ">

                        <p className="  hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                            No
                        </p>
                    </div>

                    <div className="flex items-center w-2/12 justify-center p-2.5 ">
                        <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">Machine Code</p>
                    </div>
                    <div className="flex items-center text-[14px] w-2/12 justify-center p-2.5 ">
                        <p className="text-slate-600 font-semibold text-center dark:text-white">Machine Name</p>
                    </div>

                    <div className="flex items-center text-[14px] w-2/12 justify-start  p-2.5 pl-9">
                        <p className="text-slate-600 font-semibold text-center">Machine Type</p>
                    </div>
                    <div className="flex items-center text-[14px] w-3/12 justify-start p-2.5 pl-8 ">
                        <p className="text-slate-600 font-semibold text-center">Machine Location</p>
                    </div>

                </div>
                {brandData.map((brand, key) => (
                    <div
                        className={`flex ${key === brandData.length - 1
                            ? ''
                            : 'border-b border-stroke dark:border-strokedark'
                            }`}
                        key={key}
                    >
                        <div className="flex justify-center items-center w-1/12   gap-3 p-2.5">

                            <p className="hidden text-[14px] text-black dark:text-white sm:block">
                                {key + 1}
                            </p>
                        </div>

                        <div className="flex items-center w-2/12 justify-center p-2.5 pr-9">
                            <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">{brand.code}</p>
                        </div>
                        <div className="flex items-center text-[14px] w-2/12 justify-center p-2.5 pr-9">
                            <p className="text-slate-600 font-semibold text-center dark:text-white">{brand.name}</p>
                        </div>

                        <div className="flex items-center text-[14px] w-2/12 justify-center p-2.5 pr-9">
                            <p
                                className={`text-[14px] font-semibold text-center ${brand.type === 'PRINTING'
                                    ? 'text-green-500' : brand.type === 'WATER BASE' ? 'text-yellow-500'
                                        : brand.type === 'POND' ? 'text-purple-500' : brand.type === 'FINISHING' ? 'text-red-500' : 'bg-white text-white'}`}>
                                {brand.type}
                            </p>
                        </div>
                        <div className="flex items-center text-[14px] w-2/12 justify-center p-2.5 pr-9">
                            <p className="text-slate-600 font-semibold text-center">{brand.location}</p>
                        </div>

                        <div className="flex items-center w-3/12 justify-center p-2.5 gap-2">
                            <button className='bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                EDIT
                            </button>
                            <button className='bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1'>
                                DELETE
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableMachine;
