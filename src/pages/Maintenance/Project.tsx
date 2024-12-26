
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import FullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import PrepFullWidthTabs from '../../components/Tables/Maintenance/PrepFullWidthTabs';
import ProjectMtc from '../../components/Tables/Maintenance/projectMtc';
import DefaultLayout from '../../layout/DefaultLayout';

const Project = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Project</p>
            <ProjectMtc />


        </DefaultLayout>
    );
};

export default Project;
