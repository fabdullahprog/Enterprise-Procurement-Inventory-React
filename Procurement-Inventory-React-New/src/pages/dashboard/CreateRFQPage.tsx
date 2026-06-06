// src/pages/dashboard/CreateRFQPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requisitionApi } from '../../api/requisitionApi';
import { PurchaseRequisition } from '../../types';
import './create-rfq.css';

interface ValidationErrors {
  deadline?: string;
  notes?: string;
}

const CreateRFQPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [requisition, setRequisition] = useState<PurchaseRequisition | null>(null);
  const [quotationDeadline, setQuotationDeadline] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const requisitionId = Number(id);
      const requisitionData = await requisitionApi.getRequisitionById(requisitionId);

      if (requisitionData.status !== 'Approved') {
        setError('RFQ can only be created for approved requisitions');
        setLoading(false);
        return;
      }

      setRequisition(requisitionData);
      
      // Set default deadline to 7 days from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      setQuotationDeadline(defaultDeadline.toISOString().split('T')[0]);
      
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load data');
      setLoading(false);
    }
  };

  const handleSupplierToggle = (supplierId: number) => {
    // Removed - not needed anymore
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate deadline
    if (!quotationDeadline) {
      errors.deadline = 'Quotation deadline is required';
    } else {
      const deadline = new Date(quotationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 90);

      if (deadline <= today) {
        errors.deadline = 'Deadline must be at least 1 day in the future';
      } else if (deadline > maxDate) {
        errors.deadline = 'Deadline cannot exceed 90 days from today';
      }
    }

    // Validate notes length
    if (notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await requisitionApi.createRFQFromRequisition(
        Number(id),
        quotationDeadline,
        notes || undefined
      );

      navigate('/dashboard/approved-requisitions', {
        state: { message: 'RFQ created successfully' }
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create RFQ');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/approved-requisitions');
  };

  if (loading) {
    return (
      <div className="create-rfq-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !requisition) {
    return (
      <div className="create-rfq-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={handleCancel} className="btn btn-secondary">
            Back to Approved Requisitions
          </button>
        </div>
      </div>
    );
  }

  if (!requisition) {
    return null;
  }

  return (
    <div className="create-rfq-page">
      <div className="page-header">
        <h1>Create Request for Quotation (RFQ)</h1>
        <p className="page-subtitle">Send RFQ to suppliers for requisition #{requisition.requisitionNumber}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="rfq-content">
        {/* Requisition Summary */}
        <div className="requisition-summary-card">
          <h2>Requisition Details</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Requisition Number:</span>
              <span className="value">{requisition.requisitionNumber}</span>
            </div>
            <div className="summary-item">
              <span className="label">Department:</span>
              <span className="value">{requisition.departmentName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Requested By:</span>
              <span className="value">{requisition.requestedByName || requisition.requestedByEmail}</span>
            </div>
            <div className="summary-item">
              <span className="label">Request Date:</span>
              <span className="value">{new Date(requisition.requisitionDate).toLocaleDateString()}</span>
            </div>
            <div className="summary-item">
              <span className="label">Status:</span>
              <span className={`status-badge status-${requisition.status.toLowerCase()}`}>
                {requisition.status}
              </span>
            </div>
          </div>

          <div className="items-section">
            <h3>Items ({requisition.items?.length || 0})</h3>
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {requisition.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.requiredQuantity}</td>
                      <td>{item.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RFQ Form */}
        <form onSubmit={handleSubmit} className="rfq-form-card">
          <h2>RFQ Details</h2>

          {/* Quotation Deadline */}
          <div className="form-group">
            <label htmlFor="deadline" className="form-label required">
              Quotation Deadline
            </label>
            {validationErrors.deadline && (
              <p className="error-text">{validationErrors.deadline}</p>
            )}
            <input
              type="date"
              id="deadline"
              value={quotationDeadline}
              onChange={(e) => {
                setQuotationDeadline(e.target.value);
                if (validationErrors.deadline) {
                  setValidationErrors(prev => ({ ...prev, deadline: undefined }));
                }
              }}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              disabled={submitting}
              className={validationErrors.deadline ? 'error' : ''}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes (Optional)
              <span className="label-hint">Additional information for suppliers</span>
            </label>
            {validationErrors.notes && (
              <p className="error-text">{validationErrors.notes}</p>
            )}
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (validationErrors.notes) {
                  setValidationErrors(prev => ({ ...prev, notes: undefined }));
                }
              }}
              rows={4}
              maxLength={500}
              placeholder="Enter any special requirements or instructions..."
              disabled={submitting}
              className={validationErrors.notes ? 'error' : ''}
            />
            <p className="char-count">{notes.length}/500 characters</p>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating RFQ...' : 'Create RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRFQPage;
