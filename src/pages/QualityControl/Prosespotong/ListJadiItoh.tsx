
import TabJadiItoh from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Jadi/TabJadiItoh";
import DefaultLayout from "../../../layout/DefaultLayout";



const ListJadiItoh = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Jadi Mesin ITOH</p>
            <TabJadiItoh />


        </DefaultLayout>
    );
};

export default ListJadiItoh;
