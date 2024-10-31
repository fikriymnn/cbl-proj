import TabLipat from "../../../components/Tables/QualityControl/QualityInspection/ProsesLipat/TabLipat";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesLipat = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Lipat</p>

            <TabLipat />

        </DefaultLayout>
    );
};

export default ProsesLipat;
