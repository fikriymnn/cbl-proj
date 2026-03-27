import IncomingBarangJadi from '../../components/Tables/GudangFG/PenerimaanBarangJadi';
import DefaultLayout from '../../layout/DefaultLayout';

const PenerimaanBarangJadiPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang FG &gt; Penerimaan Barang Jadi
        </p>
        <IncomingBarangJadi />
      </>
    </DefaultLayout>
  );
};

export default PenerimaanBarangJadiPage;
