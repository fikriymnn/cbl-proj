
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import MachineFullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import FullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const Machine = () => {

  return (
    <DefaultLayout>

      <p className='font-semibold text-[28px] text-primary mb-[18px]'>Maintenance &gt; Machine</p>
      <MachineFullWidthTabs />


    </DefaultLayout>
  );
};

export default Machine;
