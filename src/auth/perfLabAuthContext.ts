import { createContext } from "react";

import type { UserResponse } from "../types";

export type AuthContextValue = {
  token: string | null;
  user: UserResponse | null;
  email: string;
  setEmail: (e: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
