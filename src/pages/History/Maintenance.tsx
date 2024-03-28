
import TabsHistory from '../../components/Tables/History/Tabs';
import MachineFullWidthTabs from '../../components/Tables/Maintenance/MachineFullWidthTabs';
import DefaultLayout from '../../layout/DefaultLayout';

const HistoryMtc = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold text-[28px] text-primary mb-[18px]'>History &gt; Maintenance</p>
            <TabsHistory />


        </DefaultLayout>
    );
};

export default HistoryMtc;
