import JOMonitoring from '../../components/Tables/Monitoring/JOMonitoring';
import DefaultLayout from '../../layout/DefaultLayout';

const JOMonitoringPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; JO
      </p>
      <JOMonitoring />
    </DefaultLayout>
  );
};

export default JOMonitoringPage;
