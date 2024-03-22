import React from 'react';
import CardDataStats from '../../components/CardDataStats';

import DefaultLayout from '../../layout/DefaultLayout';
import Production from '../../images/icon/production.svg';
import Maintenance from '../../images/icon/maintenance.svg';
import TableOne from '../../components/Tables/TableOne'

const ECommerce: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="flex gap-3 mb-[24px]">
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

      <TableOne />
    </DefaultLayout>
  );
};

export default ECommerce;
