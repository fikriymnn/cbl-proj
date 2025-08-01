import TabRekapPPIC from "../../../components/Tables/PPIC/RekapPPIC/TabRekapPPIC";
import DefaultLayout from "../../../layout/DefaultLayout";

const RekapPPIC = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>PPIC &gt; Rekap</p>

            <TabRekapPPIC />

        </DefaultLayout>
    );
};

export default RekapPPIC;
