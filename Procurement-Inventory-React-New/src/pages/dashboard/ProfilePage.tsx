 // src/pages/dashboard/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { UserResponseDto } from '../../types';
import './dashboard.css';

const ProfilePage = () => {
  const { roles } = useAuth();
  const [profile, setProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError]     = useState<string>('');

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const data = await getCurrentUser();
        setProfile(data);
      } catch {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32, borderColor: 'rgba(79,142,247,0.3)', borderTopColor: '#4f8ef7' }} />
    </div>
  );

  if (error) return <div className="alert alert-error" style={{ maxWidth: 400 }}>{error}</div>;

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <div className="profile-card card">
        <div className="profile-avatar-lg">
          {profile?.email?.[0]?.toUpperCase()}
        </div>
        <div className="profile-info">
          <div className="profile-field">
            <span className="pf-label">User ID</span>
            <span className="pf-value mono">#{profile?.id}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Email</span>
            <span className="pf-value">{profile?.email}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Full Name</span>
            <span className="pf-value">{profile?.fullName || '—'}</span>
          </div>
          <div className="profile-field">
            <span className="pf-label">Roles</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {roles.map(r => (
                <span className="role-badge" key={r}>{r}</span>
              ))}
            </div>
          </div>
          <div className="profile-field">
            <span className="pf-label">Member Since</span>
            <span className="pf-value">
              {profile?.createdDate
                ? new Date(profile.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;