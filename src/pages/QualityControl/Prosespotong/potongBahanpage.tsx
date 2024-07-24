import PotongBahan from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/potongbahan";

import DefaultLayout from "../../../layout/DefaultLayout";



const PotongBahanPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt;  Potong Bahan</p>
            <PotongBahan />


        </DefaultLayout>
    );
};

export default PotongBahanPage;
