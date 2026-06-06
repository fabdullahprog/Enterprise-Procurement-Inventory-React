// src/components/requisitions/RequisitionList.tsx
import React from 'react';
import { PurchaseRequisition } from '../../types';
import '../styles/requisition-list.css';

interface RequisitionListProps {
  requisitions: PurchaseRequisition[];
  onSelectRequisition: (id: number) => void;
  onRefresh: () => void;
  isDeptHead?: boolean;
  showApprovalColumn?: boolean;
}

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'status-pending';
    case 'deptheadapproved':
      return 'status-approved';
    case 'deptheadrejected':
      return 'status-rejected';
    case 'rfqcreated':
      return 'status-rfq';
    case 'pocreated':
      return 'status-po';
    case 'cancelled':
      return 'status-cancelled';
    default:
      return 'status-default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const RequisitionList: React.FC<RequisitionListProps> = ({
  requisitions,
  onSelectRequisition,
  onRefresh,
  isDeptHead,
  showApprovalColumn
}) => {
  return (
    <div className="requisition-list">
      <div className="list-header">
        <h2>Requisitions</h2>
        <button className="refresh-btn" onClick={onRefresh}>
          ↻ Refresh
        </button>
      </div>

      {requisitions.length === 0 ? (
        <div className="empty-state">
          <p>No requisitions found</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="requisitions-table">
            <thead>
              <tr>
                <th>Req. #</th>
                <th>Department</th>
                <th>Date</th>
                <th>Required By</th>
                <th>Status</th>
                {showApprovalColumn && <th>Action</th>}
                <th>Items</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((req) => (
                <tr key={req.id} className="requisition-row">
                  <td className="req-number">
                    <strong>{req.requisitionNumber}</strong>
                  </td>
                  <td>{req.departmentName}</td>
                  <td>{formatDate(req.requisitionDate)}</td>
                  <td>{formatDate(req.requiredByDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  {showApprovalColumn && (
                    <td>
                      {req.status === 'Pending' && (
                        <span className="approval-pending">Pending Your Review</span>
                      )}
                      {req.status === 'Approved' && (
                        <span className="approval-approved">✓ Approved by You</span>
                      )}
                    </td>
                  )}
                  <td className="items-count">{req.items?.length || 0} items</td>
                  <td className="action-cell">
                    <button
                      className="view-btn"
                      onClick={() => onSelectRequisition(req.id)}
                      title="View Details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequisitionList;
