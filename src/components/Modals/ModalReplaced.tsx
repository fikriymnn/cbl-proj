// import React, { useState } from 'react';

const ModalReplaced = ({ children, isOpen, onClose }:
    { children: any, isOpen: any, onClose: any }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
            <div className="max-w-md w-90 bg-white rounded-xl shadow-md">
                <div className="flex w-full items-end justify-end pt-4 px-3">

                    <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="11" fill="#0065DE" />
                            <rect x="6.03955" y="4.23242" width="17" height="3" rx="1.5" transform="rotate(42.8321 6.03955 4.23242)" fill="white" />
                            <rect x="4.18213" y="16.0609" width="17" height="3" rx="1.5" transform="rotate(-45 4.18213 16.0609)" fill="white" />
                        </svg>

                    </button>
                </div>

                <div className="flex w-full flex-wrap px-4 pb-4">
                    <div className="flex w-full  justify-center ">
                        <label className="flex w-6/12 text-center text-black text-base font-normal">
                            Has the part been previously replaced?
                        </label>

                    </div>
                    {children}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-auto right-auto bottom-3 left-auto transform translate-x-1/2 translate-y-1/2 text-gray-400 focus:outline-none"
                >
                </button>
            </div>
        </div>
    );
};

export default ModalReplaced;