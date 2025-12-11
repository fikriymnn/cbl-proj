import DefaultLayout from '../../layout/DefaultLayout';
import ListPerubahan from '../../components/Tables/Marketing/ListPerubahan';

function ListPerubahanPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          List Perubahan
        </p>
        <ListPerubahan />
      </>
    </DefaultLayout>
  );
}

export default ListPerubahanPage;
