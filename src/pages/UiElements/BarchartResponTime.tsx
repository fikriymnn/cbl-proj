import React, { useEffect } from 'react';

const BarChartResponTime = ({ value }: { value: any }) => {
    const data = value;
    //const maxNumber = Math.max(...data?.map((item: any) => item.count));
    //   const redIndicator = 4;
    //   const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (
        <div className="h-50 flex w-full">
            <div className="h-full w-[1.5px] bg-black"></div>
            {data?.map((item: any, index: number) => {

                return (

                    <div key={index} className="flex flex-col h-full w-full">
                        <div className="flex w-full h-full flex-col-reverse">
                            <div
                                className="flex items-center justify-center md:mx-2 mx-1 max-w-30"
                                style={{
                                    height: `${(item.rata_rata_waktu_menit / Math.max(data[0].rata_rata_waktu_menit)) * 80}%`,
                                    background: item.rata_rata_waktu_menit >= 100 ? 'red' : 'blue',
                                }}
                            ></div>
                            <div className="w-full text-center text-xs font-medium text-primary">
                                {item.rata_rata_waktu_menit}
                            </div>
                        </div>
                        <div className="w-full h-[1.5px] bg-black"></div>
                        <div className="flex h-2 w-full justify-center">
                            <div className="h-full w-[1.5px] bg-black"></div>
                        </div>
                        <div className="w-full text-center line-clamp-1 text-xs text-black h-5">
                            {item.mesin}
                        </div>
                    </div>
                );
            })}
        </div >
    );
};

export default BarChartResponTime;
