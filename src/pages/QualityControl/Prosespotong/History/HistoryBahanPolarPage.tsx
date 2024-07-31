


import IsiHistoryBahanPolar from '../../../../components/Tables/QualityControl/QualityInspection/ProsesPotong/Bahan/IsiHistoryBahanPolar';
import DefaultLayout from '../../../../layout/DefaultLayout';

const HistoryBahanPolar = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; History Potong Bahan Polar</p>

            <IsiHistoryBahanPolar />

        </DefaultLayout>
    );
};

export default HistoryBahanPolar;
