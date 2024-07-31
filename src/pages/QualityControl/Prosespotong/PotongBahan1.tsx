import ListMesinPotongBahan from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/ListMesinPotong";
import DefaultLayout from "../../../layout/DefaultLayout";



const PotongBahan1 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Bahan</p>
            <ListMesinPotongBahan />


        </DefaultLayout>
    );
};

export default PotongBahan1;
