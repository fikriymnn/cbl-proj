import DefaultLayout from '../../layout/DefaultLayout';
import TabRekapProduksi from './TabRekap';

const ProduksiWaste = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Waste
      </p>
      <TabRekapProduksi />
    </DefaultLayout>
  );
};

export default ProduksiWaste;
