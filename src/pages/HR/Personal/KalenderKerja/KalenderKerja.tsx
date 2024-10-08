import TabKalenderKerja from "../../../../components/Tables/HR/Personnel/KalenderKerja/TabKalenderKerja";
import DefaultLayout from "../../../../layout/DefaultLayout";




const KalenderKerja = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personal Management  &gt; Kalender Kerja

            </p>
            <TabKalenderKerja />

        </DefaultLayout>
    );
};

export default KalenderKerja;
