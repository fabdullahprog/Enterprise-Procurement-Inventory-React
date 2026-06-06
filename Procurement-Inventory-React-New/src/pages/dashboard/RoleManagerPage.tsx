import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, AdminRole, AdminUser } from '../../api/adminApi';
import { masterDataApi } from '../../api/masterDataApi';
import { Department } from '../../types';
import './role-manager.css';

const RoleManagerPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creatingRoleName, setCreatingRoleName] = useState('');

  const [assignUserId, setAssignUserId] = useState<number>(0);
  const [assignRoleName, setAssignRoleName] = useState<string>('');
  const [assignDepartmentId, setAssignDepartmentId] = useState<number>(0);
  const [listRolesUserId, setListRolesUserId] = useState<number>(0);
  const [removeUserId, setRemoveUserId] = useState<number>(0);
  const [removeRoleName, setRemoveRoleName] = useState<string>('');
  const [listedRoles, setListedRoles] = useState<string[] | null>(null);

  const roleNames = useMemo(() => roles.map(r => r.name).filter(Boolean).sort((a, b) => a.localeCompare(b)), [roles]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [r, u, d] = await Promise.all([adminApi.getRoles(), adminApi.getUsers(), masterDataApi.getDepartments()]);
      setRoles(r || []);
      setUsers(u || []);
      setDepartments(d || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load role manager data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createRole = async () => {
    const name = creatingRoleName.trim();
    if (!name) return;
    try {
      setError(null);
      await adminApi.createRole(name);
      setCreatingRoleName('');
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create role');
    }
  };

  const deleteRole = async (name: string) => {
    if (!confirm(`Delete role "${name}"?`)) return;
    try {
      setError(null);
      await adminApi.deleteRole(name);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete role');
    }
  };

  const addRoleToUser = async () => {
    if (!assignUserId || !assignRoleName) return;
    try {
      setError(null);
      const user = users.find(u => u.id === assignUserId);
      if (!user) return;
      const current = new Set<string>(user.roles || []);
      current.add(assignRoleName);
      await adminApi.setUserRoles(user.id, Array.from(current.values()));
      await loadAll();
      setListedRoles(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to assign role');
    }
  };

  const assignDepartmentToUser = async () => {
    if (!assignUserId) return;
    try {
      setError(null);
      await adminApi.setUserDepartment(assignUserId, assignDepartmentId || null);
      await loadAll();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to assign department');
    }
  };

  const getRolesForUser = () => {
    const user = users.find(u => u.id === listRolesUserId);
    setListedRoles(user?.roles || []);
  };

  const removeRoleFromUser = async () => {
    if (!removeUserId || !removeRoleName) return;
    try {
      setError(null);
      const user = users.find(u => u.id === removeUserId);
      if (!user) return;
      const next = (user.roles || []).filter(r => r !== removeRoleName);
      await adminApi.setUserRoles(user.id, next);
      await loadAll();
      setListedRoles(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to remove role');
    }
  };

  if (loading) {
    return <div className="page-enter">Loading role manager...</div>;
  }

  return (
    <div className="role-manager page-enter">
      <h1 className="rm-page-title">Role Manager</h1>
      {error && <div className="rm-alert rm-alert-error">{error}</div>}

      <div className="rm-layout">
        <div className="rm-left-col">
          <section className="rm-panel">
            <div className="rm-panel-title">Role List</div>
            <div className="rm-panel-body">
              <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-2">
                <div className="w-full overflow-x-auto relative">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Role Name</th>
                        <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roleNames.map((name) => (
                        <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium cell-truncate">{name}</td>
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                className="text-[11px] px-2 py-1 font-medium rounded transition-colors border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                                onClick={() => deleteRole(name)} 
                                disabled={name === 'Admin'}
                              >
                                Delete
                              </button>
                              <button 
                                className="text-[11px] px-2 py-1 font-medium rounded transition-colors border border-slate-200 text-slate-600 hover:bg-slate-50" 
                                onClick={() => navigate(`/dashboard/role-manager/permissions/${encodeURIComponent(name)}`)}
                              >
                                Permissions
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="rm-panel">
            <div className="rm-panel-title">Create New Role</div>
            <div className="rm-panel-body">
              <label className="rm-label">Role Name:</label>
              <input
                className="rm-input"
                value={creatingRoleName}
                onChange={(e) => setCreatingRoleName(e.target.value)}
              />
              <button className="rm-btn rm-btn-dark" onClick={createRole} disabled={!creatingRoleName.trim()}>
                Save
              </button>
            </div>
          </section>
        </div>

        <div className="rm-right-col">
          <section className="rm-panel">
            <div className="rm-panel-title">Add Role to User</div>
            <div className="rm-panel-body">
              <label className="rm-label">User Name:</label>
              <select className="rm-input" value={assignUserId} onChange={(e) => setAssignUserId(parseInt(e.target.value) || 0)}>
                <option value={0}>Select User...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>

              <label className="rm-label">Role Name:</label>
              <select className="rm-input" value={assignRoleName} onChange={(e) => setAssignRoleName(e.target.value)}>
                <option value="">Select Role...</option>
                {roleNames.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <button className="rm-btn rm-btn-dark" onClick={addRoleToUser} disabled={!assignUserId || !assignRoleName}>
                Assign Role
              </button>

              <label className="rm-label">Department:</label>
              <select className="rm-input" value={assignDepartmentId} onChange={(e) => setAssignDepartmentId(parseInt(e.target.value) || 0)}>
                <option value={0}>Select Department...</option>
                {departments.map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
              <button className="rm-btn rm-btn-dark" onClick={assignDepartmentToUser} disabled={!assignUserId}>
                Assign Department
              </button>
            </div>
          </section>

          <section className="rm-panel">
            <div className="rm-panel-title">List Roles for User</div>
            <div className="rm-panel-body">
              <label className="rm-label">Select User:</label>
              <select className="rm-input" value={listRolesUserId} onChange={(e) => setListRolesUserId(parseInt(e.target.value) || 0)}>
                <option value={0}>Select User...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>
              <button className="rm-btn rm-btn-dark" onClick={getRolesForUser} disabled={!listRolesUserId}>
                Get Roles
              </button>
              {listedRoles && (
                <div className="rm-listed-roles">
                  {listedRoles.length > 0 ? listedRoles.join(', ') : 'No roles assigned'}
                </div>
              )}
            </div>
          </section>

          <section className="rm-panel">
            <div className="rm-panel-title">Remove Role from User</div>
            <div className="rm-panel-body">
              <label className="rm-label">User Name:</label>
              <select className="rm-input" value={removeUserId} onChange={(e) => setRemoveUserId(parseInt(e.target.value) || 0)}>
                <option value={0}>Select User...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.email}</option>
                ))}
              </select>

              <label className="rm-label">Role Name:</label>
              <select className="rm-input" value={removeRoleName} onChange={(e) => setRemoveRoleName(e.target.value)}>
                <option value="">Select Role...</option>
                {roleNames.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <button className="rm-btn rm-btn-danger-outline" onClick={removeRoleFromUser} disabled={!removeUserId || !removeRoleName}>
                Remove Role
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RoleManagerPage;

