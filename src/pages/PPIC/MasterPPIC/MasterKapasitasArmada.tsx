import React from 'react';
import DefaultLayout from '../../../layout/DefaultLayout';
import TabMasterKapasitasArmada from '../../../components/Tables/PPIC/MasterDataPPIC/TabMasterKapasitasArmada';

function MasterKapasitasArmada() {
  return (
    <DefaultLayout>
      <>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          PPIC {'>'} Master Data Kapasitas Armada
        </p>
        <TabMasterKapasitasArmada />
      </>
    </DefaultLayout>
  );
}

export default MasterKapasitasArmada;
