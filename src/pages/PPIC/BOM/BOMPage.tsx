import BOMCreate from '../../../components/Tables/PPIC/BOM/BOMCreate';
import DefaultLayout from '../../../layout/DefaultLayout';

function BOMMarketing() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          BOM
        </p>
        <BOMCreate />
      </>
    </DefaultLayout>
  );
}

export default BOMMarketing;
