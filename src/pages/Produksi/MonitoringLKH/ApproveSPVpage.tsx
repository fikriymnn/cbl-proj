import ApproveSPVLKH from '../../../components/Tables/Produksi/LKH/MonitoringLKH/ApproveSPVLKH';
import DefaultLayout from '../../../layout/DefaultLayout';

const ApproveSPVPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Approve SPV LKH
      </p>
      <ApproveSPVLKH />
    </DefaultLayout>
  );
};

export default ApproveSPVPage;
