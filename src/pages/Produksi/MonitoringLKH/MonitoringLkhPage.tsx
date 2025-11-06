import MonitoringLKH from '../../../components/Tables/Produksi/LKH/MonitoringLKH/MonitoringLKH';
import DefaultLayout from '../../../layout/DefaultLayout';

const MonitoringLKHPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Monitoring LKH
      </p>
      <MonitoringLKH />
    </DefaultLayout>
  );
};

export default MonitoringLKHPage;
