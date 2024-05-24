

import PM2Checklist from '../../components/Tables/MasterData/PM2/PM2Checklist';
import DefaultLayout from '../../layout/DefaultLayout';

const MasterPM2Check = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 2 &gt;  Checklist Activity</p>
            <PM2Checklist />

        </DefaultLayout>
    );
};

export default MasterPM2Check;
