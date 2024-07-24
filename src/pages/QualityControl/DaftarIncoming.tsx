


import ListIncoming2 from '../../components/Tables/QualityControl/QualityInspection/ListIncoming';
import DefaultLayout from '../../layout/DefaultLayout';

const IncomingList = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Daftar Incoming</p>

            <ListIncoming2 />

        </DefaultLayout>
    );
};

export default IncomingList;
