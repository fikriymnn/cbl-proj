
import TabOsPPIC from '../../../components/Tables/PPIC/OutstandingPPIC/TabOsPPIC';
import DefaultLayout from '../../../layout/DefaultLayout';

const OsPPIC = () => {
    return (
        <DefaultLayout>
            <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
                PPIC &gt; Outstanding
            </p>
            <TabOsPPIC />
        </DefaultLayout>
    );
};

export default OsPPIC;
