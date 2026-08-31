import DefaultLayout from '../../layout/DefaultLayout';
import ApprovalOpnameRMMR from '../../components/Tables/MR/ApprovalOpnameRMMR';

function ApprovalOpnameMRRMPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          MR &gt; Approval Opname RM
        </p>
        <ApprovalOpnameRMMR />
      </>
    </DefaultLayout>
  );
}

export default ApprovalOpnameMRRMPage;
