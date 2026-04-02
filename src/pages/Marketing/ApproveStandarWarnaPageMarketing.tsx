import DefaultLayout from '../../layout/DefaultLayout';
import ApproveStandarWarnaMarketing from '../../components/Tables/Marketing/ApproveStandarWarnaMarketing';

function ApproveStandarWarnaPageMarketing() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Marketing &gt; Approve Standar Warna
        </p>
        <ApproveStandarWarnaMarketing />
      </>
    </DefaultLayout>
  );
}

export default ApproveStandarWarnaPageMarketing;
