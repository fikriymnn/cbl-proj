
import TabOsMTC from '../../../components/Tables/Maintenance/OSMTC/TabOsMTC';
import TabOSQC from '../../../components/Tables/QualityControl/OutstandingQC/TabOSQC';
import DefaultLayout from '../../../layout/DefaultLayout';

const OsMTC = () => {
    return (
        <DefaultLayout>
            <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
                MTC &gt; Outstanding
            </p>
            <TabOsMTC />
        </DefaultLayout>
    );
};

export default OsMTC;
