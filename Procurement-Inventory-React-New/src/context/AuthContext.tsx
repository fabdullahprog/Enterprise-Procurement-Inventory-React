// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { loginUser, logoutUser, registerUser } from '../api/authApi';
import {
  AuthContextType,
  UserInfo,
  LoginResponse,
  RegisterResponse,
} from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser]   = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // App start এ localStorage থেকে restore
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    const savedRoles = localStorage.getItem('roles');
    const savedPermissions = localStorage.getItem('permissions');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser) as UserInfo);
      setRoles(JSON.parse(savedRoles ?? '[]') as string[]);
      setPermissions(JSON.parse(savedPermissions ?? '[]') as string[]);
    }
    setLoading(false);
  }, []);

  // ---- Login ----
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse> => {
    const data = await loginUser({ email, password });

    const userInfo: UserInfo = {
      id:    data.userId,
      email: data.email,
      departmentId: data.departmentId ?? null,
      departmentName: data.departmentName ?? null,
    };

    setToken(data.token);
    setUser(userInfo);
    setRoles(data.roles ?? []);
    setPermissions(data.permissions ?? []);

    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(userInfo));
    localStorage.setItem('roles', JSON.stringify(data.roles ?? []));
    localStorage.setItem('permissions', JSON.stringify(data.permissions ?? []));

    return data;
  }, []);

  // ---- Register ----
  const register = useCallback(
    async (email: string, password: string, confirmPassword: string): Promise<RegisterResponse> => {
      return await registerUser({ email, password, confirmPassword });
    },
    []
  );

  // ---- Logout ----
  const logout = useCallback(async (): Promise<void> => {
    try { await logoutUser(); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermissions([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
  }, []);

  // ---- Role check ----
  const hasRole = useCallback((role: string): boolean => {
    return roles.includes(role);
  }, [roles]);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions.includes(permission);
  }, [permissions]);

  const value: AuthContextType = {
    user,
    token,
    roles,
    permissions,
    loading,
    isAdmin: roles.includes('Admin'),
    isAuthenticated: !!token,
    login,
    register,
    logout,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
