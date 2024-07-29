import ListBahanDaftarItoh from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/ListBahanDaftarItoh";
import DefaultLayout from "../../../layout/DefaultLayout";



const ListBahan1 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Bahan Mesin ITOH</p>
            <ListBahanDaftarItoh />


        </DefaultLayout>
    );
};

export default ListBahan1;
