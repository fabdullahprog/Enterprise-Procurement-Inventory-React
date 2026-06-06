// src/pages/UnauthorizedPage.tsx
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Access Denied</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>আপনার এই page দেখার permission নেই।</p>
      <button className="btn btn-ghost" style={{ width: 'auto', marginTop: 8 }} onClick={() => navigate('/dashboard')}>
        Dashboard এ ফিরুন
      </button>
    </div>
  );
};

export default UnauthorizedPage;
