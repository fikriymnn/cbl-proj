import RekapInvoice from '../../components/Tables/Accounting/RekapInvoice';
import DefaultLayout from '../../layout/DefaultLayout';

const RekapInvoicePage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; Rekap Invoice
      </p>
      <RekapInvoice />
    </DefaultLayout>
  );
};

export default RekapInvoicePage;
