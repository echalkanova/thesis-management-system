import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, RegisterInputRole } from "@workspace/api-client-react";
import { login as apiLogin, logout as apiLogout, getMe, setAuthTokenGetter } from "@workspace/api-client-react";

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: RegisterInputRole;
  faculty?: string;
  department?: string;
  phoneNumber?: string;
  facultyNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeRole: string | null;
  originalRole: string | null;
  canSwitchRole: boolean;
  alternativeRole: string[];
  switchRole: (targetRole?: string) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getAlternativeRoles(role: string | undefined): string[] {
  if (role === "supervisor") return ["reviewer"];
  if (role === "reviewer") return ["supervisor"];
  if (role === "department_head") return ["supervisor", "reviewer"];
  return [];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("thesis_token"));
  const [isLoading, setIsLoading] = useState(true);
  // activeRole е текущата активна роля (може да е различна от user.role)
  const [activeRole, setActiveRole] = useState<string | null>(null);
  // originalRole е истинската роля от БД
  const [originalRole, setOriginalRole] = useState<string | null>(null);

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("thesis_token"));
  }, []);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("thesis_token");
      if (!storedToken) { setIsLoading(false); return; }
      try {
        const userData = await getMe();
        setUser(userData);
        setActiveRole(userData.role);
        setOriginalRole(userData.role);
      } catch {
        setToken(null);
        localStorage.removeItem("thesis_token");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (data: { email: string; password: string }): Promise<void> => {
    const res = await apiLogin(data);
    setToken(res.token);
    setUser(res.user);
    setActiveRole(res.user.role);
    setOriginalRole(res.user.role);
    localStorage.setItem("thesis_token", res.token);
  };

  const registerUser = async (data: RegisterData): Promise<void> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Грешка при регистрация");
    setToken(json.token);
    setUser(json.user);
    setActiveRole(json.user.role);
    setOriginalRole(json.user.role);
    localStorage.setItem("thesis_token", json.token);
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    setToken(null);
    setUser(null);
    setActiveRole(null);
    setOriginalRole(null);
    localStorage.removeItem("thesis_token");
  };

  const alternativeRoles = getAlternativeRoles(originalRole ?? undefined);
  const canSwitchRole = alternativeRoles.length > 0;

  const switchRole = (targetRole?: string) => {
    if (!canSwitchRole || !originalRole) return;
    if (targetRole) {
      setActiveRole(targetRole);
    } else {
      // Toggle между оригиналната роля и първата алтернативна
      setActiveRole(prev =>
        prev === originalRole ? alternativeRoles[0] : originalRole
      );
    }
  };

  // effectiveUser използва activeRole като роля
  const effectiveUser = user && activeRole
    ? { ...user, role: activeRole as RegisterInputRole }
    : user;

  return (
    <AuthContext.Provider value={{
      user: effectiveUser,
      token,
      isLoading,
      activeRole,
      originalRole,
      canSwitchRole,
      alternativeRole: alternativeRoles,
      switchRole,
      login,
      register: registerUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
