import TabBarangRusak from "../../../components/Tables/QualityControl/QualityInspection/BarangRusak/TabBarangRusak";
import ProsesPotong2 from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Prosespotong2";
import DefaultLayout from "../../../layout/DefaultLayout";

const BarangRusak = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Barang Rusak</p>
            <TabBarangRusak />

        </DefaultLayout>
    );
};

export default BarangRusak;
