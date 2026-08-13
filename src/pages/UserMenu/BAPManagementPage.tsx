import BAPManagement from '../../components/Tables/GudangFG/BAPManagement';
import DefaultLayout from '../../layout/DefaultLayout';

const BAPManagementPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Management &gt; BAP
      </p>
      <BAPManagement />
    </DefaultLayout>
  );
};

export default BAPManagementPage;
