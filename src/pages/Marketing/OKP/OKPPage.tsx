import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import OKPMarketing from '../../../components/Tables/Marketing/OKP/OKPMarketing';

function OKPPage() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          OKP
        </p>
        <OKPMarketing />
      </>
    </DefaultLayout>
  );
}

export default OKPPage;
