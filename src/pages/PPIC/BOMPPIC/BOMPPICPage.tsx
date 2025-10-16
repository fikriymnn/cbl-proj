import BOMPPICCreate from '../../../components/Tables/PPIC/BOMPPIC/BOMPPICCreate';
import DefaultLayout from '../../../layout/DefaultLayout';

function BOMPPIC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          BOM PPIC
        </p>
        <BOMPPICCreate />
      </>
    </DefaultLayout>
  );
}

export default BOMPPIC;
