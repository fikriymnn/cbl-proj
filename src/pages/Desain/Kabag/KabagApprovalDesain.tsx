import DefaultLayout from '../../../layout/DefaultLayout';
import TabKabagApproveDesain from '../../../components/Tables/Desain/Kabag/TabKabagDesain';

function KabagApprovalDesain() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Desain Approval
        </p>
        <TabKabagApproveDesain />
      </>
    </DefaultLayout>
  );
}

export default KabagApprovalDesain;
