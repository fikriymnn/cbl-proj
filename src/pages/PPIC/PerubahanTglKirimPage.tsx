import PPICPerubahanTglKirim from '../../components/Tables/PPIC/PerubahanTanggalKirim/PPICPerubahanTglKirim';
import DefaultLayout from '../../layout/DefaultLayout';

const PerubahanTglKirimPage = () => {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          PPIC &gt; Approval Perubahan Tanggal Kirim
        </p>
        <PPICPerubahanTglKirim />
      </>
    </DefaultLayout>
  );
};

export default PerubahanTglKirimPage;
