

import QCFullWidthTabs from '../../components/Tables/QualityControl/QCFullWidthTable';
import DefaultLayout from '../../layout/DefaultLayout';

const MaintenanceQC = () => {

  return (
    <DefaultLayout>

      <p className='font-semibold text-[28px] text-primary mb-[18px]'>Quality Control &gt; Maintenance</p>

      <QCFullWidthTabs />

    </DefaultLayout>
  );
};

export default MaintenanceQC;
