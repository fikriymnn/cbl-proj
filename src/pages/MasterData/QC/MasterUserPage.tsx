import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TableUser from '../../../components/Tables/MasterData/TableUser';

function MasterUserPageQC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data QC&gt; User
        </p>
        <TableUser />
      </>
    </DefaultLayout>
  );
}

export default MasterUserPageQC;
