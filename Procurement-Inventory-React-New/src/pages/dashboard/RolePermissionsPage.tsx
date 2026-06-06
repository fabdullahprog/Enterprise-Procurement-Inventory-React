import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import './role-permissions.css';

const CONTROLLERS = [
  { label: 'Order', key: 'order' },
  { label: 'Product', key: 'product' },
  { label: 'ProductCategory', key: 'productcategory' },
];

const ACTIONS = ['view', 'details', 'create', 'edit', 'delete'];

const RolePermissionsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const roleName = decodeURIComponent(params.roleName || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getRolePermissions(roleName);
      setAllPermissions(data.allPermissions || []);
      setSelected(new Set(data.permissions || []));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!roleName) return;
    loadPermissions();
  }, [roleName]);

  const toggle = (permission: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });
  };

  const matrixPermission = (controllerKey: string, action: string) => `${controllerKey}:${action}`;

  const matrixKeys = useMemo(
    () =>
      CONTROLLERS.flatMap(c => ACTIONS.map(a => matrixPermission(c.key, a))),
    []
  );

  const additionalPermissions = useMemo(
    () => allPermissions.filter(p => !matrixKeys.includes(p)),
    [allPermissions, matrixKeys]
  );

  const save = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminApi.setRolePermissions(roleName, Array.from(selected.values()));
      alert('Permissions saved successfully');
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-enter">Loading permissions...</div>;
  }

  return (
    <div className="rp-page page-enter">
      <div className="rp-top-line" />
      <h1 className="rp-title">
        Manage Permissions for Role:
        <span className="rp-role-chip">{roleName}</span>
      </h1>
      <div className="rp-divider" />

      {error && <div className="rp-error">{error}</div>}

      <div className="rp-panel">
        <div className="rp-panel-title">Controller Permissions</div>
        <div className="rp-panel-body">
          <p className="rp-hint">Select which actions this role can perform on each controller.</p>
          <div className="bg-white rounded-lg border-[0.5px] border-slate-200 overflow-hidden mt-2">
            <div className="w-full overflow-x-auto relative">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider w-12">SL</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">View</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Create</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Edit</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CONTROLLERS.map((ctrl, index) => (
                    <tr key={ctrl.key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-[13px] text-slate-500">{index + 1}</td>
                      <td className="px-3 py-2.5 text-[13px] text-slate-800 font-medium whitespace-nowrap">{ctrl.label}</td>
                      {ACTIONS.map((action) => {
                        const p = matrixPermission(ctrl.key, action);
                        return (
                          <td key={action} className="px-3 py-2.5 text-center">
                            <input 
                              type="checkbox" 
                              checked={selected.has(p)} 
                              onChange={() => toggle(p)} 
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rp-extra-block">
            <div className="rp-extra-title">Additional Permissions:</div>
            <div className="rp-extra-grid">
              {additionalPermissions.length === 0 && <span className="rp-muted">No additional permissions configured</span>}
              {additionalPermissions.map((p) => (
                <label key={p} className="rp-extra-item">
                  <input type="checkbox" checked={selected.has(p)} onChange={() => toggle(p)} />
                  <span>{p.replace(':', ' - ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rp-actions">
        <button className="rp-btn rp-btn-save" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
        <button className="rp-btn rp-btn-back" onClick={() => navigate('/dashboard/role-manager')}>
          Back to Role Manager
        </button>
      </div>
    </div>
  );
};

export default RolePermissionsPage;

