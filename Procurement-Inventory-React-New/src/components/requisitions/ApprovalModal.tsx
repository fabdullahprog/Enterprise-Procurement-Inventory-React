// src/components/requisitions/ApprovalModal.tsx
import React, { useState } from 'react';
import '../styles/approval-modal.css';

interface ApprovalModalProps {
  action: 'approve' | 'reject' | null;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onClose: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  action,
  onApprove,
  onReject,
  onClose
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleApprove = async () => {
    try {
      setLoading(true);
      await onApprove(notes);
      setNotes('');
      setError(undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    try {
      setLoading(true);
      await onReject(notes);
      setNotes('');
      setError(undefined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!action) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h3>
          {action === 'approve' ? 'Approve Requisition' : 'Reject Requisition'}
        </h3>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError(undefined)}>×</button>
          </div>
        )}

        <div className="form-group">
          <label>
            {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              action === 'approve'
                ? 'Add any approval notes...'
                : 'Please provide a reason for rejection...'
            }
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
            onClick={action === 'approve' ? handleApprove : handleReject}
            disabled={loading}
          >
            {loading ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Reject')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
