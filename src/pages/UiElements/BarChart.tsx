import React, { useEffect, useState } from 'react';

const BarChart: React.FC = () => {
  const data = [
    { machine: 'R700', name: 'Bearing 6001 SKF', status: 'ori', value: 29 },
    {
      machine: 'R700',
      name: 'Bearing 6001 SKC',
      status: 'second ori',
      value: 8,
    },
    {
      machine: 'R700',
      name: 'Carbon Fane BG21 WN 124-120 @7pcs',
      status: 'ori',
      value: 5,
    },
    {
      machine: 'JK100',
      name: 'Pre-Folding Left/Right Lower Belt 4.0x30x5540',
      status: 'ori',
      value: 1,
    },
    { machine: 'OP', name: 'Stamped', status: 'ori', value: 50 },
    {
      machine: 'OP',
      name: 'Koas 2',
      status: 'ori',
      value: 3,
    },
    { machine: 'OP', name: 'Baut L', status: 'second', value: 6 },
    { machine: 'OP', name: 'Starter', status: 'ori', value: 2 },
    { machine: 'GTO', name: 'Encoder', status: 'ori', value: 2 },
    { machine: 'M. Lipat', name: 'Sarang Tawon', status: 'ori', value: 3 },
    { machine: 'ITOH', name: 'As Silver Steel', status: 'ori', value: 16 },
    { machine: 'POLAR', name: 'Oli Hydraulic', status: 'second ori', value: 9 },
  ];

  const maxNumber = Math.max(...data.map((item) => item.value));
  const redIndicator = 4;
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [hoveredItem, setHoveredItem] = useState<{
    name: string;
    value: number;
  } | null>(null);

  const handleMouseMove = (event: MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col relative">
        {sortedData.map((item, index) => (
          <div
            key={index}
            className="flex"
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              className={`w-12 line-clamp-2 text-xs flex flex-col text-black px-1 justify-center border-b-[1px] border-e-[1px] ${
                hoveredItem && hoveredItem.name === item.name
                  ? 'bg-slate-200'
                  : 'rounded-non'
              }`}
            >
              <p className="line-clamp-2">{item.name}</p>
            </div>
            {/* //<div className="w-3 h-full border-b border-e border-x-graydark"></div> */}
            <div
              className="flex items-center justify-center my-[3px]"
              style={{
                width: `${(item.value / maxNumber) * 80}%`,
                background: item.value <= redIndicator ? 'red' : 'blue',
                height: '30px',
              }}
            ></div>
            <div
              className="w-5 flex flex-col justify-center ms-1 font-medium"
              style={{
                color: item.value <= redIndicator ? 'red' : 'blue',
              }}
            >
              {item.value}
            </div>
            {hoveredItem && hoveredItem.name === item.name && (
              <div
                style={{
                  left: `${position.x + 10}px`,
                  top: `${position.y + 10}px`,
                }}
                className="fixed flex z-50 flex-col bg-blue-100 text-blue-900 font-xs p-2 rounded shadow-lg pointer-events-none"
              >
                <div className="text-md font-medium uppercase">{item.name}</div>
                <div>Mesin: {item.machine}</div>
                <div>Status: {item.status}</div>
                <div
                  className={`${
                    item.value <= redIndicator
                      ? 'text-red-500'
                      : 'text-blue-600'
                  }`}
                >
                  Stok: {item.value}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default BarChart;
