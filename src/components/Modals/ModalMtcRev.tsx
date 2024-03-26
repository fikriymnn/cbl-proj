// import React, { useState } from 'react';

const ModalPopupRev = ({ children, title, isOpen, onClose, ticketCode, machineName, incDate, machineCode, mtcDate }:
    {
        children: any, title: any, isOpen: any, onClose: any,
        ticketCode: any, machineName: any, incDate: any, machineCode: any, mtcDate: any
    }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
            <div className="w-full max-w-md bg-white rounded-xl shadow-md">
                <div className="flex w-full items-center pt-4 px-3">
                    <svg
                        className='flex w-1/12'
                        width="20"
                        height="19"
                        viewBox="0 0 20 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z" stroke="#0065DE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                    <label className='flex w-10/12 text-blue-700 text-sm font-bold '>{title}</label>
                    <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="11" fill="#0065DE" />
                            <rect x="6.03955" y="4.23242" width="17" height="3" rx="1.5" transform="rotate(42.8321 6.03955 4.23242)" fill="white" />
                            <rect x="4.18213" y="16.0609" width="17" height="3" rx="1.5" transform="rotate(-45 4.18213 16.0609)" fill="white" />
                        </svg>

                    </button>
                </div>

                <div className="px-4 pb-4">

                    <div className="pt-4">
                        <label htmlFor="ticketCode" className="form-label block  text-black text-xs font-extrabold">
                            TICKET CODE
                        </label>
                        <span id="ticketCode" className="text-neutral-500 text-xl font-normal ">
                            {ticketCode}
                        </span>
                    </div>
                    <div className=" flex pt-3">
                        <div>
                            <label htmlFor="preparationName" className="form-label block  text-black text-xs font-extrabold">
                                MACHINE NAME
                            </label>
                            <span id="preparationName" className="text-neutral-500 text-xl font-normal">
                                {machineName}
                            </span>
                        </div>
                        <div className='pl-[180px]'>
                            <label htmlFor="machineCode" className="form-label block  text-black text-xs font-extrabold">
                                MACHINE CODE
                            </label>
                            <span id="machineCode" className="text-neutral-500 text-xl font-normal">
                                {machineCode}
                            </span>
                        </div>


                    </div>
                    <div className="pt-3">
                        <label htmlFor="incomingDate" className="form-label block  text-black text-xs font-extrabold">
                            INCOMING DATE
                        </label>
                        <span id="incomingDate" className="text-neutral-500 text-xl font-normal">
                            {incDate}
                        </span>
                    </div>
                    <div className="pt-3">
                        <label htmlFor="incomingDate" className="form-label block  text-black text-xs font-extrabold">
                            MAINTENANCE DATE
                        </label>
                        <span id="incomingDate" className="text-lime-600 text-xl font-normal">
                            {mtcDate}
                        </span>
                    </div>

                    <div className="pt-5">
                        <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                            APPROVE REQUEST
                        </button>
                    </div>
                    <div className="pt-2">
                        <button className="w-full h-12 text-center text-white text-xs font-bold bg-red-600 rounded-md">
                            DECLINE REQUEST
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

        </div>

    );
};

export default ModalPopupRev;