import LaporanRekapLKH from '../../components/Tables/Monitoring/LaporanRekapLkh';
import DefaultLayout from '../../layout/DefaultLayout';

const LaporanRekapLKHPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; Laporan Rekap LKH
      </p>
      <LaporanRekapLKH />
    </DefaultLayout>
  );
};

export default LaporanRekapLKHPage;
