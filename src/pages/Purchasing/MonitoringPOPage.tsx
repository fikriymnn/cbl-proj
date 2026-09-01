import PurchasingMonitoringPO from '../../components/Tables/Purchasing/PurchasingMonitoringPO';
import DefaultLayout from '../../layout/DefaultLayout';

const MonitoringPOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Purchasing &gt; PO Monitoring
      </p>
      <PurchasingMonitoringPO />
    </DefaultLayout>
  );
};

export default MonitoringPOPage;
