import DepositApproval from '../../components/Tables/Accounting/DepositApproval';
import DefaultLayout from '../../layout/DefaultLayout';

const DepositApprovalPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; Deposit Approval
      </p>
      <DepositApproval />
    </DefaultLayout>
  );
};

export default DepositApprovalPage;
