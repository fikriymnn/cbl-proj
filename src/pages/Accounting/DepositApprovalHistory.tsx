import DepositApprovalHistory from '../../components/Tables/Accounting/DepositApprovalHistory';
import DefaultLayout from '../../layout/DefaultLayout';

const DepositApprovalHistoryPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; Deposit Approval History
      </p>
      <DepositApprovalHistory />
    </DefaultLayout>
  );
};

export default DepositApprovalHistoryPage;
