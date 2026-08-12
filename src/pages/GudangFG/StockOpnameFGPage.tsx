import StockOpnameFG from '../../components/Tables/GudangFG/StockOpnameFG';
import DefaultLayout from '../../layout/DefaultLayout';

const StockOpnameFGPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; Stock Opname
        </p>
        <StockOpnameFG />
      </>
    </DefaultLayout>
  );
};

export default StockOpnameFGPage;
