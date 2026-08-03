import BAPFg from '../../components/Tables/GudangFG/BAPFg';
import DefaultLayout from '../../layout/DefaultLayout';

const BapPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; BAP
        </p>
        <BAPFg />
      </>
    </DefaultLayout>
  );
};

export default BapPage;
