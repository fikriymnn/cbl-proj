import POApprovalFinance from '../../components/Tables/Finance/POApprovalFinance';
import DefaultLayout from '../../layout/DefaultLayout';

const POApprovalFinacePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; PO Approval
      </p>
      <POApprovalFinance />
    </DefaultLayout>
  );
};

export default POApprovalFinacePage;
