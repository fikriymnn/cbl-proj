import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';

import KalenderJadwalLembur from '../../../components/Tables/PPIC/KalenderJadwalLembur';

function JadwalLemburPPIC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JADWAL LEMBUR
        </p>
        <KalenderJadwalLembur />
      </>
    </DefaultLayout>
  );
}

export default JadwalLemburPPIC;
