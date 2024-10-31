
import TabRusakSebagian from "../../../components/Tables/QualityControl/QualityInspection/BarangRusakSebagian/TabRusakSebagian";
import TabFinalInspection from "../../../components/Tables/QualityControl/QualityInspection/FinalInspection/TabFinalInspection";
import ProsesCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/ProsesCetakMesin";
import TabCetak from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/TabCetak";
import TabSamplingHasilRabut from "../../../components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/TabSamplingHasilRabut";
import DefaultLayout from "../../../layout/DefaultLayout";




const BarangRusakSebagian = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Barang Rusak Sebagian</p>

            <TabRusakSebagian/>

        </DefaultLayout>
    );
};

export default BarangRusakSebagian;
