import TabApprovalBOM from '../../../components/Tables/PPIC/BOM/TabApprovalBOM';
import DefaultLayout from '../../../layout/DefaultLayout';

function BOMApprovalPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Approval BOM
        </p>
        <TabApprovalBOM />
      </>
    </DefaultLayout>
  );
}

export default BOMApprovalPage;
