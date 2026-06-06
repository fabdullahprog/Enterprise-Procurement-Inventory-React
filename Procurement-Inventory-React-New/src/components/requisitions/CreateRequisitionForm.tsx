// src/components/requisitions/CreateRequisitionForm.tsx
import React, { useState, useEffect } from 'react';
import { requisitionApi } from '../../api/requisitionApi';
import { masterDataApi } from '../../api/masterDataApi';
import { Department, Product, CreateRequisitionRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import '../styles/create-requisition-form.css';

interface RequisitionFormItem {
  productId: number;
  productName?: string;
  requiredQuantity: number;
  remarks?: string;
}

interface CreateRequisitionFormProps {
  onSuccess: () => void;
}

const CreateRequisitionForm: React.FC<CreateRequisitionFormProps> = ({ onSuccess }) => {
  const { user, hasPermission, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const canManageRequisitions = isAdmin || hasPermission('requisition:manage');
  const canCreateRequisition = isAdmin || hasPermission('requisition:create') || hasPermission('requisition:manage');
  const userDepartmentId = user?.departmentId ?? null;

  const [formData, setFormData] = useState({
    departmentId: userDepartmentId ?? 0,
    requiredByDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [] as RequisitionFormItem[]
  });

  const [newItem, setNewItem] = useState<RequisitionFormItem>({
    productId: 0,
    requiredQuantity: 1,
    remarks: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // If user is not allowed to change department, force it to their own dept.
    if (!canManageRequisitions && userDepartmentId) {
      setFormData(prev => ({ ...prev, departmentId: userDepartmentId }));
    }
  }, [canManageRequisitions, userDepartmentId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [deptData, prodData] = await Promise.all([
        masterDataApi.getDepartments(),
        masterDataApi.getProducts()
      ]);
      setDepartments(deptData || []);
      setProducts(prodData.items || prodData || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.productId || newItem.requiredQuantity <= 0) {
      setError('Please select product and enter valid quantity');
      return;
    }

    const product = products.find(p => p.id === newItem.productId);
    const itemToAdd: RequisitionFormItem = {
      ...newItem,
      productName: product?.name
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, itemToAdd]
    }));

    setNewItem({
      productId: 0,
      requiredQuantity: 1,
      remarks: ''
    });
    setError(undefined);
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateRequisition) {
      setError('You do not have permission to create requisition. Please contact Admin.');
      return;
    }

    if (!formData.departmentId || formData.items.length === 0) {
      setError('Please select department and add at least one item');
      return;
    }

    try {
      setLoading(true);
      setError(undefined);

      const requestData: CreateRequisitionRequest = {
        departmentId: formData.departmentId,
        requiredByDate: formData.requiredByDate,
        notes: formData.notes || undefined,
        items: formData.items.map(item => ({
          productId: item.productId,
          requiredQuantity: item.requiredQuantity,
          remarks: item.remarks || undefined
        }))
      };

      const response = await requisitionApi.createRequisition(requestData);
      
      // Backend returns: { message, id, number }
      const requisitionNumber = response?.number || response?.requisitionNumber || response?.data?.number;
      setSuccess(`Requisition ${requisitionNumber || 'created'} successfully!`);
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create requisition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-requisition-form">
      <h2>Create Purchase Requisition</h2>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(undefined)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Department *</label>
            <select
              value={formData.departmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, departmentId: parseInt(e.target.value) }))}
              required
              disabled={!canManageRequisitions}
            >
              <option value={0}>Select Department</option>
              {departments.map(dept => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
            {!canManageRequisitions && (
              <small style={{ display: 'block', marginTop: 6, opacity: 0.8 }}>
                Department is locked to your account.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Required By Date *</label>
            <input
              type="date"
              value={formData.requiredByDate}
              onChange={(e) => setFormData(prev => ({ ...prev, requiredByDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions or notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Items</h3>

          <div className="add-item-section">
            <div className="form-row">
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={newItem.productId}
                  onChange={(e) => setNewItem(prev => ({ ...prev, productId: parseInt(e.target.value) }))}
                >
                  <option value={0}>Select Product</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Stock: {prod.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={newItem.requiredQuantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, requiredQuantity: parseInt(e.target.value) || 1 }))}
                  min={1}
                  required
                />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <input
                  type="text"
                  value={newItem.remarks}
                  onChange={(e) => setNewItem(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Optional remarks..."
                />
              </div>

              <div className="form-group">
                <button
                  type="button"
                  className="add-item-btn"
                  onClick={handleAddItem}
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {formData.items.length > 0 && (
            <div className="items-list">
              <h4>Selected Items:</h4>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>
                        <input
                          type="number"
                          value={item.requiredQuantity}
                          onChange={(e) => handleUpdateItem(index, 'requiredQuantity', parseInt(e.target.value))}
                          min={1}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.remarks || ''}
                          onChange={(e) => handleUpdateItem(index, 'remarks', e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Requisition'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequisitionForm;
