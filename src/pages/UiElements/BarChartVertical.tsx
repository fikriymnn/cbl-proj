import React from 'react';

const BarChartVertical = () => {
    const data = [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Apr', value: 0 },
        { name: 'Mei', value: 10 },
        { name: 'Jun', value: 30 },
        { name: 'Jul', value: 90 },
        { name: 'Agu', value: 29 },
        { name: 'Sep', value: 27 },
        { name: 'Okt', value: 0 },
        { name: 'Nov', value: 0 },
        { name: 'Des', value: 0 },
    ];
    const maxNumber = Math.max(...data.map((item) => item.value));
    const redIndicator = 4;
    const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (

        <div className="h-50 flex w-full">
            <div className='h-full w-[1.5px] bg-black'>

            </div>
            {data.map((item, index) => (
                <div key={index} className="flex flex-col h-full w-full">

                    <div className='flex w-full h-full flex-col-reverse'>

                        <div
                            className="flex items-center justify-center md:mx-2 mx-1 max-w-30"
                            style={{
                                height: `${(item.value / maxNumber) * 80}%`,
                                background: 'blue',

                            }}
                        ></div>
                        <div className='w-full text-center text-xs font-medium text-primary'>
                            {item.value}
                        </div>
                    </div>
                    <div className='w-full h-[1.5px] bg-black'></div>
                    <div className="flex h-2 w-full justify-center">

                        <div className='h-full w-[1.5px] bg-black'></div>
                    </div>
                    <div className="w-full text-center line-clamp-1 text-xs text-black h-5">
                        {item.name}
                    </div>

                </div>
            ))}
        </div>
    );
};

export default BarChartVertical;
