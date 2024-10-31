
import PotongBahanChecksheet from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotongFix/PotongBahanChecksheet";
import DefaultLayout from "../../../layout/DefaultLayout";



const PotongBahanCheck = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Potong &gt; Potong Bahan</p>

            <PotongBahanChecksheet />

        </DefaultLayout>
    );
};

export default PotongBahanCheck;