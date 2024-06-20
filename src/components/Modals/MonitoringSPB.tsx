import React from 'react'

const MonitoringSPB = ({ children, isOpen, onClose }:
    {
        children: any, isOpen: any, onClose: any,


    }) => {

    if (!isOpen) return null;


    return (

        <div className="absolute rounded-md  bg-white shadow-2xl md:w-96 w-11/12 p-2 -translate-x-2 md:-translate-y-6 -translate-y-32 border border-gray">
            <div className="flex justify-end gap-5 px-4 py-2">
                <label className=' text-center text-blue-700 text-[28px] font-semibold'>
                    MONITORING SPB
                </label>
                <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none justify-end">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="11" fill="#0065DE" />
                        <rect x="6.03955" y="4.23242" width="17" height="3" rx="1.5" transform="rotate(42.8321 6.03955 4.23242)" fill="white" />
                        <rect x="4.18213" y="16.0609" width="17" height="3" rx="1.5" transform="rotate(-45 4.18213 16.0609)" fill="white" />
                    </svg>
                </button>
            </div>
            <div className="mt-5 flex flex-col justify-center px-2">
                aaaaaaa
            </div>
        </div>

    )
}

export default MonitoringSPB
