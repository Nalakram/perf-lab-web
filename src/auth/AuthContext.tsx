import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as api from "../api/perfLabClient";
import type { UserResponse } from "../types";
import { AuthContext, type AuthContextValue } from "./perfLabAuthContext";
import { setUnauthorizedHandler } from "./sessionBridge";
import {
  clearStoredSession,
  getStoredEmail,
  getStoredToken,
  setStoredEmail,
  setStoredToken,
} from "./tokenStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<UserResponse | null>(null);
  const [email, setEmail] = useState(() => getStoredEmail() ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredSession();
      setToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const u = await api.fetchMe(token);
        if (!cancelled) setUser(u);
      } catch {
        if (!cancelled) logout();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const login = useCallback(async (emailIn: string, password: string) => {
    setIsLoading(true);
    try {
      const tr = await api.login(emailIn, password);
      setStoredToken(tr.access_token);
      setStoredEmail(emailIn);
      setEmail(emailIn);
      setToken(tr.access_token);
      const u = await api.fetchMe(tr.access_token);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (emailIn: string, password: string) => {
      setIsLoading(true);
      try {
        await api.register(emailIn, password);
        await login(emailIn, password);
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      email,
      setEmail,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      register,
      logout,
    }),
    [token, user, email, isLoading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
