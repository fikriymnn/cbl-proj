import TabPraplate from "../../../components/Tables/QualityControl/QualityInspection/ProsesPraplate/TabPraplate";
import TabRekapQC from "../../../components/Tables/QualityControl/RekapQC/TabRekapQC";
import DefaultLayout from "../../../layout/DefaultLayout";



const RekapQC = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Rekap</p>

            <TabRekapQC />

        </DefaultLayout>
    );
};

export default RekapQC;
