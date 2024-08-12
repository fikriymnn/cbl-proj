
import CheckSheetCoatingAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesCoating/CheckSheetCoatingAwal";
import CheckSheetPondAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/CheckSheetPondAwal";
import DefaultLayout from "../../../layout/DefaultLayout";



const CoatingAwal = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Coating &gt; Awal</p>

            <CheckSheetCoatingAwal />

        </DefaultLayout>
    );
};

export default CoatingAwal;