import TabPond from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/TabPond";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesPond = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Ponding</p>

            <TabPond />

        </DefaultLayout>
    );
};

export default ProsesPond;
