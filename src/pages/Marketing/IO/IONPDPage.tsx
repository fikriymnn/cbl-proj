import IONPD from '../../../components/Tables/Marketing/IO/IONPD';
import DefaultLayout from '../../../layout/DefaultLayout';

function IONPDPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          IO NPD
        </p>
      </>
      <IONPD />
    </DefaultLayout>
  );
}

export default IONPDPage;
