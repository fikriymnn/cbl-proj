import TabCoating from "../../../components/Tables/QualityControl/QualityInspection/ProsesCoating/TabCoating";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesCoating = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Coating</p>

            <TabCoating />

        </DefaultLayout>
    );
};

export default ProsesCoating;
