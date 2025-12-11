import DefaultLayout from '../../layout/DefaultLayout';
import CreatePerubahan from '../../components/Tables/Marketing/CreatePerubahan';

function CreatePerubahanPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Create Perubahan
        </p>
        <CreatePerubahan />
      </>
    </DefaultLayout>
  );
}

export default CreatePerubahanPage;
