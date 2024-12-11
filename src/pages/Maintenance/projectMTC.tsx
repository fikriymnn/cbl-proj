

import TableProject from '../../components/Tables/Maintenance/ProjectMtc/TableProjectMTC';
import QCFullWidthTabs from '../../components/Tables/QualityControl/ValidateAndVerify/QCFullWidthTable';
import DefaultLayout from '../../layout/DefaultLayout';

const ProjectMTC = () => {

  return (
    <DefaultLayout>

      <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>MTC &gt; Project Maintenance</p>

      <TableProject/>

    </DefaultLayout>
  );
};

export default ProjectMTC;
