
import PotongJadiChecksheet from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotongFix/PotongJadiChecksheet";
import DefaultLayout from "../../../layout/DefaultLayout";



const PotongJadiCheck = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Potong &gt; Potong Jadi</p>

            <PotongJadiChecksheet />

        </DefaultLayout>
    );
};

export default PotongJadiCheck;