import ProsesPotong2 from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Prosespotong2";
import DefaultLayout from "../../../layout/DefaultLayout";



const ProsesPotong = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Potong</p>
            <ProsesPotong2 />


        </DefaultLayout>
    );
};

export default ProsesPotong;
