import IOMarketing from '../../../components/Tables/Marketing/IO/IOMarketing';
import DefaultLayout from '../../../layout/DefaultLayout';

function IOMarketingPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          IO
        </p>
      </>
      <IOMarketing />
    </DefaultLayout>
  );
}

export default IOMarketingPage;
