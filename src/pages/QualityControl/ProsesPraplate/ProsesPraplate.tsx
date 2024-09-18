import TabPraplate from "../../../components/Tables/QualityControl/QualityInspection/ProsesPraplate/TabPraplate";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesPraplate = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Pra-Plate</p>

            <TabPraplate />

        </DefaultLayout>
    );
};

export default ProsesPraplate;
