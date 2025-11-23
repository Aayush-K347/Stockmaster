import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { firebaseAuth } from '../firebaseClient';

interface AuthUser {
  id?: number;
  email: string;
  fullName?: string;
  roles?: string[];
}

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user?: AuthUser;
  token?: string;
  apiFetch: <T = unknown>(path: string, options?: RequestInit) => Promise<T>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [backendUser, setBackendUser] = useState<AuthUser | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [trackedLogin, setTrackedLogin] = useState(false);
  const ready = Boolean(import.meta.env.VITE_API_URL);

  const apiFetch = useMemo(
    () => async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      const idToken = token;
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setBackendUser(undefined);
        }
        let message = await res.text();
        try {
          const parsed = JSON.parse(message);
          message = parsed.message || message;
        } catch {
          // ignore JSON parse failures
        }
        throw new Error(message || 'Request failed');
      }
      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    },
    [token]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!fbUser) {
        setBackendUser(undefined);
        setToken(undefined);
        setIsSignedIn(false);
        setTrackedLogin(false);
        setIsLoaded(true);
        return;
      }
      const idToken = await fbUser.getIdToken();
      setToken(idToken);
      setIsSignedIn(true);
      setIsLoaded(true);
      if (!ready || !fbUser.email) return;
      try {
        const authHeaders = { Authorization: `Bearer ${idToken}` };
        const data = await apiFetch<{ user: AuthUser }>('/auth/sync', {
          method: 'POST',
          headers: authHeaders,
        });
        setBackendUser(data.user);
        if (!trackedLogin) {
          await apiFetch('/auth/track', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ event: 'login' }),
          });
          setTrackedLogin(true);
        }
      } catch (err) {
        console.error('Auth sync failed', err);
      }
    });
    return () => unsub();
  }, [apiFetch, ready, trackedLogin]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  };

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const idToken = await cred.user.getIdToken();
    setToken(idToken);
    try {
      const authHeaders = { Authorization: `Bearer ${idToken}` };
      await apiFetch('/auth/sync', { method: 'POST', headers: authHeaders });
      await apiFetch('/auth/track', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ event: 'signup' }),
      });
      setTrackedLogin(true);
    } catch (err) {
      console.error('Signup sync failed', err);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/track', { method: 'POST', body: JSON.stringify({ event: 'logout' }) });
    } catch (e) {
      // ignore
    }
    await firebaseAuth.signOut();
    setBackendUser(undefined);
    setTrackedLogin(false);
  };

  const mergedUser: AuthUser | undefined = backendUser;

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        user: mergedUser,
        token,
        apiFetch,
        login,
        signup,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
