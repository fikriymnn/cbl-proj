import LKHAllData from '../../../components/Tables/Produksi/LKH/MonitoringLKH/LKHAllData';
import DefaultLayout from '../../../layout/DefaultLayout';

const LKHAllDataPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; All Data LKH
      </p>
      <LKHAllData />
    </DefaultLayout>
  );
};

export default LKHAllDataPage;
