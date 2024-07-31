import ListMesinPotongJadi from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/ListMesinPotongJadi";
import ProsesPotong2 from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Prosespotong2";
import DefaultLayout from "../../../layout/DefaultLayout";



const PotongJadi1 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Jadi</p>
            <ListMesinPotongJadi />


        </DefaultLayout>
    );
};

export default PotongJadi1;
