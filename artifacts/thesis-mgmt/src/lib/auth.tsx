import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, RegisterInputRole } from "@workspace/api-client-react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: RegisterInputRole; faculty?: string; department?: string; phoneNumber?: string }) => Promise<void>;
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
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
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

  const login = async (data: { email: string; password: string }) : Promise<void> => {
    const res = await apiLogin(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("thesis_token", res.token);
  };

  const registerUser = async (data: { email: string; password: string; firstName: string; lastName: string; role: RegisterInputRole; faculty?: string; department?: string; phoneNumber?: string }) => {
    const res = await apiRegister(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("thesis_token", res.token);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
    }
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
