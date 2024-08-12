

import IncomingInspection from '../../../components/Tables/QualityControl/QualityInspection/Incoming/IncomingInspection';
import DefaultLayout from '../../../layout/DefaultLayout';

const IncomingIns = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Incoming</p>

            <IncomingInspection />

        </DefaultLayout>
    );
};

export default IncomingIns;
