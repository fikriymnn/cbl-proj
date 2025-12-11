import ListRetur from '../../components/Tables/Accounting/Invoice/ListRetur';
import DefaultLayout from '../../layout/DefaultLayout';

const ListReturPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List Retur
      </p>
      <ListRetur />
    </DefaultLayout>
  );
};

export default ListReturPage;
