import TambahBahanMonitoring from '../../components/Tables/Monitoring/TambahBahanMonitoring';
import DefaultLayout from '../../layout/DefaultLayout';

const MonitoringTambahBahanPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; Monitoring Tambah Bahan
      </p>
      <TambahBahanMonitoring />
    </DefaultLayout>
  );
};

export default MonitoringTambahBahanPage;
