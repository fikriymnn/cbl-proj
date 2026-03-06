import LaporanPengirimanDO from '../../components/Tables/DO/LaporanPengirimanDO';
import DefaultLayout from '../../layout/DefaultLayout';

const LaporanDOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        DO &gt; Laporan Pengiriman
      </p>
      <LaporanPengirimanDO />
    </DefaultLayout>
  );
};

export default LaporanDOPage;
