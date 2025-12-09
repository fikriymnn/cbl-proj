import Deposit from '../../components/Tables/Accounting/Deposit';
import DefaultLayout from '../../layout/DefaultLayout';

const DepositPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; Deposit
      </p>
      <Deposit />
    </DefaultLayout>
  );
};

export default DepositPage;
