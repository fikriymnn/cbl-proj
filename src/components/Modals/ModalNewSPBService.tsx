// import React, { useState } from 'react';
import { useState } from "react";

const ModalSPBService = ({ children, isOpen, onClose, noSPB, tglSpb, data }:
    {
        children: any, isOpen: any, onClose: any,
        noSPB: any, tglSpb: any, data: any
    }) => {
    if (!isOpen) return null;
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
    const changeTextColor = () => {
        setIsOptionSelected(true);
    };
    const [sparepart, setSparepart] = useState<any>([

    ])
    const handleClick = () => {
        setIsHidden(false);
        setSparepart([
            ...sparepart,
            {
                kodePart: "",
                namaBarang: "",
                mesin: "",
                qty: "",
                estimasi: ""
            }
        ])

    }

    const [isHidden, setIsHidden] = useState(true);


    return (
        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-md max-h-screen overflow-y-auto">
                <div className="flex w-full items-center pt-4 ">
                    <svg
                        className='flex w-[60px] '
                        width="20"
                        height="19"
                        viewBox="0 0 20 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z" stroke="#0065DE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <label className='flex w-11/12  text-blue-700 text-sm font-bold '>Form SPB Service</label>
                    <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="11" fill="#0065DE" />
                            <rect x="6.03955" y="4.23242" width="17" height="3" rx="1.5" transform="rotate(42.8321 6.03955 4.23242)" fill="white" />
                            <rect x="4.18213" y="16.0609" width="17" height="3" rx="1.5" transform="rotate(-45 4.18213 16.0609)" fill="white" />
                        </svg>
                    </button>
                </div>

                <div className="px-4 pb-4">

                    <div className="pt-4 gap-2">
                        <label htmlFor="ticketCode" className="form-label block  text-black text-xs font-extrabold">
                            NO.SPB
                        </label>
                        <span id="ticketCode" className="text-neutral-500 text-xl font-normal ">
                            {noSPB}
                        </span>
                    </div>
                    <div className=" flex pt-2 gap-2">
                        <div>
                            <label htmlFor="preparationName" className="form-label block  text-black text-xs font-extrabold">
                                TANGGAL SPB
                            </label>
                            <span id="preparationName" className="text-neutral-500 text-xl font-normal">
                                {tglSpb}
                            </span>
                        </div>

                    </div>
                    <div className='flex pt-2 flex-col'>
                        <div className="relative z-20 bg-white dark:bg-form-input w-full ">

                            <label htmlFor="preparationName" className="form-label block  text-black text-xs font-extrabold">
                                PART LIST
                            </label>
                            {isHidden == false ? (
                                <>
                                    {sparepart.map((val: any, i: number) => {
                                        return (
                                            <>
                                                <div className="pb-2 bg-blue-100 px-4 py-1">
                                                    <div className="flex w-full flex-row">
                                                        <div className="flex w-full pl-8">
                                                            <label className=" text-black  text-xs font-bold pt-2 lg:pl-4">
                                                                KODE PART
                                                            </label>
                                                        </div>
                                                        <div className="flex w-full pl-4">
                                                            <label className=" text-black  text-xs font-bold pt-2 lg:pl-4">
                                                                NAMA BARANG
                                                            </label>
                                                        </div>
                                                        <div className="flex w-full justify-start pl-4">
                                                            <label className=" text-black  text-xs font-bold pt-2 lg:pl-4">
                                                                MESIN
                                                            </label>
                                                        </div>
                                                        <div className="flex w-full justify-center">
                                                            <label className=" text-black  text-xs font-bold pt-2 lg:pl-4">
                                                                QTY
                                                            </label>
                                                        </div>
                                                        <div className="flex w-full justify-start pr-6">
                                                            <label className=" text-black  text-xs font-bold pt-2 lg:pl-4">
                                                                KODE ESTIMASI
                                                            </label>
                                                        </div>


                                                    </div>
                                                    <div>
                                                        <div className="flex flex-row px-3 pb-2 gap-4 bg-blue-100 ">
                                                            <div className="">
                                                                <label className=" text-black text-xs font-bold">
                                                                    {i + 1}
                                                                </label>
                                                            </div>
                                                            <div className="relative z-20 bg-white dark:bg-form-input rounded-md w-[262px] h-12 shadow-sm ">
                                                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 20 20"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >

                                                                    </svg>
                                                                </span>

                                                                <select
                                                                    value={selectedOption}
                                                                    onChange={(e) => {
                                                                        setSelectedOption(e.target.value);
                                                                        changeTextColor();
                                                                    }}
                                                                    className={`rounded-md relative z-20 appearance-none w-full h-full border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                                                                        }`}
                                                                >
                                                                    <option value="" disabled className="text-gray-800 text-base font-light">
                                                                        PILIH KODE PART
                                                                    </option>
                                                                    <option value="N" className="text-gray-800 text-base font-light">
                                                                        BRG-001
                                                                    </option>
                                                                    <option value="O" className="text-gray-800 text-base font-light">
                                                                        BRG-002
                                                                    </option>
                                                                    <option value="P" className="text-gray-800 text-base font-light">
                                                                        BRG-003
                                                                    </option>
                                                                </select>

                                                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                                                    <svg
                                                                        width="24"
                                                                        height="24"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <g opacity="0.8">
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                                                fill="#637381"
                                                                            ></path>
                                                                        </g>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <div className="relative z-20 bg-white dark:bg-form-input rounded-md w-[262px] h-12 shadow-sm ">
                                                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 20 20"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >

                                                                    </svg>
                                                                </span>

                                                                <select
                                                                    value={selectedOption}
                                                                    onChange={(e) => {
                                                                        setSelectedOption(e.target.value);
                                                                        changeTextColor();
                                                                    }}
                                                                    className={`rounded-md relative z-20 appearance-none w-full h-full  border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                                                                        }`}
                                                                >
                                                                    <option value="" disabled className="text-gray-800 text-base font-light">
                                                                        PILIH NAMA BARANG
                                                                    </option>
                                                                    <option value="N" className="text-gray-800 text-base font-light">
                                                                        BARANG 1
                                                                    </option>
                                                                    <option value="O" className="text-gray-800 text-base font-light">
                                                                        BARANG 2
                                                                    </option>
                                                                    <option value="P" className="text-gray-800 text-base font-light">
                                                                        BARANG 3
                                                                    </option>
                                                                </select>

                                                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                                                    <svg
                                                                        width="24"
                                                                        height="24"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <g opacity="0.8">
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                                                fill="#637381"
                                                                            ></path>
                                                                        </g>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <input disabled name='mesin' className="hidden w-[310px] border-2 shadow-sm bg-gray-200 rounded-md border-stroke sm:block text-black  text-xs font-bold pt-2 lg:pl-4">

                                                            </input>
                                                            <input name='qty' className=" text-black p-3 w-[86px] shadow-sm rounded-md text-gray-800 text-base font-light">

                                                            </input>
                                                            <div className="relative z-20 bg-white dark:bg-form-input rounded-md w-[200px] h-12 shadow-sm ">
                                                                <span className="absolute top-1/2 left-4 z-30 -translate-y-1/2">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 20 20"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >

                                                                    </svg>
                                                                </span>

                                                                <select
                                                                    value={selectedOption}
                                                                    onChange={(e) => {
                                                                        setSelectedOption(e.target.value);
                                                                        changeTextColor();
                                                                    }}
                                                                    className={`rounded-md relative z-20 appearance-none w-full h-full border border-stroke bg-transparent py-3 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                                                                        }`}
                                                                >
                                                                    <option value="" disabled className="text-gray-800 text-base font-light">
                                                                        A - 2 HARI
                                                                    </option>
                                                                    <option value="N" className="text-gray-800 text-base font-light">
                                                                        B - 1 MINGGU
                                                                    </option>
                                                                    <option value="O" className="text-gray-800 text-base font-light">
                                                                        C - 1 BULAN
                                                                    </option>
                                                                    <option value="P" className="text-gray-800 text-base font-light">
                                                                        D - 3 BULAN
                                                                    </option>
                                                                </select>

                                                                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                                                                    <svg
                                                                        width="24"
                                                                        height="24"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <g opacity="0.8">
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                                                fill="#637381"
                                                                            ></path>
                                                                        </g>
                                                                    </svg>
                                                                </span>
                                                            </div>
                                                            <button name='estimasi' className=" text-white rounded-md px-5 text-xl bg-[#DE0000] ">
                                                                x
                                                            </button>
                                                        </div>
                                                    </div>



                                                </div >
                                            </>
                                        )
                                    })}
                                </>
                            ) : (
                                <>
                                </>
                            )}
                            <div className="flex gap-10 pt-1">
                                <button onClick={handleClick} className="lg:w-60 w-30 h-10 bg-blue-700 rounded text-center text-white text-xs font-bold">
                                    +
                                </button>
                            </div>
                        </div >
                    </div>

                    <div className='flex flex-col w-full pt-4 gap-2'>
                        <label htmlFor="preparationName" className="form-label block  text-black text-xs font-extrabold">
                            CATATAN
                        </label>
                        <textarea
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                    </div>
                    <div className="pt-4">
                        <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                            KIRIM PERMINTAAN
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
                >
                </button>
                {children}
            </div>

        </div >

    );
};

export default ModalSPBService;