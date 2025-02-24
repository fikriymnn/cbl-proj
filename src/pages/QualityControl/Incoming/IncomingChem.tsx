import IncomingChemical from '../../../components/Tables/QualityControl/QualityInspection/Incoming/IncomingChemical';
import DefaultLayout from '../../../layout/DefaultLayout';

const IncomingChem = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Checksheet Chemical</p>

            <IncomingChemical />

        </DefaultLayout>
    );
};

export default IncomingChem;
