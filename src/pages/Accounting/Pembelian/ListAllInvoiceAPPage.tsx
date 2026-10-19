import DefaultLayout from '../../../layout/DefaultLayout';
import ListAP from '../../../components/Tables/Accounting/InvoiceAP/ListAP';

const ListAllInvoiceAPPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List All Invoice Approve AP
      </p>
      <ListAP />
    </DefaultLayout>
  );
};

export default ListAllInvoiceAPPage;
