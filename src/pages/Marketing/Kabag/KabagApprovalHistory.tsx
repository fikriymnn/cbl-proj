import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabKabagApprove from '../../../components/Tables/Marketing/Kabag/TabKabagApprove';
import TabKabagApproveHistory from '../../../components/Tables/Marketing/Kabag/TabKabagApproveHistory';

function KabagApprovalHistory() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Kabag Approval History
        </p>
        <TabKabagApproveHistory />
      </>
    </DefaultLayout>
  );
}

export default KabagApprovalHistory;
