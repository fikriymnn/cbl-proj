import PengajuanPurchase from '../../components/Tables/Purchasing/PengajuanPurchase';
import DefaultLayout from '../../layout/DefaultLayout';

const PengajuanPurchasePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; List Pengajuan Purchase
      </p>
      <PengajuanPurchase />
    </DefaultLayout>
  );
};

export default PengajuanPurchasePage;
