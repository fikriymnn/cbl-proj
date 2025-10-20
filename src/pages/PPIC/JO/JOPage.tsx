import JOPPICCreate from '../../../components/Tables/PPIC/JO/JOPPICCreate';
import DefaultLayout from '../../../layout/DefaultLayout';

function JOPPIC() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          JO PPIC
        </p>
        <JOPPICCreate />
      </>
    </DefaultLayout>
  );
}

export default JOPPIC;
