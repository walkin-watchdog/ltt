import { createContext, useContext, useEffect, useState } from 'react';
import { isTokenExpired, isTokenNearExpiry } from '../utils/auth';
import { useCallback, type ReactNode, } from 'react';
import type { AuthContextType, User } from '@/types';



const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'admin_token';

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

  const logout = useCallback(async () => {
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
  }, []);;

  useEffect(() => {
    const bc = new BroadcastChannel('token_refresh');
    bc.onmessage = ({ data }) => {
      if (data.type === 'TOKEN_REFRESHED') {
        const fresh = sessionStorage.getItem(TOKEN_KEY);
        if (fresh) {
          setToken(fresh);
        }
      }
    };
    return () => bc.close();
  }, []);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    let mounted = true;

    const interval = setInterval(async () => {
      if (!token || isTokenExpired(token)) {
        return;
      }

      if (isTokenNearExpiry(token, 5)) {
        let attempts = 0;
        const maxAttempts = 3;
        const baseDelay = 1000;

        const attemptRefresh = async (): Promise<void> => {
          try {
            const res = await fetch(`${API}/auth/refresh`, {
              method: 'POST',
              credentials: 'include',
            });
            if (!res.ok) throw new Error('refresh_failed');
            const { access } = await res.json();
            if (!mounted) return;
            setToken(access);
            sessionStorage.setItem(TOKEN_KEY, access);
            // let other tabs know
            new BroadcastChannel('token_refresh').postMessage({ type: 'TOKEN_REFRESHED' });
          } catch (err) {
            if (++attempts < maxAttempts) {
              await new Promise((r) => setTimeout(r, baseDelay * 2 ** attempts));
              return attemptRefresh();
            }
            console.error('Max refresh attempts reached', err);
            logout();
          }
        };

        attemptRefresh();
      }
    }, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token, logout]);

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
      if (res.status === 401 && !String(input).endsWith('/auth/refresh')) {
        const r = await rawFetch(`${API}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (r.ok) {
          const { access } = await r.json();
          setToken(access);
          sessionStorage.setItem(TOKEN_KEY, access);
          const bc = new BroadcastChannel('token_refresh');
          bc.postMessage({ type: 'TOKEN_REFRESHED' });
          bc.close();
          res = await doFetch({ headers: { Authorization: `Bearer ${access}` } });
          if (res.status !== 401) return res;
        }
        await logout();
      }
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