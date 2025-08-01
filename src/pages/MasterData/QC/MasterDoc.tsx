import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import MasterNoDoc from '../../../components/Tables/MasterData/QC/Masternodoc';

function MasterDoc() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data QC&gt; Nomor Form / Doc
        </p>
        <MasterNoDoc />
      </>
    </DefaultLayout>
  );
}

export default MasterDoc;
