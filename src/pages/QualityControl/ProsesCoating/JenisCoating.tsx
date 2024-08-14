
import JenisCoatingMesin from "../../../components/Tables/QualityControl/QualityInspection/ProsesCoating/JenisCoating";

import DefaultLayout from "../../../layout/DefaultLayout";



const JenisCoating = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Coating</p>

            <JenisCoatingMesin />

        </DefaultLayout>
    );
};

export default JenisCoating;
