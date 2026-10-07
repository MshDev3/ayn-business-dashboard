import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEMO_ACCOUNT, STORAGE_KEYS } from '../constants';
import { readJson, removeKey, writeJson } from '../utils/storage';

/**
 * DEMO AUTHENTICATION ONLY.
 * There is no backend. A "session" is just a flag in browser storage, which anyone using
 * the browser can read or edit. It exists to demonstrate route protection and login UX,
 * not to secure anything.
 */

interface Session {
  email: string;
  signedInAt: string;
}

interface AuthValue {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

function readSession(): Session | null {
  return (
    readJson<Session | null>(STORAGE_KEYS.auth, null, 'local') ??
    readJson<Session | null>(STORAGE_KEYS.auth, null, 'session')
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  const login = useCallback<AuthValue['login']>(async (email, password, remember) => {
    // Simulated network latency so the loading state is visible.
    await new Promise((resolve) => setTimeout(resolve, 700));
    const valid =
      email.trim().toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
    if (!valid) throw new InvalidCredentialsError();

    const next: Session = { email: DEMO_ACCOUNT.email, signedInAt: new Date().toISOString() };
    removeKey(STORAGE_KEYS.auth, 'local');
    removeKey(STORAGE_KEYS.auth, 'session');
    writeJson(STORAGE_KEYS.auth, next, remember ? 'local' : 'session');
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    removeKey(STORAGE_KEYS.auth, 'local');
    removeKey(STORAGE_KEYS.auth, 'session');
    setSession(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ isAuthenticated: session !== null, email: session?.email ?? null, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
