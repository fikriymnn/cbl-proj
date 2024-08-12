



import IsiHistoryJadiPolar from '../../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Jadi/IsiHistoryJadiPolar';
import DefaultLayout from '../../../../layout/DefaultLayout';

const HistoryJadiPolarPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; History Potong Jadi Polar</p>

            <IsiHistoryJadiPolar />

        </DefaultLayout>
    );
};

export default HistoryJadiPolarPage;
