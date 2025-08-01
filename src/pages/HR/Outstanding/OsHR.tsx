
import TabOSHR from '../../../components/Tables/HR/Outstanding/TabOSHR';
import TabOSQC from '../../../components/Tables/QualityControl/OutstandingQC/TabOSQC';
import DefaultLayout from '../../../layout/DefaultLayout';

const OsHR = () => {
    return (
        <DefaultLayout>
            <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
                HR &gt; Outstanding
            </p>
            <TabOSHR />
        </DefaultLayout>
    );
};

export default OsHR;
