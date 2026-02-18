import SOMonitoring from '../../components/Tables/Monitoring/SOMonitoring';
import DefaultLayout from '../../layout/DefaultLayout';

const SOMonitoringPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; SO
      </p>
      <SOMonitoring />
    </DefaultLayout>
  );
};

export default SOMonitoringPage;
