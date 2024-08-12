
import ProsesCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/ProsesCetakMesin";
import TabCetak from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/TabCetak";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesCetak = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Cetak</p>

            <TabCetak />

        </DefaultLayout>
    );
};

export default ProsesCetak;
