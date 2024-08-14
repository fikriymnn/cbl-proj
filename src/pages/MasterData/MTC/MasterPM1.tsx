
import TablePM1 from '../../../components/Tables/MasterData/PM1/TablePM1';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterPM1 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 1</p>
            <TablePM1 />

        </DefaultLayout>
    );
};

export default MasterPM1;
