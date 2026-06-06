// src/components/requisitions/RequisitionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requisitionApi } from '../../api/requisitionApi';
import { PurchaseRequisition } from '../../types';
import RequisitionList from './RequisitionList';
import CreateRequisitionForm from './CreateRequisitionForm';
import RequisitionDetail from './RequisitionDetail';
import '../styles/requisition-dashboard.css';

type ViewMode = 'list' | 'create' | 'detail' | 'pending-approvals';

interface DashboardState {
  view: ViewMode;
  selectedRequisitionId?: number;
  requisitions: PurchaseRequisition[];
  pendingApprovals: PurchaseRequisition[];
  loading: boolean;
  error?: string;
}

export const RequisitionDashboard: React.FC = () => {
  const { roles, hasPermission, isAdmin } = useAuth();
  const [state, setState] = useState<DashboardState>({
    view: 'list',
    requisitions: [],
    pendingApprovals: [],
    loading: true
  });

  // Check user roles
  const isEmployee = true; // All authenticated users
  const isDeptHead = roles?.includes('DepartmentHead');
  const isPurchaseManager = roles?.includes('PurchaseManager');
  const canCreateRequisition = isAdmin || hasPermission('requisition:create') || hasPermission('requisition:manage');

  useEffect(() => {
    loadRequisitions();
  }, [state.view]);

  const loadRequisitions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: undefined }));
      
      if (state.view === 'pending-approvals' && isDeptHead) {
        const data = await requisitionApi.getPendingApprovals();
        setState(prev => ({ 
          ...prev, 
          pendingApprovals: data.items || data,
          loading: false 
        }));
      } else if (state.view === 'list') {
        const data = await requisitionApi.getMyRequisitions();
        setState(prev => ({ 
          ...prev, 
          requisitions: data.items || data,
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load requisitions',
        loading: false 
      }));
    }
  };

  const handleCreateSuccess = () => {
    setState(prev => ({ ...prev, view: 'list' }));
    loadRequisitions();
  };

  const handleViewDetail = (id: number) => {
    setState(prev => ({ ...prev, view: 'detail', selectedRequisitionId: id }));
  };

  const handleBackToList = () => {
    setState(prev => ({ ...prev, view: 'list' }));
    loadRequisitions();
  };

  const handleRefresh = () => {
    loadRequisitions();
  };

  return (
    <div className="requisition-dashboard">
      <header className="dashboard-header">
        <h1>Requisition Management</h1>
        <nav className="dashboard-nav">
          {isEmployee && (
            <button 
              className={`nav-btn ${state.view === 'list' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, view: 'list' }))}
            >
              My Requisitions
            </button>
          )}
          
          {isEmployee && (
            <button 
              className={`nav-btn ${state.view === 'create' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, view: 'create' }))}
              disabled={!canCreateRequisition}
              title={!canCreateRequisition ? 'No permission' : undefined}
            >
              Create Requisition
            </button>
          )}

          {isDeptHead && (
            <button 
              className={`nav-btn ${state.view === 'pending-approvals' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, view: 'pending-approvals' }))}
            >
              Pending Approvals ({state.pendingApprovals.length})
            </button>
          )}

          {isPurchaseManager && (
            <button 
              className={`nav-btn ${state.view === 'list' ? 'active' : ''}`}
              onClick={() => setState(prev => ({ ...prev, view: 'list' }))}
            >
              All Requisitions
            </button>
          )}
        </nav>
      </header>

      <main className="dashboard-content">
        {state.error && (
          <div className="error-alert">
            {state.error}
            <button onClick={() => setState(prev => ({ ...prev, error: undefined }))}>×</button>
          </div>
        )}

        {state.loading && <div className="loading">Loading...</div>}

        {!state.loading && state.view === 'list' && (
          <RequisitionList 
            requisitions={state.requisitions}
            onSelectRequisition={handleViewDetail}
            onRefresh={handleRefresh}
            isDeptHead={isDeptHead}
          />
        )}

        {!state.loading && state.view === 'create' && (
          <CreateRequisitionForm onSuccess={handleCreateSuccess} />
        )}

        {!state.loading && state.view === 'detail' && state.selectedRequisitionId && (
          <RequisitionDetail 
            requisitionId={state.selectedRequisitionId}
            onBack={handleBackToList}
            isDeptHead={isDeptHead}
            isPurchaseManager={isPurchaseManager}
          />
        )}

        {!state.loading && state.view === 'pending-approvals' && (
          <RequisitionList 
            requisitions={state.pendingApprovals}
            onSelectRequisition={handleViewDetail}
            onRefresh={handleRefresh}
            isDeptHead={isDeptHead}
            showApprovalColumn
          />
        )}
      </main>
    </div>
  );
};

export default RequisitionDashboard;
