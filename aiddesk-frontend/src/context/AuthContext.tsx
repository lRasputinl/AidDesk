import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { LoginDTO, RegisterDTO } from '../types';
import { Role } from '../types';
import authService from '../api/authService';
import userService from '../api/userService';
import { decodeToken, isTokenExpired } from '../utils/jwt';
import type { DecodedUser } from '../utils/jwt';

// ─── Types ───

interface AuthState {
  token: string | null;
  user: DecodedUser | null;
  displayEmail: string;
  displayName: string;
  isAuthenticated: boolean;
  isSupport: boolean;
  isClient: boolean;
  isManager: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
  refreshDisplayEmail: (newEmail: string) => void;
  refreshDisplayName: (newName: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('token');
    if (stored && !isTokenExpired(stored)) return stored;
    localStorage.removeItem('token');
    return null;
  });

  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  const [displayEmail, setDisplayEmail] = useState<string>(() => {
    const stored = localStorage.getItem('token');
    if (stored && !isTokenExpired(stored)) {
      return decodeToken(stored)?.email ?? '';
    }
    return '';
  });

  const [displayName, setDisplayName] = useState<string>('');


  useEffect(() => {
    if (token && !displayName) {
      userService.getMe()
        .then((profile) => {
          setDisplayName(`${profile.firstName} ${profile.lastName}`);
        })
        .catch(() => {/* non-critical */});
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setDisplayEmail(decodeToken(token)?.email ?? '');
    } else {
      localStorage.removeItem('token');
      setDisplayEmail('');
      setDisplayName('');
    }
  }, [token]);

  const login = useCallback(async (data: LoginDTO) => {
    const response = await authService.login(data);
    localStorage.setItem('token', response.token);
    setToken(response.token);

    try {
      const profile = await userService.getMe();
      setDisplayName(`${profile.firstName} ${profile.lastName}`);
    } catch {

    }
  }, []);

  const register = useCallback(async (data: RegisterDTO) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const refreshDisplayEmail = useCallback((newEmail: string) => {
    setDisplayEmail(newEmail);
  }, []);

  const refreshDisplayName = useCallback((newName: string) => {
    setDisplayName(newName);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      displayEmail,
      displayName,
      isAuthenticated: !!user,
      isSupport: user?.role === Role.Support,
      isClient: user?.role === Role.Client,
      isManager: user?.role === Role.Manager,
      isAdmin: user?.role === Role.Admin,
      login,
      register,
      logout,
      refreshDisplayEmail,
      refreshDisplayName,
    }),
    [token, user, displayEmail, displayName, login, register, logout, refreshDisplayEmail, refreshDisplayName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
