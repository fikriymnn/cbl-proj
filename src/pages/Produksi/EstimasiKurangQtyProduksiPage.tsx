import EstimasiKurangQtyProduksi from '../../components/Tables/Produksi/EstimasiKurangQtyProduksi';
import DefaultLayout from '../../layout/DefaultLayout';

const EstimasiKurangQtyProduksiPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Estimasi Kurang Qty Produksi
      </p>
      <EstimasiKurangQtyProduksi />
    </DefaultLayout>
  );
};

export default EstimasiKurangQtyProduksiPage;
