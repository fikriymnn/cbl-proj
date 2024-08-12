
import CheckSheetLemAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesLem/CheckSheetLemAwal";
import CheckSheetPondAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/CheckSheetPondAwal";
import DefaultLayout from "../../../layout/DefaultLayout";



const LemAwal = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Lem &gt; Awal</p>

            <CheckSheetLemAwal />

        </DefaultLayout>
    );
};

export default LemAwal;