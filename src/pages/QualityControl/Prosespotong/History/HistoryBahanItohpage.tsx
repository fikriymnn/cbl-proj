

import IsiHistoryBahanItoh from '../../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Bahan/IsiHistoryBahanItoh';
import DefaultLayout from '../../../../layout/DefaultLayout';

const HistoryBahanItoh = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; History Potong Bahan Itoh</p>

            <IsiHistoryBahanItoh />

        </DefaultLayout>
    );
};

export default HistoryBahanItoh;
