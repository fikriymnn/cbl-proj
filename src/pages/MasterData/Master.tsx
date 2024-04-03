
import TabsHistory from '../../components/Tables/History/Tabs';
import MachineFullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const MasterData = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold text-[28px] text-primary mb-[18px]'>Master Data &gt; Machine</p>
            <TabsHistory />

        </DefaultLayout>
    );
};

export default MasterData;
