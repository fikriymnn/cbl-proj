
import TabOSQC from '../../../components/Tables/QualityControl/OutstandingQC/TabOSQC';
import DefaultLayout from '../../../layout/DefaultLayout';

const OsQC = () => {
    return (
        <DefaultLayout>
            <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
                QC &gt; Outstanding
            </p>
            <TabOSQC />
        </DefaultLayout>
    );
};

export default OsQC;
