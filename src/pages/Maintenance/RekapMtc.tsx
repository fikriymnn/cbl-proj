
import TabRekapMtc from '../../components/Tables/Maintenance/RekapMtc/TabRekap';
import DefaultLayout from '../../layout/DefaultLayout';

const RekapMtcPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Maintenance &gt; Rekap</p>
            <TabRekapMtc />


        </DefaultLayout>
    );
};

export default RekapMtcPage;
