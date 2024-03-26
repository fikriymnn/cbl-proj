
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import MaterialFullWidthTabs from '../../components/Tables/Maintenance/MaterialFullWidthTabs';
import FullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const Material = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold text-[28px] text-primary mb-[18px]'>Maintenance &gt; Material</p>
            <MaterialFullWidthTabs />


        </DefaultLayout>
    );
};

export default Material;
