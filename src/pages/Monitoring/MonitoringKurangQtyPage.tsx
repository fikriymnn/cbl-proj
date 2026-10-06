import KurangQtyMonitoring from '../../components/Tables/Monitoring/MonitoringKurangQty';

import DefaultLayout from '../../layout/DefaultLayout';

const MonitoringKurangQtyPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; Monitoring Kurang Qty
      </p>
      <KurangQtyMonitoring />
    </DefaultLayout>
  );
};

export default MonitoringKurangQtyPage;
