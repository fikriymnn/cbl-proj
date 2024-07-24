import PotongBahan from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/potongbahan";
import PotongJadi from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/potongJadi";

import DefaultLayout from "../../../layout/DefaultLayout";



const PotongJadiPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt;  Potong Jadi</p>
            <PotongJadi />


        </DefaultLayout>
    );
};

export default PotongJadiPage;
