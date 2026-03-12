import ApprovalStandarWarna from '../../components/Tables/QualityControl/ApprovalStandarWarna';
import DefaultLayout from '../../layout/DefaultLayout';

const ApprovalStandarWarnaPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        QC &gt; Approval Standar Warna
      </p>

      <ApprovalStandarWarna />
    </DefaultLayout>
  );
};

export default ApprovalStandarWarnaPage;
