import TableAbsensiQC from "../../../components/Tables/QualityControl/AbsenQC/TableAbsenQC";
import DefaultLayout from "../../../layout/DefaultLayout";




const AbsenQC = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Absensi</p>

            <TableAbsensiQC />
        </DefaultLayout>
    );
};

export default AbsenQC;
