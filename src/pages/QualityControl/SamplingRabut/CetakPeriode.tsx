
import CheckSheetCetakPeriode from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakPeriode";
import DefaultLayout from "../../../layout/DefaultLayout";



const CetaPeriode = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Cetak &gt; Periode</p>

            <CheckSheetCetakPeriode />

        </DefaultLayout>
    );
};

export default CetaPeriode;