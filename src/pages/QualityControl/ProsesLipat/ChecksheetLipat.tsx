import ChecksheetLipat from "../../../components/Tables/QualityControl/QualityInspection/ProsesLipat/ChecksheetLipat";
import DefaultLayout from "../../../layout/DefaultLayout";



const ChecksheetLipatPage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Lipat</p>

            <ChecksheetLipat />

        </DefaultLayout>
    );
};

export default ChecksheetLipatPage;
