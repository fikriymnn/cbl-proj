import React, { useState } from 'react';
import POApprovalListPage from '../Purchasing/POApprovalListPage';
import PurchasingApprovalCancelPO from '../Purchasing/PurchasingApprovalCancelPO';

type FinanceTab = 'po' | 'cancel_po';

const FINANCE_TAB_LABEL: Record<FinanceTab, string> = {
  po: 'Approval PO',
  cancel_po: 'Approval Cancel PO',
};

// Finance approval page — now split into two tabs:
//
// - "Approval PO": tickets waiting for Finance approval on the normal PO
//   flow (status_tiket = "request finance"). Approve -> PUT
//   /purchasing/purchaseOrder/approveFinance/:idPo (moves the ticket to
//   status_tiket "proses"). Reject -> PUT
//   /purchasing/purchaseOrder/rejectFinance/:idPo (sends the ticket back to
//   status_tiket "draft" for the requester to edit). This tab also exposes
//   its own Menunggu Approval / Riwayat sub-tabs, see POApprovalListPage.
//
// - "Approval Cancel PO": pengajuan cancel PO raised from Purchasing
//   Monitoring PO's "Ajukan Cancel PO" action
//   (POST /purchasing/requestCancelpurchaseOrder). Approve/Reject go
//   through their own endpoints — see PurchasingApprovalCancelPO.
const POApprovalFinance: React.FC = () => {
  const [tab, setTab] = useState<FinanceTab>('po');

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(Object.keys(FINANCE_TAB_LABEL) as FinanceTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {FINANCE_TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === 'po' ? (
        <POApprovalListPage role="finance" />
      ) : (
        <PurchasingApprovalCancelPO />
      )}
    </div>
  );
};

export default POApprovalFinance;
