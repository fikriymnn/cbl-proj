import ListJadiDaftarItoh from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/ListJadiDaftarItoh";
import DefaultLayout from "../../../layout/DefaultLayout";



const ListJadiItoh = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Jadi Mesin ITOH</p>
            <ListJadiDaftarItoh />


        </DefaultLayout>
    );
};

export default ListJadiItoh;
