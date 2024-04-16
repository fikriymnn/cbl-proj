
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import MANFullWidthTabs from '../../components/Tables/Maintenance/MANFullWidthTabs';
import MachineFullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import FullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const MAN = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; MAN</p>
            <MANFullWidthTabs />


        </DefaultLayout>
    );
};

export default MAN;
