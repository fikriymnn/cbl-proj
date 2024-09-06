import CheckSheetBarangRS from "../../../components/Tables/QualityControl/QualityInspection/BarangRusak/ChecksheetBarangRS";
import CheckSheetCetakAwal from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/CheckSheetCetakAwal";
import JenisCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/JenisCetak";
import DefaultLayout from "../../../layout/DefaultLayout";



const BarangRSCHecksheet = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Barang Rusak Sebagian </p>
            <CheckSheetBarangRS />


        </DefaultLayout>
    );
};

export default BarangRSCHecksheet;