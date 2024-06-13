// import React, { useState } from 'react';

import axios from "axios";
import ReactLoading from "react-loading";

const Loading = ({ }:
    {}) => {

    return (
        <div className="fixed z-50 inset-0 overflow-y-auto backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
            <div className="flex w-full h-screen justify-center items-center">
                <ReactLoading type={'spin'} color={'#0065DE'} height={150} width={150} />
            </div>
        </div>
    )
};

export default Loading;