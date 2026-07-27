import MonitoringWIP from '../../components/Tables/Monitoring/MonitoringWIP';
import DefaultLayout from '../../layout/DefaultLayout';

const MonitoringWIPPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Monitoring &gt; WIP
      </p>
      <MonitoringWIP />
    </DefaultLayout>
  );
};

export default MonitoringWIPPage;
