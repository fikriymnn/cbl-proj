import React, { ReactNode } from 'react';

interface CardDataStatsProps {
  title: string;
  total: string;
  rate: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  children,
}) => {
  return (
    <div className="rounded-[10px] w-[359.75px] border border-stroke bg-white p-[20px] shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-start justify-start rounded-full  dark:bg-meta-4 mb-[10px]">
        {children}
      </div>
      <div className='flex gap-3 items-center justify-center'>
        <div className='w-full h-[62.26px]  p-2 primary-blue text-white rounded-[7px]'>
          <p className='text-[12px]'>Schedule</p>
          <h1 className='text-[29px]'>16</h1>
        </div>
        <div className='w-full h-[62.26px]  p-2 primary-darkblue text-white rounded-[7px]'>
          <p className='text-[12px]'>On progress</p>
          <h1 className='text-[29px]'>16</h1>
        </div>
        <div className='w-full h-[62.26px] text-black p-2 bg-[#D8EAFF]  rounded-[7px]'>
          <p className='text-[12px]'>Schedule</p>
          <h1 className='text-[29px] '>16</h1>
        </div>

      </div>

    </div>
  );
};

export default CardDataStats;
