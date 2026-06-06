// src/pages/dashboard/UserManagementPage.tsx
import { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { UserResponseDto } from '../../types';
import './user-management.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllUsers();
      setUsers(response.data || response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
                       user.roles?.some(role => role.toLowerCase() === filterRole.toLowerCase());
    
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const allRoles = Array.from(new Set(users.flatMap(u => u.roles || [])));

  // Get role badge color
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'role-admin',
      'manager': 'role-manager',
      'departmenthead': 'role-dept-head',
      'purchaseofficer': 'role-purchase',
      'purchasemanager': 'role-purchase-mgr',
      'employee': 'role-employee',
    };
    return colors[role.toLowerCase()] || 'role-default';
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    const icons: { [key: string]: string } = {
      'admin': '👑',
      'manager': '💼',
      'departmenthead': '🎯',
      'purchaseofficer': '📦',
      'purchasemanager': '🛒',
      'employee': '👤',
    };
    return icons[role.toLowerCase()] || '👤';
  };

  if (loading) {
    return (
      <div className="user-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-page">
        <div className="error-container">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={loadUsers} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-page page-enter">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View all users and their assigned roles</p>
        </div>
        <button onClick={loadUsers} className="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(79, 142, 247, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f8ef7" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Admins</span>
            <span className="stat-value">{users.filter(u => u.roles?.includes('Admin')).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Managers</span>
            <span className="stat-value">{users.filter(u => u.roles?.includes('Manager')).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 146, 60, 0.1)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Employees</span>
            <span className="stat-value">{users.filter(u => u.roles?.includes('Employee')).length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="role-filter">
          <label>Filter by Role:</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            {allRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>No users found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden">
          <div className="w-full overflow-x-auto relative">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left">User</th>
                  <th className="px-3 py-2.5 text-left">Email</th>
                  <th className="px-3 py-2.5 text-left">Department</th>
                  <th className="px-3 py-2.5 text-left">Roles</th>
                  <th className="px-3 py-2.5 text-center">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                          {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-900 text-[13px] truncate">{user.fullName || 'N/A'}</span>
                          <span className="text-slate-500 text-[11px]">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 whitespace-nowrap">
                        {user.departmentName || 'No Department'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map(role => (
                            <span key={role} className={`role-badge ${getRoleColor(role)} whitespace-nowrap`}>
                              <span className="role-icon">{getRoleIcon(role)}</span>
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-xs italic">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">
                      {new Date(user.createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
