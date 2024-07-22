
import ProsesCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/ProsesCetakMesin";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesCetak = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Cetak</p>

            <ProsesCetakMesin />

        </DefaultLayout>
    );
};

export default ProsesCetak;
