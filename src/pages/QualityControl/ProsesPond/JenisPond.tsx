
import JenisPondMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesPond/JenisPond";
import DefaultLayout from "../../../layout/DefaultLayout";



const JenisPond = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Pond</p>

            <JenisPondMesin />

        </DefaultLayout>
    );
};

export default JenisPond;
