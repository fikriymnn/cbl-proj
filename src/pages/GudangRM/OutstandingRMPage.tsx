import React, { useState, SyntheticEvent } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import OutstandingPO from '../../components/Tables/GudangRM/OutstandingPO';
import OutstandingStock from '../../components/Tables/GudangRM/OutstandingStock';
import DefaultLayout from '../../layout/DefaultLayout';

/* =============================================================================
 * OutstandingPage — 2-tab shell: "Outstanding PO" (unchanged, existing
 * OutstandingPO component) and "Outstanding Stock" (new). Each tab keeps
 * its own component mounted only while active, so switching tabs doesn't
 * carry state (selection, expanded rows, filters) across between them.
 * ========================================================================== */
const OutstandingRMPage: React.FC = () => {
  const [tab, setTab] = useState<number>(0);

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <DefaultLayout>
      <div>
        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Gudang RM &gt; Tambah Bahan
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-2 mb-5">
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Outstanding PO" />
            <Tab label="Outstanding Stock" />
          </Tabs>
        </div>

        {tab === 0 && <OutstandingPO />}
        {tab === 1 && <OutstandingStock />}
      </div>
    </DefaultLayout>
  );
};

export default OutstandingRMPage;
