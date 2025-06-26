import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    sessionStorage.getItem('admin_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = sessionStorage.getItem('admin_token');
      if (savedToken) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/me`, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setToken(savedToken);
          } else {
            sessionStorage.removeItem('admin_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          sessionStorage.removeItem('admin_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Logging in with:', { email, password });
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const { access, user: loggedInUser } = await response.json();
      setUser(loggedInUser);
      setToken(access);
      sessionStorage.setItem('admin_token', access);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/logout`,
        { method: 'POST', credentials: 'include' }
      );
    } catch (_) {
    }
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('admin_token');
  };

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const rawFetch = (window as any).fetch.bind(window);

    (window as any).fetch = async (
      input: RequestInfo | URL,
      init: RequestInit = {}
    ) => {
      const authHdr: HeadersInit | undefined = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const mergeHeaders = (...parts: (HeadersInit | undefined)[]): Headers => {
        const h = new Headers();
        for (const part of parts) {
          if (!part) continue;
          if (part instanceof Headers) {
            part.forEach((v, k) => h.set(k, v));
          } else if (Array.isArray(part)) {
            part.forEach(([k, v]) => h.set(k, v));
          } else {
            Object.entries(part).forEach(([k, v]) => h.set(k, v as string));
          }
        }
        return h;
      };

      const doFetch = (extra: RequestInit = {}) =>
        rawFetch(input, {
          ...init,
          ...extra,
          headers: mergeHeaders(init.headers, authHdr, extra.headers),
          credentials: 'include',
        });

      let res = await doFetch();

      if (res.status !== 401 || String(input).endsWith('/auth/refresh')) return res;

      const r = await rawFetch(`${API}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (r.ok) {
        const { access } = await r.json();
        setToken(access);
        sessionStorage.setItem('admin_token', access);
        res = await doFetch({ headers: { Authorization: `Bearer ${access}` } });
        if (res.status !== 401) return res;
      }

      await logout();
      return res;
    };

    return () => {
      (window as any).fetch = rawFetch;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};