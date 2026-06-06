// src/pages/dashboard/RequisitionDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RequisitionDetail from '../../components/requisitions/RequisitionDetail';

const RequisitionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { roles } = useAuth();

  const requisitionId = id ? parseInt(id) : 0;
  const isDeptHead = roles.some(r => ['DepartmentHead', 'Admin'].includes(r));
  const isPurchaseManager = roles.some(r => ['PurchaseManager', 'PurchaseOfficer', 'Admin'].includes(r));

  const handleBack = () => {
    navigate('/dashboard/requisitions');
  };

  if (!requisitionId || isNaN(requisitionId)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Invalid Requisition ID</h2>
        <button onClick={handleBack} style={{ marginTop: '20px' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <RequisitionDetail
      requisitionId={requisitionId}
      onBack={handleBack}
      isDeptHead={isDeptHead}
      isPurchaseManager={isPurchaseManager}
    />
  );
};

export default RequisitionDetailPage;
