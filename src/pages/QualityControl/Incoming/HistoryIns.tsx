

import HistoryIncoming from '../../../components/Tables/QualityControl/QualityInspection/Incoming/HistoryIncoming';
import IncomingInspection from '../../../components/Tables/QualityControl/QualityInspection/Incoming/IncomingInspection';
import DefaultLayout from '../../../layout/DefaultLayout';

const HistoryIns = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; History Incoming</p>

            <HistoryIncoming />

        </DefaultLayout>
    );
};

export default HistoryIns;
