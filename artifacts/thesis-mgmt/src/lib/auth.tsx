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
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("thesis_token"));
  const [isLoading, setIsLoading] = useState(true);

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
    localStorage.setItem("thesis_token", json.token);
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    setToken(null);
    setUser(null);
    localStorage.removeItem("thesis_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register: registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
