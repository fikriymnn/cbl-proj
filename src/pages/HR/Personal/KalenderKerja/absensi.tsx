import TabAbsenHR from "../../../../components/Tables/HR/Personnel/Absensi/TabAbsenHR";
import DefaultLayout from "../../../../layout/DefaultLayout";




const Absensi = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Personal Management  &gt; Absensi

            </p>
            <TabAbsenHR />

        </DefaultLayout>
    );
};

export default Absensi;
