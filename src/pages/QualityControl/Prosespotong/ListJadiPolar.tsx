

import TabJadiPolar from "../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Jadi/TabJadiPolar";
import DefaultLayout from "../../../layout/DefaultLayout";



const ListJadiPolar = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Potong Jadi Mesin POLAR</p>
            <TabJadiPolar />


        </DefaultLayout>
    );
};

export default ListJadiPolar;
