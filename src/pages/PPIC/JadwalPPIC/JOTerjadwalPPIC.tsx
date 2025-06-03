import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import JOTerjadwalTable from '../../../components/Tables/PPIC/JadwalProduksi/JOTerjadwalTable';

function JoTerjadwal() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JO TERJADWAL PPIC
        </p>
        <JOTerjadwalTable />
      </>
    </DefaultLayout>
  );
}

export default JoTerjadwal;
