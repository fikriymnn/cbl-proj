import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabKabagApprove from '../../../components/Tables/Marketing/Kabag/TabKabagApprove';

function KabagApproval() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Kabag Approval
        </p>
        <TabKabagApprove />
      </>
    </DefaultLayout>
  );
}

export default KabagApproval;
