import StockOpnameRM from '../../components/Tables/GudangRM/StockOpnameRM';
import DefaultLayout from '../../layout/DefaultLayout';

const StockOpnameRMPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Gudang RM &gt; Stock Opname
      </p>
      <StockOpnameRM />
    </DefaultLayout>
  );
};

export default StockOpnameRMPage;
