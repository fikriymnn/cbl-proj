import PrintLabelJO from '../../components/Tables/Print/PrintLabelJO';
import DefaultLayout from '../../layout/DefaultLayout';

const LabelJOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Print &gt; Label JO
      </p>
      <PrintLabelJO />
    </DefaultLayout>
  );
};

export default LabelJOPage;
