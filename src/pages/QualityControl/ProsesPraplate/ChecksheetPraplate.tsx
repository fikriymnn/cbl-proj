import ChecksheetPraplate from "../../../components/Tables/QualityControl/QualityInspection/ProsesPraplate/ChekcsheetPraplate";
import DefaultLayout from "../../../layout/DefaultLayout";



const ChecksheetPralatePage = () => {

    return (
        <DefaultLayout>

            <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Inspeksi Quality  &gt; Proses Pra-Plate</p>

            <ChecksheetPraplate />

        </DefaultLayout>
    );
};

export default ChecksheetPralatePage;
