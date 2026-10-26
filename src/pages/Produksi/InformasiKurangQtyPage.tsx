import InformasiKurangQty from '../../components/Tables/Produksi/InformasiKurangQty';
import DefaultLayout from '../../layout/DefaultLayout';

const InformasiKurangQtyPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Informasi Kurang Qty
      </p>
      <InformasiKurangQty />
    </DefaultLayout>
  );
};

export default InformasiKurangQtyPage;
