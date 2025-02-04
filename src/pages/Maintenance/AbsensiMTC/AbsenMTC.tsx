import TabAbsen from "../../../components/Tables/QualityControl/AbsenQC/TabAbsen";
import TableAbsensiQC from "../../../components/Tables/QualityControl/AbsenQC/TableAbsenQC";
import DefaultLayout from "../../../layout/DefaultLayout";




const AbsenMTC = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Absensi</p>

            <TabAbsen />
        </DefaultLayout>
    );
};

export default AbsenMTC;
