import React from 'react';

const BarChartVertical = () => {
    const data = [
        { name: 'Jan', value: 100.5 },
        { name: 'Feb', value: 24.5 },
        { name: 'Mar', value: 10 },
        { name: 'Apr', value: 4 },
        { name: 'Mei', value: 50 },
        { name: 'Jun', value: 3 },
        { name: 'Jul', value: 2 },
        { name: 'Agu', value: 2 },
        { name: 'Sep', value: 2 },
        { name: 'Okt', value: 3 },
        { name: 'Nov', value: 30 },
        { name: 'Des', value: 100 },
    ];
    const maxNumber = Math.max(...data.map((item) => item.value));
    const redIndicator = 4;
    const sortedData = [...data].sort((a, b) => a.value - b.value);

    return (

        <div className="h-full flex">
            <div className='h-full w-[1.5px] bg-black'>

            </div>
            {sortedData.map((item, index) => (
                <div key={index} className="flex flex-col h-full">

                    <div className='flex w-full h-full flex-col-reverse'>

                        <div
                            className="flex items-center justify-center mx-2"
                            style={{
                                height: `${(item.value / maxNumber) * 80}%`,
                                background: 'blue',
                                width: '30px',
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
