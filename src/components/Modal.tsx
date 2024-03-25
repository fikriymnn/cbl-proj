import React, { useState } from 'react';

const Modal = ({ children, title, isOpen, onClose, imageUrl }: { children: any, title: any, isOpen: any, onClose: any, imageUrl: any }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-500 bg-opacity-75 p-4 md:p-8 flex justify-center items-center">  {/* Added flexbox styles */}
            <div className="w-full max-w-md bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center p-3 border-b border-gray-200">
                    <h3 className="text-xl font-medium text-gray-900">{title}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 focus:outline-none">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {imageUrl && (
                    <div className="p-3">
                        <img className="w-full rounded" src={imageUrl} alt={title} />
                    </div>
                )}
                <div className="p-3">{children}</div>
            </div>
        </div>
    );
};

export default Modal;