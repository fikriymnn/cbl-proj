import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import DetailMasterKaryawanIsi from '../../../components/Tables/HR/Personnel/DetailMasterKaryawan';

function DetailMasterKaryawan() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Personnel Management &gt; Detail Karyawan
        </p>
        <DetailMasterKaryawanIsi />
      </>
    </DefaultLayout>
  );
}

export default DetailMasterKaryawan;
