import React from 'react';

const BarChart = () => {
  const data = [
    { name: 'aksjfhjs', value: 100 },
    { name: 'asfsaf', value: 24 },
    { name: 'asffsa', value: 10 },
    { name: 'asfas', value: 4 },
    { name: 'MesinE', value: 50 },
    { name: 'asfsfa', value: 3 },
    { name: 'G', value: 2 },
    { name: 'H', value: 2 },
    { name: 'I', value: 2 },
    { name: 'J', value: 3 },
    { name: 'K', value: 30 },
    { name: 'L', value: 100 },
  ];
  const maxNumber = Math.max(...data.map((item) => item.value));
  const redIndicator = 4;
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  return (
    <div className="w-full h-full flex flex-col">
      {sortedData.map((item, index) => (
        <div key={index} className="flex">
          <div className="w-10 line-clamp-1 text-xs flex flex-col text-black pe-3 justify-center">
            {item.name}
          </div>
          <div className="w-3 h-full border-b border-e border-x-graydark "></div>
          <div
            className="flex items-center justify-center my-[3px]"
            style={{
              width: `${(item.value / maxNumber) * 80}%`,
              background: item.value <= redIndicator ? 'red' : 'blue',
              height: '30px',
            }}
          ></div>
          <div className="w-5 flex flex-col justify-center ms-1">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
