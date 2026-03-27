import GudangFG from '../../components/Tables/GudangFG/GudangFG';
import DefaultLayout from '../../layout/DefaultLayout';

const GudangFGPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; Gudang
        </p>
        <GudangFG />
      </>
    </DefaultLayout>
  );
};

export default GudangFGPage;
