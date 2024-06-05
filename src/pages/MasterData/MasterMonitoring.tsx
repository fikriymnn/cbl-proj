
import TableMonitoring from '../../components/Tables/MasterData/TableMonitoring';
import DefaultLayout from '../../layout/DefaultLayout';

const MasterMonitoring = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data  &gt;  Monitoring</p>
            <TableMonitoring />

        </DefaultLayout>
    );
};

export default MasterMonitoring;
