import DefaultLayout from '../../layout/DefaultLayout';

import ApprovalOpnameMR from '../../components/Tables/MR/ApprovalOpnameMR';

function ApprovalOpnameMRPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          MR &gt; Approval Opname
        </p>
        <ApprovalOpnameMR />
      </>
    </DefaultLayout>
  );
}

export default ApprovalOpnameMRPage;
