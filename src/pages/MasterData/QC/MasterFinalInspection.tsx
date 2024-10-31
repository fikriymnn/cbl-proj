import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabDefect from '../../../components/Tables/MasterData/QC/TabDefect';
import TabFinalInspection from '../../../components/Tables/MasterData/QC/TabFinalInspection';

function MasterDefect() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data QC&gt; Final Inspection
        </p>
        <TabFinalInspection />
      </>
    </DefaultLayout>
  );
}

export default MasterDefect;
