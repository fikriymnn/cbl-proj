import POApprovalPurchase from '../../components/Tables/Purchasing/POApprovalPurchase';
import DefaultLayout from '../../layout/DefaultLayout';

const POApprovalPurchasePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; PO Approval
      </p>
      <POApprovalPurchase />
    </DefaultLayout>
  );
};

export default POApprovalPurchasePage;
