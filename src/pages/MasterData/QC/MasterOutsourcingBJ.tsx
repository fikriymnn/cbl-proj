import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabDefect from '../../../components/Tables/MasterData/QC/TabDefect';
import TabOutsourcing from '../../../components/Tables/MasterData/QC/TabOutsourcing';

function MasterDefect() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data QC&gt; Outsourcing Barang Jadi
        </p>
        <TabOutsourcing />
      </>
    </DefaultLayout>
  );
}

export default MasterDefect;
