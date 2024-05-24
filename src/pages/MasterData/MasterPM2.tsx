
import TablePM2 from '../../components/Tables/MasterData/PM2/TablePM2';
import DefaultLayout from '../../layout/DefaultLayout';

const MasterPM1 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  PM 2</p>
            <TablePM2 />

        </DefaultLayout>
    );
};

export default MasterPM1;
