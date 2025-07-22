import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import TabPengajuanJabatanKeHRAll from '../../components/Tables/PengajuanKeHR/PengajuanJabatanKeHR copy/TabPengajuanJabatanKeHR';

function PengajuanJabatanAllDept() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Pengajuan Jabatan
        </p>
        <TabPengajuanJabatanKeHRAll />
      </>
    </DefaultLayout>
  );
}

export default PengajuanJabatanAllDept;
