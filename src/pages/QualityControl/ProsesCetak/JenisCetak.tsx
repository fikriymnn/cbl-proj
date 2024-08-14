
import JenisCetakMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCetak/JenisCetak";
import DefaultLayout from "../../../layout/DefaultLayout";



const JenisCetak = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Cetak</p>

            <JenisCetakMesin />

        </DefaultLayout>
    );
};

export default JenisCetak;
