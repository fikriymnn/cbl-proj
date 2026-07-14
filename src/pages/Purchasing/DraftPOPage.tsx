import DraftPO from '../../components/Tables/Purchasing/DraftPO';
import DefaultLayout from '../../layout/DefaultLayout';

const DraftPOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; Draft Purchase Order
      </p>
      <DraftPO />
    </DefaultLayout>
  );
};

export default DraftPOPage;
