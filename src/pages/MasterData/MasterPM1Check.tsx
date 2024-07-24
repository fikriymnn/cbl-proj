
import PM1Checklist from '../../components/Tables/MasterData/PM1/PM1Checklist';
import DefaultLayout from '../../layout/DefaultLayout';

const MasterPM1Check = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 1 &gt;  Checklist Activity</p>
            <PM1Checklist />

        </DefaultLayout>
    );
};

export default MasterPM1Check;
