import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import HistoryOKP from '../../../components/Tables/Marketing/OKP/HistoryOKP';

function HistoryOKPPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          OKP History
        </p>
        <HistoryOKP />
      </>
    </DefaultLayout>
  );
}

export default HistoryOKPPage;
