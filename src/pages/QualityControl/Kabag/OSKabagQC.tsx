import DefaultLayout from '../../../layout/DefaultLayout';
import TabKabagApproveQC from '../../../components/Tables/QualityControl/Kabag/TabKabagApproveQc';

function KabagApprovalQC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Kabag Approval QC
        </p>
        <TabKabagApproveQC />
      </>
    </DefaultLayout>
  );
}

export default KabagApprovalQC;
