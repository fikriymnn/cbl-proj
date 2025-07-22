import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import TabHistoryPengajuanJabatanKeHRAll from '../../components/Tables/PengajuanKeHR/PengajuanJabatanKeHR copy/TabHistoryPengajuanJabatanKeHr';

function PengajuanJabatanAllDeptHistory() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Pengajuan Jabatan History
        </p>
        <TabHistoryPengajuanJabatanKeHRAll />
      </>
    </DefaultLayout>
  );
}

export default PengajuanJabatanAllDeptHistory;
