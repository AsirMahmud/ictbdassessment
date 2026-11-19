"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  designation?: string;
  branch_id?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  registerCustomer: (payload: any) => Promise<any>;
  loginCustomerByPhone: (phone: string, name?: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => { throw new Error("Authentication unavailable"); },
  registerCustomer: async () => { throw new Error("Registration unavailable"); },
  loginCustomerByPhone: async () => { throw new Error("Authentication unavailable"); },
  logout: () => {},
  loading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore only a session that the backend confirms. Never create a demo session.
    const savedToken = localStorage.getItem("dcms_token");

    if (savedToken) {
      fetchApi<UserProfile>("/auth/me")
        .then((currentUser) => {
          setToken(savedToken);
          setUser(currentUser);
          localStorage.setItem("dcms_user", JSON.stringify(currentUser));
        })
        .catch(() => {
          localStorage.removeItem("dcms_token");
          localStorage.removeItem("dcms_user");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("dcms_token", res.access_token);
      localStorage.setItem("dcms_user", JSON.stringify(res.user));
      return res.user as UserProfile;
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (payload: any) => {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/auth/register-customer", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.access_token && res.user) {
        setToken(res.access_token);
        setUser(res.user);
        localStorage.setItem("dcms_token", res.access_token);
        localStorage.setItem("dcms_user", JSON.stringify(res.user));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const loginCustomerByPhone = async (phone: string, name?: string) => {
    setLoading(true);
    try {
      const res = await fetchApi<any>("/auth/customer-login-by-phone", {
        method: "POST",
        body: JSON.stringify({ phone, name }),
      });
      if (res.access_token && res.user) {
        setToken(res.access_token);
        setUser(res.user);
        localStorage.setItem("dcms_token", res.access_token);
        localStorage.setItem("dcms_user", JSON.stringify(res.user));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dcms_token");
    localStorage.removeItem("dcms_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, registerCustomer, loginCustomerByPhone, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
