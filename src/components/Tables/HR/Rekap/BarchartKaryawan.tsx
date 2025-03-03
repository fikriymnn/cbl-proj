import React, { useEffect } from 'react';

const BarChartKaryawan = ({ value }: { value: any }) => {
    const data = value;
    //const maxNumber = Math.max(...data?.map((item: any) => item.count));
    //   const redIndicator = 4;
    //   const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (
        <div className="h-50 flex w-full">
            <div className="h-full w-[1.5px] bg-black"></div>
            <div className="flex justify-start gap-1 w-full h-full overflow-x-scroll pl-[4%]">
                {data?.map((item: any, index: number) => {
                    // Get the maximum jumlah value in the dataset
                    const maxJumlah = Math.max(...data.map((d: any) => d.jumlah));

                    return (
                        <div key={index} className="flex flex-col h-full min-w-30 max-w-30">
                            <div className="flex w-full h-full flex-col-reverse">
                                <div
                                    className="flex items-center justify-center bg-blue-500"
                                    style={{
                                        height: maxJumlah > 0 ? `${(item.jumlah / maxJumlah) * 100}%` : "0%",
                                    }}
                                ></div>
                                <div className="w-full text-center text-xs font-medium text-primary">
                                    {item.jumlah}
                                </div>
                            </div>
                            <div className="w-full h-[1.5px] bg-black"></div>
                            <div className="flex h-2 w-full justify-center">
                                <div className="h-full w-[1.5px] bg-black"></div>
                            </div>
                            <div className="w-full text-center line-clamp-1 text-xs text-black h-5">
                                {item.nama}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

export default BarChartKaryawan;
