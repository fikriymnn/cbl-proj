import TabBOM from '../../../components/Tables/PPIC/BOM/TabBOM';
import DefaultLayout from '../../../layout/DefaultLayout';

function BOMMarketing() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          BOM
        </p>
        <TabBOM />
      </>
    </DefaultLayout>
  );
}

export default BOMMarketing;
