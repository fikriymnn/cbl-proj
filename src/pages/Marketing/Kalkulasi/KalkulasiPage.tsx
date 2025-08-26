import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import KalkulasiNormmal from '../../../components/Tables/Marketing/Kalkulasi/KalkulasiNormal';

function KalkulasiPageMarketing() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Kalkulasi
        </p>
        <KalkulasiNormmal />
      </>
    </DefaultLayout>
  );
}

export default KalkulasiPageMarketing;
