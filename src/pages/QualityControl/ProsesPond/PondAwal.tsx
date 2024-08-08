
import CheckSheetPondAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/CheckSheetPondAwal";
import DefaultLayout from "../../../layout/DefaultLayout";



const PondAwal = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Ponding &gt; Awal</p>

            <CheckSheetPondAwal />

        </DefaultLayout>
    );
};

export default PondAwal;