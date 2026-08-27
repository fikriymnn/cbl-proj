import OutstandingPO from '../../components/Tables/GudangRM/OutstandingPO';
import DefaultLayout from '../../layout/DefaultLayout';

const OutstandingRMPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Gudang RM &gt; Outstanding
      </p>
      <OutstandingPO />
    </DefaultLayout>
  );
};

export default OutstandingRMPage;
