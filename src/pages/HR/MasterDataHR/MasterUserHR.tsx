import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TableUser from '../../../components/Tables/MasterData/TableUser';

function MasterUserHR() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data HR &gt; User
        </p>
        <TableUser />
      </>
    </DefaultLayout>
  );
}

export default MasterUserHR;
