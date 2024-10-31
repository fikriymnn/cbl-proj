import { max } from 'moment';
import React, { useEffect } from 'react';

const BarChartResponMonth = ({ value }: { value: any }) => {
    const data = value;
    //const maxNumber = Math.max(...data?.map((item: any) => item.count));
    //   const redIndicator = 4;
    //   const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (
        <div className="h-50 flex w-full overflow-x-scroll max-w-screen gap-4">
            <div className="h-full w-[1.5px] bg-black"></div>
            {data?.data?.map((item: any, index: number) => {

                return (

                    <div key={index} className="flex flex-col h-full w-full ">

                        <div className="flex h-full gap-2">
                            {item?.data.map((item2: any, index: number) => {
                                const height = parseInt(item2?.jumlah_waktu_menit)
                                const maxValue = item?.data.reduce((acc: any, curr: any) => {
                                    const currValue = parseInt(curr.jumlah_waktu_menit) || 0;
                                    return acc > currValue ? acc : currValue;
                                }, 0);

                                return (
                                    <>
                                        <div className='flex flex-col-reverse'>
                                            <div className="w-full text-center text-xs font-medium text-primary">
                                                {item2?.nama_bulan}
                                            </div>

                                            <div
                                                className="flex items-center justify-center md:mx-2 mx-1 min-w-4 max-w-30"
                                                style={{
                                                    height: `${(height / maxValue) * 80}%`,
                                                    background:
                                                        item2?.nama_bulan == 'Januari' ? 'red' :
                                                            item2?.nama_bulan == 'Februari' ? 'green' :
                                                                item2?.nama_bulan == 'Maret' ? 'yellow' :
                                                                    item2?.nama_bulan == 'April' ? 'blue' :
                                                                        item2?.nama_bulan == 'Mei' ? 'Tomato' :
                                                                            item2?.nama_bulan == 'Juni' ? 'DodgerBlue' :
                                                                                item2?.nama_bulan == 'Juli' ? 'Violet' :
                                                                                    item2?.nama_bulan == 'Agustus' ? 'Aquamarine' :
                                                                                        item2?.nama_bulan == 'September' ? 'Brown' :
                                                                                            item2?.nama_bulan == 'Oktober' ? 'Chartreuse' :
                                                                                                item2?.nama_bulan == 'November' ? 'DarkBlue' :
                                                                                                    item2?.nama_bulan == 'Desember' ? 'DarkMagenta' : 'green'

                                                }}
                                            ></div>

                                            <div className="w-full text-center text-xs font-medium text-primary">
                                                {item2?.jumlah_waktu_menit}
                                            </div>

                                        </div>



                                    </>
                                )
                            }
                            )}

                        </div>
                        <div className="w-full h-[1.5px] bg-black"></div>
                        <div className="flex h-2 w-full justify-center">
                            <div className="h-full w-[1.5px] bg-black"></div>
                        </div>
                        <div className="h-[20.5px] w-[1.5px] bg-black"></div>

                        <div className="w-full text-center line-clamp-1 text-xs text-black h-5">
                            {item.mesin}
                        </div>
                    </div>
                );
            })}
        </div >
    );
};

export default BarChartResponMonth;
