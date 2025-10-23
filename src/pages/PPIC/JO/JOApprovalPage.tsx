import JOApproval from '../../../components/Tables/PPIC/JO/JOApproval';
import DefaultLayout from '../../../layout/DefaultLayout';

function JOApprovalPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JO APPROVAL PPIC
        </p>
        <JOApproval />
      </>
    </DefaultLayout>
  );
}

export default JOApprovalPage;
