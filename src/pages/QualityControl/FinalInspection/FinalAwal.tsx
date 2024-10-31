import ChecksheetFInalInspection from "../../../components/Tables/QualityControl/QualityInspection/FinalInspection/CheckSheetFInalInspection";
import CheckSheetCetakAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakAwal";
import JenisCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/JenisCetak";
import CheckSheetHasilRabut from "../../../components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/CheckSheetHAsilRabutAwal";
import DefaultLayout from "../../../layout/DefaultLayout";



const FinalAwal = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Final Inspection</p>

            <ChecksheetFInalInspection/>

        </DefaultLayout>
    );
};

export default FinalAwal;