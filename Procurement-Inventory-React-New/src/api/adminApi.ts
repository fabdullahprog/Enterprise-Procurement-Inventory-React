import axiosInstance from './axiosInstance';

export type AdminRole = { name: string };

export type AdminUser = {
  id: number;
  email: string;
  roles: string[];
  departmentId?: number | null;
  departmentName?: string | null;
};

export type RolePermissions = {
  role: string;
  permissions: string[];
  allPermissions: string[];
};

export const adminApi = {
  // Roles
  getRoles: async (): Promise<AdminRole[]> => {
    const res = await axiosInstance.get('/api/Admin/roles');
    return res.data;
  },
  createRole: async (name: string) => {
    const res = await axiosInstance.post('/api/Admin/roles', { name });
    return res.data;
  },
  renameRole: async (roleName: string, name: string) => {
    const res = await axiosInstance.put(`/api/Admin/roles/${encodeURIComponent(roleName)}`, { name });
    return res.data;
  },
  deleteRole: async (roleName: string) => {
    const res = await axiosInstance.delete(`/api/Admin/roles/${encodeURIComponent(roleName)}`);
    return res.data;
  },

  // Role permissions
  getRolePermissions: async (roleName: string): Promise<RolePermissions> => {
    const res = await axiosInstance.get(`/api/Admin/roles/${encodeURIComponent(roleName)}/permissions`);
    return res.data;
  },
  setRolePermissions: async (roleName: string, permissions: string[]) => {
    const res = await axiosInstance.put(`/api/Admin/roles/${encodeURIComponent(roleName)}/permissions`, {
      permissions,
    });
    return res.data;
  },

  // Users
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await axiosInstance.get('/api/Admin/users');
    return res.data;
  },
  getAllUsers: async () => {
    const res = await axiosInstance.get('/api/Admin/users');
    return res.data;
  },
  setUserRoles: async (userId: number, roles: string[]) => {
    const res = await axiosInstance.put(`/api/Admin/users/${userId}/roles`, { roles });
    return res.data;
  },
  setUserDepartment: async (userId: number, departmentId: number | null) => {
    const res = await axiosInstance.put(`/api/Admin/users/${userId}/department`, { departmentId });
    return res.data;
  },
};

