import InputLKH from '../../../components/Tables/Produksi/LKH/InputLKH/InputLKH';
import DefaultLayout from '../../../layout/DefaultLayout';

const InputLKHPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Produksi &gt; Input LKH
      </p>
      <InputLKH />
    </DefaultLayout>
  );
};

export default InputLKHPage;
