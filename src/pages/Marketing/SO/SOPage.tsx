import SOMarketing from '../../../components/Tables/Marketing/SO/SOMarketing';
import DefaultLayout from '../../../layout/DefaultLayout';

function SOPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          SO
        </p>
        <SOMarketing />
      </>
    </DefaultLayout>
  );
}

export default SOPage;
