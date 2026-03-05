import PrintLabel from '../../components/Tables/Print/PrintLabel';
import DefaultLayout from '../../layout/DefaultLayout';

const LabelPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Print &gt; Label
      </p>
      <PrintLabel />
    </DefaultLayout>
  );
};

export default LabelPage;
