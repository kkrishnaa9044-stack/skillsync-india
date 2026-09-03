import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService, type AuthUser } from '@/services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  loginDemo: () => { success: boolean; message: string };
  register: (name: string, email: string, password: string, role: AuthUser['role']) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>) => { success: boolean; message: string };
  resetPassword: (email: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const handler = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = authService.loginUser(email, password);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, message: result.message };
  }, []);

  const loginDemo = useCallback(() => {
    const result = authService.loginDemo();
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, message: result.message };
  }, []);

  const register = useCallback((name: string, email: string, password: string, role: AuthUser['role']) => {
    const result = authService.registerUser(name, email, password, role);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, message: result.message };
  }, []);

  const logout = useCallback(() => {
    authService.logoutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>) => {
    const result = authService.updateUser(updates);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, message: result.message };
  }, []);

  const resetPassword = useCallback((email: string) => {
    return authService.resetPassword(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        loginDemo,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
