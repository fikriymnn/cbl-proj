
import TabsHistory from '../../../components/Tables/History/Tabs';
import MachineFullWidthTabs from '../../../components/Tables/Maintenance/MachineFullWidthTabs';
import TableMachine from '../../../components/Tables/MasterData/TableMachine';
import DefaultLayout from '../../../layout/DefaultLayout';

const MasterData = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Master Data &gt; Machine</p>
            <TableMachine />

        </DefaultLayout>
    );
};

export default MasterData;
