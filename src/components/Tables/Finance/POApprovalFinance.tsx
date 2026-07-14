import React from 'react';
import POApprovalListPage from '../Purchasing/POApprovalListPage';

// PO tickets waiting for Finance approval (status_tiket = "request finance").
// Approve -> PUT /purchasing/purchaseOrder/approveFinance/:idPo  (moves the
//            ticket to status_tiket "proses")
// Reject  -> PUT /purchasing/purchaseOrder/rejectFinance/:idPo   (sends the
//            ticket back to status_tiket "draft" for the requester to edit)
const POApprovalFinance: React.FC = () => {
  return <POApprovalListPage role="finance" />;
};

export default POApprovalFinance;
