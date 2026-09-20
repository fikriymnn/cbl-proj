import ListAR from '../../components/Tables/Accounting/Invoice/ListAr';
import DefaultLayout from '../../layout/DefaultLayout';

const ListArPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Accounting &gt; List AR
      </p>
      <ListAR />
    </DefaultLayout>
  );
};

export default ListArPage;
