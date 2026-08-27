import GudangRM from '../../components/Tables/GudangRM/GudangRM';
import DefaultLayout from '../../layout/DefaultLayout';

const GudangRMPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Gudang RM &gt; Gudang
      </p>
      <GudangRM />
    </DefaultLayout>
  );
};

export default GudangRMPage;
