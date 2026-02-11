"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "@/lib/types";
import { ADMIN_GITHUB_NICKNAME } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  githubNickname: string;
  displayName: string | null;
  role: UserRole;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (githubNickname: string, password: string) => Promise<void>;
  register: (
    githubNickname: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "fohlio-course-session";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveRole(githubNickname: string): UserRole {
  return githubNickname.toLowerCase() === ADMIN_GITHUB_NICKNAME.toLowerCase()
    ? "admin"
    : "student";
}

function persistUser(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // localStorage may be unavailable (SSR, privacy mode, quota exceeded).
  }
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function clearPersistedUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore.
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = loadUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (githubNickname: string, _password: string): Promise<void> => {
      // Stub implementation -- no real password verification.
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        githubNickname,
        displayName: null,
        role: resolveRole(githubNickname),
      };
      persistUser(newUser);
      setUser(newUser);
    },
    [],
  );

  const register = useCallback(
    async (
      githubNickname: string,
      _password: string,
      displayName?: string,
    ): Promise<void> => {
      const newUser: AuthUser = {
        id: crypto.randomUUID(),
        githubNickname,
        displayName: displayName ?? null,
        role: resolveRole(githubNickname),
      };
      persistUser(newUser);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    clearPersistedUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
