import DefaultLayout from '../../../layout/DefaultLayout';
import ListInvoiceAP from '../../../components/Tables/Accounting/InvoiceAP/ListInvoiceAP';

const ListInvoiceRequestAPPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Invoice Request AP
      </p>
      <ListInvoiceAP mode={'draft'} />
    </DefaultLayout>
  );
};

export default ListInvoiceRequestAPPage;
