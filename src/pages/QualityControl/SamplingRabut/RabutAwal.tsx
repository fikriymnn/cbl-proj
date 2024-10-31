import CheckSheetCetakAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakAwal";
import JenisCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/JenisCetak";
import CheckSheetHasilRabut from "../../../components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/CheckSheetHAsilRabutAwal";
import DefaultLayout from "../../../layout/DefaultLayout";



const RabutAwal = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Sampling Hasil Rabut </p>

            <CheckSheetHasilRabut />

        </DefaultLayout>
    );
};

export default RabutAwal;