import ListDO from '../../components/Tables/DO/ListDO';
import DefaultLayout from '../../layout/DefaultLayout';

const ListDOPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        DO &gt; List DO
      </p>
      <ListDO />
    </DefaultLayout>
  );
};

export default ListDOPage;
