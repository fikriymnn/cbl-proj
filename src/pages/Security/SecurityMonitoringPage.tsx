import SecurityMonitoring from '../../components/Tables/Security/SecurityMonitoring';
import DefaultLayout from '../../layout/DefaultLayout';

const SecurityMonitoringPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Security &gt; Monitoring
      </p>
      <SecurityMonitoring />
    </DefaultLayout>
  );
};

export default SecurityMonitoringPage;
