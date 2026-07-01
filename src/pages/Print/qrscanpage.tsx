import PrintQRPhoto from '../../components/Tables/Print/Printqrphoto';
import DefaultLayout from '../../layout/DefaultLayout';

const QRScanPage = () => {
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
        Print &gt; QR Scan
      </p>
      <PrintQRPhoto />
    </DefaultLayout>
  );
};

export default QRScanPage;
