import React, { useEffect, useState } from 'react';

const BarChart: React.FC = () => {
  const data = [
    { name: 'aksjfhjs', value: 100 },
    { name: 'asfsaf', value: 24 },
    { name: 'asffsa', value: 10 },
    { name: 'asfas', value: 4 },
    { name: 'MesinE', value: 50 },
    {
      name: 'asfsfajj  jjjjjj jjjjj jjjj jkbfjkbf jdbfkjdbfkjd kjdbfdjk fbdj bjkdfb djbf kjdbfkjbdkj dj',
      value: 3,
    },
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
              className={`w-12 line-clamp-2 text-xs flex flex-col text-black px-1 rounded-sm justify-center ${
                hoveredItem && hoveredItem.name === item.name
                  ? 'bg-slate-200'
                  : ''
              }`}
            >
              <p className="line-clamp-2">{item.name}</p>
            </div>
            <div className="w-3 h-full border-b border-e border-x-graydark"></div>
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
                <div>Nama Part: {item.name}</div>
                <div>Jenis Part: </div>
                <div
                  className={`${
                    item.value <= redIndicator
                      ? 'text-red-500'
                      : 'text-blue-600'
                  }`}
                >
                  Sisa Stok: {item.value}
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
