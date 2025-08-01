import DefaultLayout from '../../layout/DefaultLayout';
import TabOSProduksi from './TabOSProduksi';

const ProduksiOS2 = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; OS2
      </p>
      <TabOSProduksi />
    </DefaultLayout>
  );
};

export default ProduksiOS2;
