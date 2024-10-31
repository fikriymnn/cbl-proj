
import CheckSheetCetakPeriode from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakPeriode";
import CheckSheetPondPeriode from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/CheckSheetPondPeriode";
import DefaultLayout from "../../../layout/DefaultLayout";



const PondPeriode = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Pond &gt; Periode</p>

            <CheckSheetPondPeriode />

        </DefaultLayout>
    );
};

export default PondPeriode;