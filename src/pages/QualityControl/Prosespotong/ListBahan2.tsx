import ListBahanDaftar from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/ListBahanDaftarPolar";
import DefaultLayout from "../../../layout/DefaultLayout";



const ListBahan2 = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Bahan Mesin POLAR</p>
            <ListBahanDaftar />


        </DefaultLayout>
    );
};

export default ListBahan2;
