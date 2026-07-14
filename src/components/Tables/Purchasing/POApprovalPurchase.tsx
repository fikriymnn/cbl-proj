import React from 'react';
import POApprovalListPage from './POApprovalListPage';

// PO tickets waiting for Kabag approval (status_tiket = "request kabag").
// Approve -> PUT /purchasing/purchaseOrder/approveKabag/:idPo
// Reject  -> PUT /purchasing/purchaseOrder/rejectKabag/:idPo   (sends the
//            ticket back to status_tiket "draft" for the requester to edit)
const POApprovalPurchase: React.FC = () => {
  return <POApprovalListPage role="kabag" />;
};

export default POApprovalPurchase;
