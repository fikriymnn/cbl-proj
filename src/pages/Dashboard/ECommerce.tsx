import React from 'react';
import CardDataStats from '../../components/CardDataStats';

import DefaultLayout from '../../layout/DefaultLayout';
import Production from '../../images/icon/production.svg';
import Maintenance from '../../images/icon/maintenance.svg';
import TableOne from '../../components/Tables/Maintenance/TableIncomingMaintenance'
import HorizontalBars from '../../components/Charts/HorizontalBars';

const ECommerce: React.FC = () => {
  return (
    <DefaultLayout>
      <p className='font-semibold text-[28px] text-primary mb-[18px]'>Overview Dashboard</p>
      <div className="flex gap-3 ">
        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
          <div className='flex gap-3'>

            <img src={Production} alt="Logo" />

            <p className='text-[14px] text-[#0065DE]'>Production</p>
          </div>
        </CardDataStats>
        <CardDataStats title="Total Profit" total="$45,2K" rate="4.35%" levelUp>
          <div className='flex gap-3'>

            <img src={Maintenance} alt="Logo" />

            <p className='text-[14px] text-[#0065DE]'>Maintenance</p>
          </div>
        </CardDataStats>

      </div>
      <div className='w-full p-4 bg-white my-[26px] rounded-[10px] flex flex-col'>
        <div className='flex items-start gap-3'>

          <img src={Production} alt="Logo" className='w-5' />
          <p className='text-primary text-sm'>Production Overview</p>
        </div>
        <div className=''>

          <HorizontalBars />
        </div>
      </div>

      <TableOne />
    </DefaultLayout>
  );
};

export default ECommerce;
