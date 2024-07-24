

import QCFullWidthTabs from '../../components/Tables/QualityControl/ValidateAndVerify/QCFullWidthTable';
import DefaultLayout from '../../layout/DefaultLayout';

const QCValidateAndVerify = () => {

  return (
    <DefaultLayout>

      <p className='font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]'>QC &gt; Validasi Dan Verifikasi</p>

      <QCFullWidthTabs />

    </DefaultLayout>
  );
};

export default QCValidateAndVerify;
