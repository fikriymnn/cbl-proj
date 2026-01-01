import BukaLKH from '../../../components/Tables/Produksi/LKH/MonitoringLKH/BukaLKH';
import DefaultLayout from '../../../layout/DefaultLayout';

const BukaLKHPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Buka LKH
      </p>
      <BukaLKH />
    </DefaultLayout>
  );
};

export default BukaLKHPage;
