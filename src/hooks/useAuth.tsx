'use client';

// FR-1.4: the access token lives ONLY in memory (a React ref, here) — never
// localStorage/sessionStorage — so an XSS payload running in the page has
// nothing persistent to steal. It's lost on every full page reload by
// design; silentRefresh() transparently re-mints it from the HTTP-only
// refresh cookie, which the browser attaches automatically and JS can never
// read directly.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** fetch() wrapper that attaches the in-memory access token and retries
   *  once via silent refresh if it has expired. Use this for any call to a
   *  protected API route instead of the raw fetch(). */
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessTokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('refresh failed');
      const body: { data?: { accessToken: string; user: AuthUser } } = await res.json();
      if (!body.data) throw new Error('malformed refresh response');
      accessTokenRef.current = body.data.accessToken;
      setUser(body.data.user);
    } catch {
      accessTokenRef.current = null;
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount (i.e. every full page load), try to silently resume the
  // session from the refresh cookie — this is the only way an access token
  // ever gets (re)populated after a reload.
  useEffect(() => {
    void silentRefresh();
  }, [silentRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const body: { success: boolean; error?: string; data?: { accessToken: string; user: AuthUser } } =
      await res.json();

    if (!res.ok || !body.data) {
      throw new Error(body.error ?? 'Login failed');
    }

    accessTokenRef.current = body.data.accessToken;
    setUser(body.data.user);
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    accessTokenRef.current = null;
    setUser(null);
  }, []);

  const fetchWithAuth = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const doFetch = () =>
        fetch(input, {
          ...init,
          credentials: 'include',
          headers: {
            ...(init.headers ?? {}),
            ...(accessTokenRef.current ? { Authorization: `Bearer ${accessTokenRef.current}` } : {}),
          },
        });

      let response = await doFetch();

      // Access token likely expired mid-session — refresh once and retry.
      if (response.status === 401) {
        await silentRefresh();
        response = await doFetch();
      }

      return response;
    },
    [silentRefresh],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
