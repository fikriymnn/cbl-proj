

import InspeksiQuality from '../../components/Tables/QualityControl/QualityInspection/InspeksiQuality';
import QCFullWidthTabs from '../../components/Tables/QualityControl/ValidateAndVerify/QCFullWidthTable';
import DefaultLayout from '../../layout/DefaultLayout';

const Qualityinspection = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality</p>

            <InspeksiQuality />

        </DefaultLayout>
    );
};

export default Qualityinspection;
