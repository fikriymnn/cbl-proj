import IOMarketingHistory from '../../../components/Tables/Marketing/IO/IOMarketingHisotory';
import DefaultLayout from '../../../layout/DefaultLayout';

function IOMarketingPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          IO History
        </p>
      </>
      <IOMarketingHistory />
    </DefaultLayout>
  );
}

export default IOMarketingPage;
