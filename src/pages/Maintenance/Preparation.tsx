
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import PrepFullWidthTabs from '../../components/Tables/Maintenance/PrepFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const Preparation = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold text-[28px] text-primary mb-[18px]'>Maintenance &gt; Preparation</p>
            <PrepFullWidthTabs />


        </DefaultLayout>
    );
};

export default Preparation;
