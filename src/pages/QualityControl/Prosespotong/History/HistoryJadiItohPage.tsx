import IsiHistoryJadiItoh from '../../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Jadi/IsiHistoryJadiItoh';
import DefaultLayout from '../../../../layout/DefaultLayout';

const HistoryJadiItohPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; History Potong Jadi ITOH</p>

            <IsiHistoryJadiItoh />

        </DefaultLayout>
    );
};

export default HistoryJadiItohPage;
