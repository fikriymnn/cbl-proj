import { max } from 'moment';
import React, { useEffect } from 'react';

const BarChartMesinOnly = ({ value }: { value: any }) => {
    const data = value;
    //const maxNumber = Math.max(...data?.map((item: any) => item.count));
    //   const redIndicator = 4;
    //   const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (
        <div className="h-50 flex w-full overflow-x-scroll max-w-screen gap-4">
            <div className="h-full w-[1.5px] bg-black"></div>
            {data?.jenis_masalah[0]?.data?.map((item: any, index: number) => {
                const maxValue1 = Math.max(...data?.jenis_masalah[0]?.data?.map((item: { produksi: any; }) => item.produksi));

                return (

                    <div key={index} className="flex flex-col h-full w-full">
                        <div className='flex  w-full h-full'>
                            <div className="flex w-full h-full items-center flex-col-reverse">
                                <div
                                    className={`flex items-center w-full justify-center md:mx-2 mx-1 max-w-21 text-white font-semibold p-2 ${item.produksi == 0 || item.produksi == null ? 'hidden' : ''}`}
                                    style={{
                                        height: `${(item.produksi / maxValue1) * 80}%`,
                                        background: item.produksi <= 5 ? 'blue' : 'red',
                                    }}
                                ></div>
                                <div className="w-full text-center prp text-xs font-medium text-primary">
                                    {item.produksi}
                                </div>

                            </div>
                            <div className="flex w-full h-full flex-col-reverse items-center">
                                <div
                                    className={`flex items-center w-full justify-center md:mx-2 mx-1 max-w-21 text-white font-semibold p-2 ${item.quality == 0 || item.quality == null ? 'hidden' : ''}`}
                                    style={{
                                        height: `${(item.quality / maxValue1) * 80}%`,
                                        background: item.quality <= 5 ? 'blue' : 'red',
                                    }}
                                >
                                </div>

                                <div className={`w-full text-center text-xs font-medium text-primary`}>
                                    {item.quality}
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-[1.5px] bg-black"></div>
                        <div className='flex w-full gap-2'>
                            <div className={` text-xs font-semibold text-primary w-[50%] justify-center flex`}>
                                PRODUKSI
                            </div>
                            <div className={` text-xs font-semibold text-primary w-[50%] justify-center flex`}>
                                QUALITY
                            </div>
                        </div>

                        <div className="flex h-2 w-full justify-center">
                            <div className="h-full w-[1.5px] bg-black"></div>
                        </div>
                        <div className="w-full text-center line-clamp-1 text-sm text-black h-5">
                            {item.nama_bulan}
                        </div>
                    </div>
                );
            })}
        </div >
    );
};

export default BarChartMesinOnly;
