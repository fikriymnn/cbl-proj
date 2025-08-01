import DefaultLayout from "../../layout/DefaultLayout";
import DetailBreakdown from "./DetailBreakdown";


const ProduksiBreakdownTtime = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>Produksi &gt; Breakdown Time</p>
            <DetailBreakdown />

        </DefaultLayout>
    );
};

export default ProduksiBreakdownTtime;
