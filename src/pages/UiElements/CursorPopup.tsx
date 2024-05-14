import React, { useState, useEffect } from 'react';

const CursorPopup: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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
    <div className="absolute h-screen w-screen">
      <div
        style={{ left: `${position.x + 20}px`, top: `${position.y + 20}px` }}
        className="absolute bg-blue-100 text-blue-900 p-2 rounded shadow-lg pointer-events-none"
      >
        Popup Info
      </div>
    </div>
  );
};

export default CursorPopup;
