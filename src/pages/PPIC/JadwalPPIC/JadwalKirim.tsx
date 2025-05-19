import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabJadwalKirim from '../../../components/Tables/PPIC/JadwalKirim/TabJadwalKirim';

function JadwalKirimPPIC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JADWAL KIRIM
        </p>
        <TabJadwalKirim />
      </>
    </DefaultLayout>
  );
}

export default JadwalKirimPPIC;
