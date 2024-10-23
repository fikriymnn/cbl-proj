import TableAbsensi from "../../../../components/Tables/HR/Personnel/Absensi/TableAbsensi";
import TabKalenderKerja from "../../../../components/Tables/HR/Personnel/KalenderKerja/TabKalenderKerja";
import DefaultLayout from "../../../../layout/DefaultLayout";




const Absensi = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personal Management  &gt; Absensi

            </p>
            <TableAbsensi />

        </DefaultLayout>
    );
};

export default Absensi;
